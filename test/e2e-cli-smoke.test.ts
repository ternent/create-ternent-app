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
    "scaffolds an app-shell React app through the compiled binary",
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
          tier: "app-shell",
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
    const createAppApi = await readFile(
      join(projectRoot, "src", "app", "api", "createAppApi.ts"),
      "utf8",
    );
    const appView = await readFile(join(projectRoot, "src", "App.tsx"), "utf8");
    const onboardingScreen = await readFile(
      join(projectRoot, "src", "components", "MnemonicOnboardingScreen.tsx"),
      "utf8",
    );
    const config = await readFile(join(projectRoot, "src", "ternent.config.ts"), "utf8");
    const packageJson = await readFile(join(projectRoot, "package.json"), "utf8");
    await access(join(projectRoot, ".gitignore"));

    expect(useTernent).toContain("createAppApi");
    expect(createAppApi).toContain("identity:");
    expect(createAppApi).toContain("users:");
    expect(createAppApi).toContain("permissions:");
    expect(createAppApi).toContain("storage:");
    expect(createAppApi).toContain("status:");
    expect(createAppApi).toContain("createOnboardingDraft");
    expect(createAppApi).toContain("unlockWithPassword");
    expect(tasksPlugin).toContain("audienceType");
    expect(tasksPlugin).toContain("columnId");
    expect(tasksPlugin).toContain("selectVisibleTasks");
    expect(appView).toContain("api.identity.getActiveIdentity()");
    expect(appView).toContain("api.permissions.readableForViewer()");
    expect(appView).toContain("api.tasks.visible()");
    expect(onboardingScreen).toContain("onCreateDraft");
    expect(onboardingScreen).toContain("onUnlock");
    expect(appView).not.toContain('["alpha", "bravo", "charlie", "delta", "echo", "foxtrot"]');
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

  it(
    "scaffolds an integrate-existing React host module through the compiled binary",
    async () => {
      const destinationRoot = await mkdtemp(join(tmpdir(), "ternent-e2e-host-"));
      tempRoots.push(destinationRoot);

      await access(destinationRoot);
      await readFile(
        await (async () => {
          const path = join(destinationRoot, "package.json");
          await import("node:fs/promises").then(({ writeFile }) =>
            writeFile(path, '{ "name": "existing-host", "private": true, "type": "module" }\n', "utf8"),
          );
          return path;
        })(),
        "utf8",
      );
      await import("node:fs/promises").then(({ mkdir, writeFile }) =>
        mkdir(join(destinationRoot, "src"), { recursive: true }).then(() =>
          writeFile(join(destinationRoot, "src", "main.tsx"), "export const host = true;\n", "utf8"),
        ),
      );

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
            projectName: "existing-host",
            tier: "integrate-existing",
            framework: "react",
            sourceRoot: "src",
            integrationStyle: "isolated-module",
            integrationMutationMode: "safe-report-only",
            features: ["system-users", "system-permissions"],
          }),
        },
        timeout: 30_000,
      });

      const ternentConfig = await readFile(join(destinationRoot, "ternent.config.ts"), "utf8");
      const hostMain = await readFile(join(destinationRoot, "src", "main.tsx"), "utf8");
      const hostPackageJson = await readFile(join(destinationRoot, "package.json"), "utf8");
      const createTernentApi = await readFile(
        join(destinationRoot, "src", "ternent", "api", "createTernentApi.ts"),
        "utf8",
      );
      const panel = await readFile(
        join(destinationRoot, "src", "ternent", "ui", "TernentPanel.tsx"),
        "utf8",
      );
      const integrationReport = await readFile(
        join(destinationRoot, "ternent.integration-report.md"),
        "utf8",
      );

      expect(hostMain).toContain("host = true");
      expect(hostPackageJson).toContain('"name": "existing-host"');
      expect(ternentConfig).toContain("systemModules:");
      expect(ternentConfig).toContain("users: true");
      expect(ternentConfig).toContain("permissions: true");
      expect(createTernentApi).toContain("createOnboardingDraft");
      expect(createTernentApi).toContain("readableForViewer");
      expect(panel).toContain("useTernent");
      expect(integrationReport).toContain("package.json was not modified");
      expect(createTernentApi).not.toContain("__PROJECT_NAME__");
      expect(ternentConfig).not.toContain("__FEATURE_IDENTITY__");
    },
    30_000,
  );
});
