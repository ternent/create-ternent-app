import { cp, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import type {
  CoreFeature,
  FrontendFramework,
  ScaffoldTier,
} from "../cli/prompt-wizard.js";

export type ScaffoldProjectInput = {
  tier: ScaffoldTier;
  projectName: string;
  destinationRoot: string;
  templatesRoot: string;
  framework?: FrontendFramework | null;
  features?: CoreFeature[];
};

function resolveTemplateSources(input: ScaffoldProjectInput): string[] {
  if (input.tier === "core-only") {
    return [join(input.templatesRoot, "core-only", "base")];
  }

  if (input.tier === "functional-blueprint") {
    return [join(input.templatesRoot, "functional-blueprint", "base")];
  }

  if (input.tier === "full-app-scaffold") {
    if (!input.framework) {
      throw new Error("A frontend framework is required for the full-app-scaffold tier.");
    }

    return [
      join(input.templatesRoot, "full-app-scaffold", "base"),
      join(input.templatesRoot, "full-app-scaffold", input.framework),
    ];
  }

  throw new Error(`Scaffold tier '${input.tier}' is not supported by the copy engine yet.`);
}

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
  const projectRoot = join(input.destinationRoot, input.projectName);
  const templateSources = resolveTemplateSources(input);
  const variables = createTemplateVariables(input);

  await assertDestinationReady(projectRoot);
  await mkdir(projectRoot, { recursive: true });

  for (const templateSource of templateSources) {
    await cp(templateSource, projectRoot, { recursive: true });
  }

  await transformGeneratedFiles(projectRoot, variables);

  return { projectRoot };
}
