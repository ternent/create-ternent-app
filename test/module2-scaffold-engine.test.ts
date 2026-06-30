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
});
