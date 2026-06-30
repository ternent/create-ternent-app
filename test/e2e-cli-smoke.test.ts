import { access, mkdtemp, readFile, rm } from "node:fs/promises";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it } from "vitest";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const tempRoots: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempRoots.splice(0, tempRoots.length).map(async (path) => {
      await rm(path, { recursive: true, force: true });
    }),
  );
});

describe("E2E CLI smoke", () => {
  it(
    "scaffolds a full-app-scaffold React app through the compiled binary",
    async () => {
    const destinationRoot = await mkdtemp(join(tmpdir(), "ternent-e2e-"));
    tempRoots.push(destinationRoot);

    const repoRoot = resolve(__dirname, "..");
    const nodeBinary = process.execPath;
    const binPath = join(repoRoot, "bin", "index.js");
    const tscPath = join(repoRoot, "node_modules", "typescript", "bin", "tsc");

    await execFileAsync(nodeBinary, [tscPath, "-p", "tsconfig.build.json"], {
      cwd: repoRoot,
      env: process.env,
      timeout: 30_000,
    });

    await execFileAsync(nodeBinary, [binPath], {
      cwd: destinationRoot,
      env: {
        ...process.env,
        CREATE_TERNENT_APP_PRESET: JSON.stringify({
          projectName: "e2e-workspace",
          tier: "full-app-scaffold",
          framework: "react",
          features: ["system-users", "system-permissions", "snapshot-engine"],
        }),
      },
      timeout: 30_000,
    });

    const projectRoot = join(destinationRoot, "e2e-workspace");
    const useTernent = await readFile(
      join(projectRoot, "src", "hooks", "useTernent.ts"),
      "utf8",
    );
    const tasksPlugin = await readFile(
      join(projectRoot, "src", "app", "plugins", "tasks.ts"),
      "utf8",
    );
    const config = await readFile(join(projectRoot, "src", "ternent.config.ts"), "utf8");
    const packageJson = await readFile(join(projectRoot, "package.json"), "utf8");
    await access(join(projectRoot, ".gitignore"));

    expect(useTernent).toContain("createAppApi");
    expect(tasksPlugin).toContain("audienceType");
    expect(tasksPlugin).toContain("columnId");
    expect(config).toContain("systemModules:");
    expect(config).toContain("users: true");
    expect(config).toContain("permissions: true");
    expect(packageJson).toContain('"name": "e2e-workspace"');
    expect(packageJson).toContain('"packageManager": "pnpm@11.7.0"');
    expect(packageJson).toContain('"typecheck": "tsc -p tsconfig.json --noEmit"');

    expect(useTernent).not.toContain("__PROJECT_NAME__");
    expect(tasksPlugin).not.toContain("__PROJECT_NAME__");
    expect(config).not.toContain("__PROJECT_NAME__");
    expect(packageJson).not.toContain("__PROJECT_NAME__");
    expect(tasksPlugin).not.toContain("__FEATURE_IDENTITY__");
    expect(tasksPlugin).not.toContain("__FEATURE_PERMISSIONS__");
    expect(tasksPlugin).not.toContain("__FEATURE_AGE_ENCRYPTION__");
    expect(config).not.toContain("__FEATURE_IDENTITY__");
    expect(config).not.toContain("__FEATURE_PERMISSIONS__");
    expect(config).not.toContain("__FEATURE_AGE_ENCRYPTION__");
    },
    30_000,
  );
});
