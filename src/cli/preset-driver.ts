import type {
  CoreFeature,
  FrontendFramework,
  PromptDriver,
  ScaffoldTier,
} from "./prompt-wizard.js";

type PromptPreset = {
  projectName: string;
  tier: ScaffoldTier;
  framework?: FrontendFramework | null;
  features?: CoreFeature[];
};

function parsePreset(raw: string | undefined): PromptPreset | null {
  if (!raw) {
    return null;
  }

  const parsed = JSON.parse(raw) as Partial<PromptPreset>;
  if (typeof parsed.projectName !== "string" || typeof parsed.tier !== "string") {
    throw new Error("CREATE_TERNENT_APP_PRESET must include projectName and tier.");
  }

  return {
    projectName: parsed.projectName,
    tier: parsed.tier,
    framework: parsed.framework ?? null,
    features: parsed.features ?? [],
  };
}

export function loadPresetPromptDriverFromEnv(
  rawPreset: string | undefined,
): { driver: PromptDriver; preset: PromptPreset } | null {
  const preset = parsePreset(rawPreset);
  if (!preset) {
    return null;
  }

  const driver: PromptDriver = {
    async text(input) {
      if (input.name === "projectName") {
        return preset.projectName;
      }
      throw new Error(`Preset driver does not support text prompt '${input.name}'.`);
    },
    async select(input) {
      if (input.name === "tier") {
        return preset.tier as typeof input extends {
          options: Array<{ value: infer TValue }>;
        }
          ? TValue
          : never;
      }
      if (input.name === "framework") {
        if (!preset.framework) {
          throw new Error("Preset driver requires a framework for this prompt.");
        }
        return preset.framework as typeof input extends {
          options: Array<{ value: infer TValue }>;
        }
          ? TValue
          : never;
      }
      throw new Error(`Preset driver does not support select prompt '${input.name}'.`);
    },
    async multiselect(input) {
      if (input.name === "features") {
        return (preset.features ?? input.initialValues ?? []) as typeof input extends {
          options: Array<{ value: infer TValue }>;
        }
          ? TValue[]
          : never;
      }
      throw new Error(`Preset driver does not support multiselect prompt '${input.name}'.`);
    },
  };

  return { driver, preset };
}
