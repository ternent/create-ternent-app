export type ScaffoldTier = "core-only" | "functional-blueprint" | "full-app-scaffold";

export type FrontendFramework = "react" | "vue" | "svelte";

export type CoreFeature =
  | "system-users"
  | "system-permissions"
  | "snapshot-engine";

export type PromptSelectOption<TValue extends string> = {
  label: string;
  value: TValue;
  hint: string;
};

export type PromptDriver = {
  text(input: { name: string; message: string; placeholder?: string }): Promise<string>;
  select<TValue extends string>(input: {
    name: string;
    message: string;
    options: PromptSelectOption<TValue>[];
  }): Promise<TValue>;
  multiselect<TValue extends string>(input: {
    name: string;
    message: string;
    options: PromptSelectOption<TValue>[];
    initialValues?: TValue[];
  }): Promise<TValue[]>;
};

export type PromptWizardResult = {
  projectName: string;
  tier: ScaffoldTier;
  framework: FrontendFramework | null;
  features: CoreFeature[];
};

const tierOptions: PromptSelectOption<ScaffoldTier>[] = [
  {
    label: "Core Only",
    value: "core-only",
    hint: "Cryptographic runtimes and definitions only",
  },
  {
    label: "Functional Blueprint",
    value: "functional-blueprint",
    hint: "Barebone state logging using Vanilla HTML/TS",
  },
  {
    label: "Full App Scaffold",
    value: "full-app-scaffold",
    hint: "Complete interactive platform workspace setup",
  },
];

const frameworkOptions: PromptSelectOption<FrontendFramework>[] = [
  {
    label: "React",
    value: "react",
    hint: "Vite + TS",
  },
  {
    label: "Vue",
    value: "vue",
    hint: "Vite + TS",
  },
  {
    label: "Svelte",
    value: "svelte",
    hint: "Vite + TS",
  },
];

const featureOptions: PromptSelectOption<CoreFeature>[] = [
  {
    label: "System Users & Identity",
    value: "system-users",
    hint: "Native identity and users system module",
  },
  {
    label: "System Permissions & Audience Privacy",
    value: "system-permissions",
    hint: "Native permissions and privacy system module",
  },
  {
    label: "Snapshot Engine & Local Ledger Cache",
    value: "snapshot-engine",
    hint: "Replay acceleration and local persistence",
  },
];

const defaultFeatureSelection: CoreFeature[] = featureOptions.map((option) => option.value);

function normalizeProjectName(value: string): string {
  const normalized = value.trim();
  if (!normalized) {
    throw new Error("Project name is required.");
  }
  return normalized;
}

export async function runPromptWizard(driver: PromptDriver): Promise<PromptWizardResult> {
  const projectName = normalizeProjectName(
    await driver.text({
      name: "projectName",
      message: "Project Name",
      placeholder: "zero-knowledge-vault",
    }),
  );

  const tier = await driver.select({
    name: "tier",
    message: "Select Core Layer Profile",
    options: tierOptions,
  });

  if (tier === "core-only") {
    return {
      projectName,
      tier,
      framework: null,
      features: [],
    };
  }

  let framework: FrontendFramework | null = null;

  if (tier === "full-app-scaffold") {
    framework = await driver.select({
      name: "framework",
      message: "Select Frontend Framework UI",
      options: frameworkOptions,
    });
  } else if (tier === "functional-blueprint") {
    framework = null;
  }

  const features = await driver.multiselect({
    name: "features",
    message: "Select Default Core Components",
    options: featureOptions,
    initialValues: defaultFeatureSelection,
  });

  return {
    projectName,
    tier,
    framework,
    features,
  };
}
