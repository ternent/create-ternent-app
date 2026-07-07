import { access, cp, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import type {
  CoreFeature,
  FrontendFramework,
  IntegrationMutationMode,
  IntegrationStyle,
  ScaffoldTier,
} from "../cli/prompt-wizard.js";

export type ScaffoldProjectInput = {
  tier: ScaffoldTier;
  projectName: string;
  destinationRoot: string;
  templatesRoot: string;
  framework?: FrontendFramework | null;
  sourceRoot?: string | null;
  integrationStyle?: IntegrationStyle | null;
  integrationMutationMode?: IntegrationMutationMode | null;
  features?: CoreFeature[];
};

type CopyPlan = {
  source: string;
  destination: string;
};

function resolveProjectRoot(input: ScaffoldProjectInput): string {
  if (input.tier === "integrate-existing") {
    return input.destinationRoot;
  }

  return join(input.destinationRoot, input.projectName);
}

function resolveCopyPlans(input: ScaffoldProjectInput, projectRoot: string): CopyPlan[] {
  if (input.tier === "core-only") {
    return [
      {
        source: join(input.templatesRoot, "core-only", "base"),
        destination: projectRoot,
      },
    ];
  }

  if (input.tier === "functional-blueprint") {
    return [
      {
        source: join(input.templatesRoot, "functional-blueprint", "base"),
        destination: projectRoot,
      },
    ];
  }

  if (input.tier === "app-shell") {
    if (!input.framework) {
      throw new Error("A frontend framework is required for the app-shell tier.");
    }

    return [
      {
        source: join(input.templatesRoot, "app-shell", "base"),
        destination: projectRoot,
      },
      {
        source: join(input.templatesRoot, "app-shell", input.framework),
        destination: projectRoot,
      },
    ];
  }

  if (input.tier === "integrate-existing") {
    if (!input.framework) {
      throw new Error("A framework is required for the integrate-existing tier.");
    }
    if (!input.sourceRoot) {
      throw new Error("A sourceRoot is required for the integrate-existing tier.");
    }
    if (!input.integrationStyle) {
      throw new Error("An integrationStyle is required for the integrate-existing tier.");
    }
    if (!input.integrationMutationMode) {
      throw new Error("An integrationMutationMode is required for the integrate-existing tier.");
    }

    const integrationRoot = join(projectRoot, input.sourceRoot, "ternent");
    const plans: CopyPlan[] = [
      {
        source: join(input.templatesRoot, "integrate-existing", "base-root"),
        destination: projectRoot,
      },
      {
        source: join(input.templatesRoot, "integrate-existing", input.integrationStyle),
        destination: integrationRoot,
      },
    ];

    if (input.framework !== "agnostic") {
      plans.push({
        source: join(input.templatesRoot, "integrate-existing", input.framework),
        destination: integrationRoot,
      });
    }

    return plans;
  }

  throw new Error(`Scaffold tier '${input.tier}' is not supported by the copy engine yet.`);
}

type PackageJson = {
  dependencies?: Record<string, string>;
  scripts?: Record<string, string>;
  [key: string]: unknown;
};

const integrateExistingDependencies: Record<string, string> = {
  "@ternent/concord": "^0.2.9",
  "@ternent/identity": "^0.5.0",
  "@ternent/ledger": "^0.1.8",
};

const integrateExistingScripts: Record<string, string> = {
  "ternent:check": "tsc --noEmit",
};

async function assertDestinationReady(destinationDir: string): Promise<void> {
  try {
    const entries = await readdir(destinationDir);
    if (entries.length > 0) {
      throw new Error("Destination directory already exists and is not empty.");
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return;
    }
    throw error;
  }
}

async function assertFileMissing(path: string, message: string): Promise<void> {
  try {
    await access(path);
    throw new Error(message);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return;
    }
    throw error;
  }
}

async function assertDirectoryReady(path: string, message: string): Promise<void> {
  try {
    const entries = await readdir(path);
    if (entries.length > 0) {
      throw new Error(message);
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return;
    }
    throw error;
  }
}

async function assertScaffoldReady(
  input: ScaffoldProjectInput,
  projectRoot: string,
): Promise<void> {
  if (input.tier !== "integrate-existing") {
    await assertDestinationReady(projectRoot);
    return;
  }

  const sourceRoot = input.sourceRoot ?? "src";
  await assertFileMissing(
    join(projectRoot, "ternent.config.ts"),
    "ternent.config.ts already exists in the target host.",
  );
  await assertDirectoryReady(
    join(projectRoot, sourceRoot, "ternent"),
    "Ternent integration root already exists and is not empty.",
  );
}

function createIntegrationReport(input: ScaffoldProjectInput): string {
  const sourceRoot = input.sourceRoot ?? "src";
  const integrationRoot = `${sourceRoot}/ternent`;
  const uiMountPath =
    input.framework === "agnostic" ? `${integrationRoot}/index.ts` : `${integrationRoot}/ui`;
  const adapterPath =
    input.framework === "agnostic"
      ? `${integrationRoot}/createTernentApi.ts`
      : `${integrationRoot}/useTernent.ts`;
  const dependencyLines = Object.entries(integrateExistingDependencies)
    .map(([name, version]) => `- \`${name}\`: \`${version}\``)
    .join("\n");
  const scriptLines = Object.entries(integrateExistingScripts)
    .map(([name, command]) => `- \`${name}\`: \`${command}\``)
    .join("\n");

  return [
    "# Ternent Integration Report",
    "",
    `Project: \`${input.projectName}\``,
    `Integration style: \`${input.integrationStyle}\``,
    `Source root: \`${input.sourceRoot}\``,
    "",
    "package.json was not modified.",
    "",
    "Recommended dependencies:",
    dependencyLines,
    "",
    "Recommended scripts:",
    scriptLines,
    "",
    "Manual next steps:",
    "- Install the dependencies above in your host app.",
    `- Mount the generated \`${uiMountPath}\` surface into a route or page.`,
    `- Wire the generated \`${adapterPath}\` adapter into your host application.`,
    "",
  ].join("\n");
}

async function applyIntegrationMutationPolicy(
  input: ScaffoldProjectInput,
  projectRoot: string,
): Promise<void> {
  if (input.tier !== "integrate-existing") {
    return;
  }

  if (input.integrationMutationMode === "safe-report-only") {
    await writeFile(
      join(projectRoot, "ternent.integration-report.md"),
      createIntegrationReport(input),
      "utf8",
    );
    return;
  }

  if (input.integrationMutationMode !== "assisted-package-json") {
    return;
  }

  const packageJsonPath = join(projectRoot, "package.json");
  const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8")) as PackageJson;

  packageJson.dependencies = {
    ...integrateExistingDependencies,
    ...(packageJson.dependencies ?? {}),
  };
  packageJson.scripts = {
    ...integrateExistingScripts,
    ...(packageJson.scripts ?? {}),
  };

  await writeFile(`${packageJsonPath}`, `${JSON.stringify(packageJson, null, 2)}\n`, "utf8");
}

function createTemplateVariables(input: ScaffoldProjectInput): Record<string, string> {
  const features = new Set(input.features ?? []);

  return {
    "__PROJECT_NAME__": input.projectName,
    "__FEATURE_IDENTITY__": String(features.has("system-users")),
    "__FEATURE_PERMISSIONS__": String(features.has("system-permissions")),
    "__FEATURE_AGE_ENCRYPTION__": String(features.has("system-permissions")),
  };
}

function isTransformableFile(path: string): boolean {
  return [
    ".json",
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".mjs",
    ".cjs",
    ".html",
    ".md",
    ".vue",
    ".svelte",
  ].includes(extname(path));
}

async function collectFiles(root: string, current = root, acc: string[] = []): Promise<string[]> {
  const entries = await readdir(current, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(current, entry.name);
    if (entry.isDirectory()) {
      await collectFiles(root, fullPath, acc);
      continue;
    }

    acc.push(fullPath);
  }

  return acc;
}

async function transformGeneratedFiles(projectRoot: string, variables: Record<string, string>): Promise<void> {
  const files = await collectFiles(projectRoot);

  for (const filePath of files) {
    if (!isTransformableFile(filePath)) {
      continue;
    }

    let contents = await readFile(filePath, "utf8");

    for (const [token, value] of Object.entries(variables)) {
      contents = contents.split(token).join(value);
    }

    await writeFile(filePath, contents, "utf8");
  }
}

export async function scaffoldProject(input: ScaffoldProjectInput): Promise<{ projectRoot: string }> {
  const projectRoot = resolveProjectRoot(input);
  const copyPlans = resolveCopyPlans(input, projectRoot);
  const variables = createTemplateVariables(input);

  await assertScaffoldReady(input, projectRoot);
  await mkdir(projectRoot, { recursive: true });

  for (const plan of copyPlans) {
    await cp(plan.source, plan.destination, { recursive: true });
  }

  await transformGeneratedFiles(projectRoot, variables);
  await applyIntegrationMutationPolicy(input, projectRoot);

  return { projectRoot };
}
