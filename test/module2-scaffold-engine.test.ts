import { mkdtemp, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it } from "vitest";
import { scaffoldProject } from "../src/scaffold/scaffold-engine.js";

async function writeFixtureFile(path: string, contents: string) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, contents, "utf8");
}

async function createTemplatesRoot() {
  const root = await mkdtemp(join(tmpdir(), "ternent-module2-templates-"));

  await writeFixtureFile(
    join(root, "core-only", "base", "src", "ternent.config.ts"),
    "export const config = 'core';\n",
  );
  await writeFixtureFile(
    join(root, "core-only", "base", "src", "plugins", "tasks.ts"),
    "export const tasks = 'core-plugin';\n",
  );

  await writeFixtureFile(
    join(root, "functional-blueprint", "base", "src", "main.ts"),
    "console.log('blueprint');\n",
  );
  await writeFixtureFile(
    join(root, "functional-blueprint", "base", "index.html"),
    "<!doctype html><title>Blueprint</title>\n",
  );
  await writeFixtureFile(
    join(root, "functional-blueprint", "react", "vite.config.ts"),
    "export default 'react';\n",
  );
  await writeFixtureFile(
    join(root, "functional-blueprint", "vue", "vite.config.ts"),
    "export default 'vue';\n",
  );

  await writeFixtureFile(
    join(root, "integrate-existing", "base-root", "ternent.config.ts"),
    "export const ternentEngine = '__PROJECT_NAME__';\n",
  );
  await writeFixtureFile(
    join(root, "integrate-existing", "isolated-module", "api", "createTernentApi.ts"),
    "export const api = '__PROJECT_NAME__';\n",
  );
  await writeFixtureFile(
    join(root, "integrate-existing", "isolated-module", "plugins", "tasks.ts"),
    "export const tasks = 'integrated-tasks';\n",
  );
  await writeFixtureFile(
    join(root, "integrate-existing", "plugin-api-seams-only", "createTernentApi.ts"),
    "export const api = '__PROJECT_NAME__';\n",
  );
  await writeFixtureFile(
    join(root, "integrate-existing", "plugin-api-seams-only", "plugins", "tasks.ts"),
    "export const tasks = 'seams-only-tasks';\n",
  );
  await writeFixtureFile(
    join(root, "integrate-existing", "react", "useTernent.ts"),
    "export const useTernent = () => 'react';\n",
  );
  await writeFixtureFile(
    join(root, "integrate-existing", "react", "ui", "TernentPanel.tsx"),
    "export const TernentPanel = () => '__PROJECT_NAME__';\n",
  );

  return root;
}

async function listRelativeFiles(root: string, current = root, acc: string[] = []): Promise<string[]> {
  const entries = await readdir(current, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(current, entry.name);
    if (entry.isDirectory()) {
      await listRelativeFiles(root, fullPath, acc);
      continue;
    }
    acc.push(fullPath.slice(root.length + 1));
  }

  return acc.sort();
}

const tempRoots: string[] = [];

afterEach(async () => {
  const { rm } = await import("node:fs/promises");
  await Promise.all(
    tempRoots.splice(0, tempRoots.length).map(async (path) => {
      await rm(path, { recursive: true, force: true });
    }),
  );
});

describe("Module 2 scaffold engine", () => {
  it("creates the target directory and copies only core template files for core-only", async () => {
    const templatesRoot = await createTemplatesRoot();
    const destinationRoot = await mkdtemp(join(tmpdir(), "ternent-module2-dest-"));
    tempRoots.push(templatesRoot, destinationRoot);

    await scaffoldProject({
      tier: "core-only",
      projectName: "my-core-app",
      destinationRoot,
      templatesRoot,
    });

    const projectRoot = join(destinationRoot, "my-core-app");
    expect(await listRelativeFiles(projectRoot)).toEqual([
      "src/plugins/tasks.ts",
      "src/ternent.config.ts",
    ]);
    expect(await readFile(join(projectRoot, "src", "ternent.config.ts"), "utf8")).toContain("core");
  });

  it("writes vanilla blueprint files and skips framework configs for functional-blueprint", async () => {
    const templatesRoot = await createTemplatesRoot();
    const destinationRoot = await mkdtemp(join(tmpdir(), "ternent-module2-dest-"));
    tempRoots.push(templatesRoot, destinationRoot);

    await scaffoldProject({
      tier: "functional-blueprint",
      projectName: "my-blueprint",
      destinationRoot,
      templatesRoot,
    });

    const projectRoot = join(destinationRoot, "my-blueprint");
    expect(await listRelativeFiles(projectRoot)).toEqual(["index.html", "src/main.ts"]);
    expect(await readFile(join(projectRoot, "src", "main.ts"), "utf8")).toContain("blueprint");
  });

  it("throws a clear error when the destination directory already exists and is not empty", async () => {
    const templatesRoot = await createTemplatesRoot();
    const destinationRoot = await mkdtemp(join(tmpdir(), "ternent-module2-dest-"));
    const projectRoot = join(destinationRoot, "my-core-app");
    tempRoots.push(templatesRoot, destinationRoot);

    await mkdir(projectRoot, { recursive: true });
    await writeFile(join(projectRoot, "README.md"), "already here\n", "utf8");

    await expect(
      scaffoldProject({
        tier: "core-only",
        projectName: "my-core-app",
        destinationRoot,
        templatesRoot,
      }),
    ).rejects.toThrow("Destination directory already exists and is not empty");
  });

  it("adds an isolated ternent module into an existing host source root without disturbing host files", async () => {
    const templatesRoot = await createTemplatesRoot();
    const destinationRoot = await mkdtemp(join(tmpdir(), "ternent-module2-dest-"));
    tempRoots.push(templatesRoot, destinationRoot);

    await writeFixtureFile(join(destinationRoot, "package.json"), '{ "name": "existing-host" }\n');
    await writeFixtureFile(join(destinationRoot, "src", "main.tsx"), "export const host = true;\n");
    await writeFixtureFile(join(destinationRoot, "src", "router.ts"), "export const router = true;\n");

    const { projectRoot } = await scaffoldProject({
      tier: "integrate-existing",
      projectName: "existing-host",
      destinationRoot,
      templatesRoot,
      framework: "react",
      sourceRoot: "src",
      integrationStyle: "isolated-module",
      integrationMutationMode: "safe-report-only",
      features: ["system-users"],
    });

    expect(projectRoot).toBe(destinationRoot);
    expect(await readFile(join(destinationRoot, "src", "main.tsx"), "utf8")).toContain("host = true");
    expect(await readFile(join(destinationRoot, "src", "router.ts"), "utf8")).toContain("router = true");
    expect(await readFile(join(destinationRoot, "package.json"), "utf8")).toContain('"name": "existing-host"');
    expect(await readFile(join(destinationRoot, "ternent.config.ts"), "utf8")).toContain("existing-host");
    const integrationReport = await readFile(
      join(destinationRoot, "ternent.integration-report.md"),
      "utf8",
    );
    expect(integrationReport).toContain("package.json was not modified");
    expect(integrationReport).toContain("`src/ternent/ui`");
    expect(integrationReport).toContain("`src/ternent/useTernent.ts`");
    expect(await readFile(join(destinationRoot, "src", "ternent", "api", "createTernentApi.ts"), "utf8")).toContain("existing-host");
    expect(await readFile(join(destinationRoot, "src", "ternent", "ui", "TernentPanel.tsx"), "utf8")).toContain("existing-host");
  });

  it("adds a seams-only ternent integration shape into an existing host", async () => {
    const templatesRoot = await createTemplatesRoot();
    const destinationRoot = await mkdtemp(join(tmpdir(), "ternent-module2-dest-"));
    tempRoots.push(templatesRoot, destinationRoot);

    await writeFixtureFile(join(destinationRoot, "package.json"), '{ "name": "existing-host" }\n');
    await writeFixtureFile(join(destinationRoot, "src", "main.tsx"), "export const host = true;\n");

    await scaffoldProject({
      tier: "integrate-existing",
      projectName: "existing-host",
      destinationRoot,
      templatesRoot,
      framework: "react",
      sourceRoot: "src",
      integrationStyle: "plugin-api-seams-only",
      integrationMutationMode: "safe-report-only",
      features: ["system-users"],
    });

    expect(await readFile(join(destinationRoot, "src", "ternent", "createTernentApi.ts"), "utf8")).toContain("existing-host");
    expect(await readFile(join(destinationRoot, "src", "ternent", "useTernent.ts"), "utf8")).toContain("react");
    await expect(readFile(join(destinationRoot, "src", "ternent", "api", "createTernentApi.ts"), "utf8")).rejects.toThrow();
  });

  it("throws a clear error when the target ternent integration root already exists and is not empty", async () => {
    const templatesRoot = await createTemplatesRoot();
    const destinationRoot = await mkdtemp(join(tmpdir(), "ternent-module2-dest-"));
    tempRoots.push(templatesRoot, destinationRoot);

    await writeFixtureFile(join(destinationRoot, "src", "ternent", "README.md"), "already here\n");

    await expect(
      scaffoldProject({
        tier: "integrate-existing",
        projectName: "existing-host",
        destinationRoot,
        templatesRoot,
      framework: "react",
      sourceRoot: "src",
      integrationStyle: "isolated-module",
      integrationMutationMode: "safe-report-only",
      features: ["system-users"],
    }),
    ).rejects.toThrow("Ternent integration root already exists and is not empty");
  });

  it("updates package.json only in assisted mode while leaving host router files untouched", async () => {
    const templatesRoot = await createTemplatesRoot();
    const destinationRoot = await mkdtemp(join(tmpdir(), "ternent-module2-dest-"));
    tempRoots.push(templatesRoot, destinationRoot);

    await writeFixtureFile(
      join(destinationRoot, "package.json"),
      JSON.stringify(
        {
          name: "existing-host",
          private: true,
          scripts: {
            dev: "vite",
          },
          dependencies: {
            react: "^18.3.1",
          },
        },
        null,
        2,
      ),
    );
    await writeFixtureFile(join(destinationRoot, "src", "router.ts"), "export const router = true;\n");

    await scaffoldProject({
      tier: "integrate-existing",
      projectName: "existing-host",
      destinationRoot,
      templatesRoot,
      framework: "react",
      sourceRoot: "src",
      integrationStyle: "isolated-module",
      integrationMutationMode: "assisted-package-json",
      features: ["system-users", "system-permissions"],
    });

    const packageJson = JSON.parse(
      await readFile(join(destinationRoot, "package.json"), "utf8"),
    ) as {
      scripts?: Record<string, string>;
      dependencies?: Record<string, string>;
    };

    expect(packageJson.dependencies?.["@ternent/concord"]).toBeDefined();
    expect(packageJson.dependencies?.["@ternent/identity"]).toBeDefined();
    expect(packageJson.dependencies?.["@ternent/ledger"]).toBeDefined();
    expect(packageJson.scripts?.["ternent:check"]).toBe("tsc --noEmit");
    expect(await readFile(join(destinationRoot, "src", "router.ts"), "utf8")).toContain("router = true");
    await expect(readFile(join(destinationRoot, "ternent.integration-report.md"), "utf8")).rejects.toThrow();
  });

  it("writes integration guidance against the chosen source root and adapter shape", async () => {
    const templatesRoot = await createTemplatesRoot();
    const destinationRoot = await mkdtemp(join(tmpdir(), "ternent-module2-dest-"));
    tempRoots.push(templatesRoot, destinationRoot);

    await writeFixtureFile(join(destinationRoot, "package.json"), '{ "name": "existing-host" }\n');
    await writeFixtureFile(join(destinationRoot, "app", "main.ts"), "export const host = true;\n");

    await scaffoldProject({
      tier: "integrate-existing",
      projectName: "existing-host",
      destinationRoot,
      templatesRoot,
      framework: "agnostic",
      sourceRoot: "app",
      integrationStyle: "plugin-api-seams-only",
      integrationMutationMode: "safe-report-only",
      features: ["system-users"],
    });

    const integrationReport = await readFile(
      join(destinationRoot, "ternent.integration-report.md"),
      "utf8",
    );

    expect(integrationReport).toContain("`app/ternent/index.ts`");
    expect(integrationReport).toContain("`app/ternent/createTernentApi.ts`");
    expect(integrationReport).not.toContain("`src/ternent/ui`");
  });
});
