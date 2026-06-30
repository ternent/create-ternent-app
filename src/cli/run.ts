import { intro, outro } from "@clack/prompts";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { cwd, env } from "node:process";
import { loadClackPromptDriver } from "./clack-driver.js";
import { loadPresetPromptDriverFromEnv } from "./preset-driver.js";
import { runPromptWizard } from "./prompt-wizard.js";
import { scaffoldProject } from "../scaffold/scaffold-engine.js";

function resolveTemplatesRoot(): string {
  const currentDir = dirname(fileURLToPath(import.meta.url));
  return resolve(currentDir, "../../templates");
}

export async function runCli(): Promise<void> {
  intro("create-ternent-app");

  const preset = loadPresetPromptDriverFromEnv(env.CREATE_TERNENT_APP_PRESET);
  const driver = preset?.driver ?? (await loadClackPromptDriver());
  const selection = await runPromptWizard(driver);

  const result = await scaffoldProject({
    ...selection,
    destinationRoot: cwd(),
    templatesRoot: resolveTemplatesRoot(),
  });

  outro(`Scaffolded ${selection.projectName} at ${join(result.projectRoot)}`);
}
