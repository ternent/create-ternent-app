import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      ".pnpm-store/**",
      "coverage/**",
    ],
  },
  {
    files: [
      "bin/**/*.js",
      "src/**/*.ts",
      "test/**/*.ts",
      "vitest.config.ts",
      "templates/**/*.ts",
      "templates/**/*.tsx",
      "templates/**/*.js",
      "templates/**/*.mjs",
      "templates/**/*.cjs",
    ],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "no-console": ["error", { allow: ["error", "warn"] }],
      "@typescript-eslint/consistent-type-imports": "error",
    },
  },
  {
    files: ["test/**/*.ts", "vitest.config.ts"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.vitest,
      },
    },
  },
);
