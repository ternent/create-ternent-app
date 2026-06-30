import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it } from "vitest";
import { scaffoldProject } from "../src/scaffold/scaffold-engine.js";

async function writeFixtureFile(path: string, contents: string) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, contents, "utf8");
}

async function createTemplatesRoot() {
  const root = await mkdtemp(join(tmpdir(), "ternent-module3-templates-"));

  await writeFixtureFile(
    join(root, "core-only", "base", "package.json"),
    JSON.stringify(
      {
        name: "__PROJECT_NAME__",
        private: true,
      },
      null,
      2,
    ),
  );
  await writeFixtureFile(
    join(root, "core-only", "base", "src", "ternent.config.ts"),
    [
      "export const ternentEngine = createEngine({",
      "  systemModules: {",
      "    users: __FEATURE_IDENTITY__,",
      "    permissions: __FEATURE_PERMISSIONS__,",
      "  },",
      "  features: {",
      "    ageEncryption: __FEATURE_AGE_ENCRYPTION__,",
      "  },",
      "});",
      "",
    ].join("\n"),
  );

  await writeFixtureFile(
    join(root, "full-app-scaffold", "base", "package.json"),
    JSON.stringify(
      {
        name: "__PROJECT_NAME__",
        private: true,
      },
      null,
      2,
    ),
  );
  await writeFixtureFile(
    join(root, "full-app-scaffold", "base", "src", "ternent.config.ts"),
    [
      "export const ternentEngine = createEngine({",
      "  systemModules: {",
      "    users: __FEATURE_IDENTITY__,",
      "    permissions: __FEATURE_PERMISSIONS__,",
      "  },",
      "  features: {",
      "    ageEncryption: __FEATURE_AGE_ENCRYPTION__,",
      "  },",
      "});",
      "",
    ].join("\n"),
  );
  await writeFixtureFile(
    join(root, "full-app-scaffold", "base", "src", "app", "plugins", "tasks.ts"),
    [
      "export type TaskRecord = {",
      "  audienceType: \"everyone\" | \"user\" | \"permission\";",
      "  columnId: string;",
      "};",
      "",
      "export const taskHandlers = {",
      "  \"task.create\": () => null,",
      "  \"task.move\": () => null,",
      "};",
      "",
    ].join("\n"),
  );
  await writeFixtureFile(
    join(root, "full-app-scaffold", "vue", "vite.config.ts"),
    "export default 'vue';\n",
  );

  return root;
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

describe("Module 3 template variable injection", () => {
  it("injects the scaffolded project name into package.json", async () => {
    const templatesRoot = await createTemplatesRoot();
    const destinationRoot = await mkdtemp(join(tmpdir(), "ternent-module3-dest-"));
    tempRoots.push(templatesRoot, destinationRoot);

    const { projectRoot } = await scaffoldProject({
      tier: "core-only",
      projectName: "user-project-name",
      destinationRoot,
      templatesRoot,
      features: [],
    });

    const packageJson = JSON.parse(await readFile(join(projectRoot, "package.json"), "utf8")) as {
      name: string;
    };

    expect(packageJson.name).toBe("user-project-name");
  });

  it("calibrates ternent.config.ts booleans from the selected feature flags", async () => {
    const templatesRoot = await createTemplatesRoot();
    const destinationRoot = await mkdtemp(join(tmpdir(), "ternent-module3-dest-"));
    tempRoots.push(templatesRoot, destinationRoot);

    const { projectRoot } = await scaffoldProject({
      tier: "core-only",
      projectName: "feature-calibration",
      destinationRoot,
      templatesRoot,
      features: ["system-users"],
    });

    const config = await readFile(join(projectRoot, "src", "ternent.config.ts"), "utf8");

    expect(config).toContain("systemModules:");
    expect(config).toContain("users: true");
    expect(config).toContain("permissions: false");
    expect(config).toContain("ageEncryption: false");
  });

  it("includes the production task payload structures and handlers in tier-3 output", async () => {
    const templatesRoot = await createTemplatesRoot();
    const destinationRoot = await mkdtemp(join(tmpdir(), "ternent-module3-dest-"));
    tempRoots.push(templatesRoot, destinationRoot);

    const { projectRoot } = await scaffoldProject({
      tier: "full-app-scaffold",
      projectName: "workspace-shell",
      destinationRoot,
      templatesRoot,
      framework: "vue",
      features: ["system-users", "system-permissions"],
    });

    const packageJson = JSON.parse(await readFile(join(projectRoot, "package.json"), "utf8")) as {
      name: string;
    };
    const config = await readFile(join(projectRoot, "src", "ternent.config.ts"), "utf8");
    const tasksPlugin = await readFile(
      join(projectRoot, "src", "app", "plugins", "tasks.ts"),
      "utf8",
    );

    expect(packageJson.name).toBe("workspace-shell");
    expect(config).toContain("systemModules:");
    expect(config).toContain("users: true");
    expect(config).toContain("permissions: true");
    expect(config).toContain("ageEncryption: true");
    expect(tasksPlugin).toContain("audienceType");
    expect(tasksPlugin).toContain("columnId");
    expect(tasksPlugin).toContain('"task.create"');
    expect(tasksPlugin).toContain('"task.move"');
  });
});
