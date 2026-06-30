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
      features: [],
    });

    expect(promptsSeen).toEqual(["projectName", "tier"]);
  });

  it("routes full-app-scaffold through framework and feature selection", async () => {
    const promptsSeen: string[] = [];
    let featurePromptInput: unknown;
    const answersByName = {
      projectName: "concord-workbench",
      tier: "full-app-scaffold" as const,
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
      tier: "full-app-scaffold",
      framework: "vue",
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
      features: ["system-users", "snapshot-engine"],
    });
  });
});
