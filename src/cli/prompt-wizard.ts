export type ScaffoldTier =
  | "core-only"
  | "functional-blueprint"
  | "app-shell"
  | "integrate-existing";

export type FrontendFramework = "react" | "vue" | "svelte" | "agnostic";

export type IntegrationStyle = "isolated-module" | "plugin-api-seams-only";
export type IntegrationMutationMode = "safe-report-only" | "assisted-package-json";

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
  sourceRoot: string | null;
  integrationStyle: IntegrationStyle | null;
  integrationMutationMode: IntegrationMutationMode | null;
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
    label: "App Shell",
    value: "app-shell",
    hint: "Secure interactive Ternent application shell",
  },
  {
    label: "Integrate Existing",
    value: "integrate-existing",
    hint: "Add Ternent runtime to an existing application",
  },
];

const appShellFrameworkOptions: PromptSelectOption<FrontendFramework>[] = [
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

const integrationFrameworkOptions: PromptSelectOption<FrontendFramework>[] = [
  ...appShellFrameworkOptions,
  {
    label: "Framework Agnostic",
    value: "agnostic",
    hint: "Generate host seams without framework UI helpers",
  },
];

const integrationStyleOptions: PromptSelectOption<IntegrationStyle>[] = [
  {
    label: "Isolated Module",
    value: "isolated-module",
    hint: "Create a self-contained src/ternent subtree",
  },
  {
    label: "Plugin + API Seams",
    value: "plugin-api-seams-only",
    hint: "Generate a narrower host integration surface",
  },
];

const integrationMutationModeOptions: PromptSelectOption<IntegrationMutationMode>[] = [
  {
    label: "Safe Report Only",
    value: "safe-report-only",
    hint: "Generate instructions and leave package.json untouched",
  },
  {
    label: "Assisted Package Update",
    value: "assisted-package-json",
    hint: "Update package.json dependencies and scripts explicitly",
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
      sourceRoot: null,
      integrationStyle: null,
      integrationMutationMode: null,
      features: [],
    };
  }

  let framework: FrontendFramework | null = null;
  let sourceRoot: string | null = null;
  let integrationStyle: IntegrationStyle | null = null;
  let integrationMutationMode: IntegrationMutationMode | null = null;

  if (tier === "app-shell") {
    framework = await driver.select({
      name: "framework",
      message: "Select Frontend Framework UI",
      options: appShellFrameworkOptions,
    });
  } else if (tier === "functional-blueprint") {
    framework = null;
  } else if (tier === "integrate-existing") {
    framework = await driver.select({
      name: "framework",
      message: "Select Host Framework",
      options: integrationFrameworkOptions,
    });
    sourceRoot = normalizeProjectName(
      await driver.text({
        name: "sourceRoot",
        message: "Target Source Root",
        placeholder: "src",
      }),
    );
    integrationStyle = await driver.select({
      name: "integrationStyle",
      message: "Select Host Integration Style",
      options: integrationStyleOptions,
    });
    integrationMutationMode = await driver.select({
      name: "integrationMutationMode",
      message: "Select Package Mutation Mode",
      options: integrationMutationModeOptions,
    });
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
    sourceRoot,
    integrationStyle,
    integrationMutationMode,
    features,
  };
}
