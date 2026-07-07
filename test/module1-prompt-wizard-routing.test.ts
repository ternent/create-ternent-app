import { describe, expect, it } from "vitest";
import {
  runPromptWizard,
  type PromptDriver,
  type PromptSelectOption,
} from "../src/cli/prompt-wizard.js";

describe("Module 1 prompt wizard routing", () => {
  it("skips framework and feature prompts for the core-only tier", async () => {
    const promptsSeen: string[] = [];
    const answersByName = {
      projectName: "zero-knowledge-vault",
      tier: "core-only" as const,
    };

    const driver: PromptDriver = {
      async select<TValue extends string>({
        name,
        options,
      }: {
        name: string;
        message: string;
        options: PromptSelectOption<TValue>[];
      }): Promise<TValue> {
        promptsSeen.push(name);
        expect(Array.isArray(options)).toBe(true);
        expect(options.length).toBeGreaterThan(0);
        return answersByName[name as keyof typeof answersByName] as TValue;
      },
      async text({ name }) {
        promptsSeen.push(name);
        return answersByName[name as keyof typeof answersByName];
      },
      async multiselect<TValue extends string>({
        name,
      }: {
        name: string;
        message: string;
        options: PromptSelectOption<TValue>[];
        initialValues?: TValue[];
      }): Promise<TValue[]> {
        promptsSeen.push(name);
        return [];
      },
    };
    const result = await runPromptWizard(driver);

    expect(result).toEqual({
      projectName: "zero-knowledge-vault",
      tier: "core-only",
      framework: null,
      sourceRoot: null,
      integrationStyle: null,
      integrationMutationMode: null,
      features: [],
    });

    expect(promptsSeen).toEqual(["projectName", "tier"]);
  });

  it("routes app-shell through framework and feature selection", async () => {
    const promptsSeen: string[] = [];
    let featurePromptInput: unknown;
    const answersByName = {
      projectName: "concord-workbench",
      tier: "app-shell" as const,
      framework: "vue" as const,
    };

    const driver: PromptDriver = {
      async select<TValue extends string>({
        name,
        options,
      }: {
        name: string;
        message: string;
        options: PromptSelectOption<TValue>[];
      }): Promise<TValue> {
        promptsSeen.push(name);
        expect(Array.isArray(options)).toBe(true);
        expect(options.length).toBeGreaterThan(0);
        return answersByName[name as keyof typeof answersByName] as TValue;
      },
      async text({ name }) {
        promptsSeen.push(name);
        return answersByName[name as keyof typeof answersByName] as string;
      },
      async multiselect<TValue extends string>(input: {
        name: string;
        message: string;
        options: PromptSelectOption<TValue>[];
        initialValues?: TValue[];
      }): Promise<TValue[]> {
        const { name, options } = input;
        promptsSeen.push(name);
        featurePromptInput = input;
        expect(Array.isArray(options)).toBe(true);
        expect(options.length).toBeGreaterThan(0);
        return input.initialValues ?? [];
      },
    };
    const result = await runPromptWizard(driver);

    expect(promptsSeen).toEqual(["projectName", "tier", "framework", "features"]);
    expect(featurePromptInput).toMatchObject({
      initialValues: ["system-users", "system-permissions", "snapshot-engine"],
    });
    expect(result).toEqual({
      projectName: "concord-workbench",
      tier: "app-shell",
      framework: "vue",
      sourceRoot: null,
      integrationStyle: null,
      integrationMutationMode: null,
      features: ["system-users", "system-permissions", "snapshot-engine"],
    });
  });

  it("routes functional-blueprint through features without framework selection", async () => {
    const promptsSeen: string[] = [];
    const answersByName = {
      projectName: "ledger-sandbox",
      tier: "functional-blueprint" as const,
    };

    const driver: PromptDriver = {
      async select<TValue extends string>({
        name,
        options,
      }: {
        name: string;
        message: string;
        options: PromptSelectOption<TValue>[];
      }): Promise<TValue> {
        promptsSeen.push(name);
        expect(Array.isArray(options)).toBe(true);
        expect(options.length).toBeGreaterThan(0);
        return answersByName[name as keyof typeof answersByName] as TValue;
      },
      async text({ name }) {
        promptsSeen.push(name);
        return answersByName[name as keyof typeof answersByName] as string;
      },
      async multiselect<TValue extends string>({
        name,
        options,
      }: {
        name: string;
        message: string;
        options: PromptSelectOption<TValue>[];
        initialValues?: TValue[];
      }): Promise<TValue[]> {
        promptsSeen.push(name);
        expect(Array.isArray(options)).toBe(true);
        expect(options.length).toBeGreaterThan(0);
        return ["system-users", "snapshot-engine"] as TValue[];
      },
    };
    const result = await runPromptWizard(driver);

    expect(promptsSeen).toEqual(["projectName", "tier", "features"]);
    expect(result).toEqual({
      projectName: "ledger-sandbox",
      tier: "functional-blueprint",
      framework: null,
      sourceRoot: null,
      integrationStyle: null,
      integrationMutationMode: null,
      features: ["system-users", "snapshot-engine"],
    });
  });

  it("routes integrate-existing through framework, source root, integration style, and features", async () => {
    const promptsSeen: string[] = [];
    const answersByName = {
      projectName: "existing-portal",
      tier: "integrate-existing" as const,
      framework: "react" as const,
      sourceRoot: "src",
      integrationStyle: "isolated-module" as const,
      integrationMutationMode: "safe-report-only" as const,
    };

    const driver: PromptDriver = {
      async select<TValue extends string>({
        name,
        options,
      }: {
        name: string;
        message: string;
        options: PromptSelectOption<TValue>[];
      }): Promise<TValue> {
        promptsSeen.push(name);
        expect(Array.isArray(options)).toBe(true);
        expect(options.length).toBeGreaterThan(0);
        return answersByName[name as keyof typeof answersByName] as TValue;
      },
      async text({ name }) {
        promptsSeen.push(name);
        return answersByName[name as keyof typeof answersByName] as string;
      },
      async multiselect<TValue extends string>(input: {
        name: string;
        message: string;
        options: PromptSelectOption<TValue>[];
        initialValues?: TValue[];
      }): Promise<TValue[]> {
        promptsSeen.push(input.name);
        expect(Array.isArray(input.options)).toBe(true);
        expect(input.options.length).toBeGreaterThan(0);
        return ["system-users", "system-permissions"] as TValue[];
      },
    };

    const result = await runPromptWizard(driver);

    expect(promptsSeen).toEqual([
      "projectName",
      "tier",
      "framework",
      "sourceRoot",
      "integrationStyle",
      "integrationMutationMode",
      "features",
    ]);
    expect(result).toEqual({
      projectName: "existing-portal",
      tier: "integrate-existing",
      framework: "react",
      sourceRoot: "src",
      integrationStyle: "isolated-module",
      integrationMutationMode: "safe-report-only",
      features: ["system-users", "system-permissions"],
    });
  });
});
