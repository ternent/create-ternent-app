import type { PromptDriver, PromptSelectOption } from "./prompt-wizard.js";

type ClackSelectOption<TValue extends string> = {
  label: string;
  value: TValue;
  hint?: string;
};

type ClackLike = {
  text(input: { message: string; placeholder?: string }): Promise<string> | string;
  select<TValue extends string>(input: {
    message: string;
    options: ClackSelectOption<TValue>[];
  }): Promise<TValue> | TValue;
  multiselect<TValue extends string>(input: {
    message: string;
    options: ClackSelectOption<TValue>[];
    initialValues?: TValue[];
  }): Promise<TValue[]> | TValue[];
};

function mapOptions<TValue extends string>(
  options: PromptSelectOption<TValue>[],
): ClackSelectOption<TValue>[] {
  return options.map((option) => ({
    label: option.label,
    value: option.value,
    hint: option.hint,
  }));
}

export function createClackPromptDriver(clack: ClackLike): PromptDriver {
  return {
    async text(input) {
      return await clack.text({
        message: input.message,
        placeholder: input.placeholder,
      });
    },
    async select<TValue extends string>(input: {
      name: string;
      message: string;
      options: PromptSelectOption<TValue>[];
    }) {
      return await clack.select({
        message: input.message,
        options: mapOptions(input.options),
      });
    },
    async multiselect<TValue extends string>(input: {
      name: string;
      message: string;
      options: PromptSelectOption<TValue>[];
      initialValues?: TValue[];
    }) {
      return await clack.multiselect({
        message: input.message,
        options: mapOptions(input.options),
        initialValues: input.initialValues,
      });
    },
  };
}

export async function loadClackPromptDriver(): Promise<PromptDriver> {
  const clack = (await import("@clack/prompts")) as ClackLike;
  return createClackPromptDriver(clack);
}
