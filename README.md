# `create-ternent-app`

Scaffold replay-first Ternent applications with a tiered template matrix:

- `Core Only`: raw TypeScript infrastructure over `@ternent/concord` and `@ternent/ledger`
- `Functional Blueprint`: a vanilla HTML/TS sandbox that logs replay state in real time
- `Full App Scaffold`: a richer app-runtime shell with audience-aware tasks, privacy services, and framework overlays

## Install

Published create-flow target:

```bash
npm create @ternent/ternent-app@latest
```

Equivalent direct binary usage after install:

```bash
pnpm dlx @ternent/create-ternent-app
```

The CLI opens an interactive prompt wizard and generates a new project in the current directory.

## Scaffolding Matrix

### 1. Core Only

Use this when you want the smallest possible footprint.

Generated shape:

- raw TypeScript project
- `createConcordApp` wiring
- replay plugin examples
- `ternent.config.ts` with feature calibration
- no framework code

Best for:

- infrastructure prototypes
- library-style runtimes
- custom host applications that want to own UI and storage themselves

### 2. Functional Blueprint

Use this when you want a simple browser-visible sandbox without committing to React, Vue, or Svelte.

Generated shape:

- vanilla `index.html`
- plain TypeScript entrypoint
- live replay-state logging
- basic task plugin example
- no framework overlay config

Best for:

- demos
- teaching
- event-log and replay debugging
- validating command and projection behavior quickly

### 3. Full App Scaffold

Use this when you want the higher-level workspace-style runtime pattern.

Generated shape:

- `createAppApi`-style host layer
- runtime privacy service
- audience-aware task plugin
- framework overlay for `react`, `vue`, or `svelte`
- mnemonic onboarding UI surface
- `useTernent` bridge hook/composable/helper in the selected framework

Best for:

- product-facing apps
- identity-led onboarding flows
- privacy-aware collaborative workspaces
- apps that want to start close to the Ternent workspace runtime model

## Prompt Flow

The CLI currently routes through these decisions:

1. `Project Name`
2. `Core Layer Profile`
3. `Frontend Framework UI` for `Full App Scaffold` only
4. `Default Core Components`

Default feature toggles:

- `System Users & Identity`
- `System Permissions & Audience Privacy`
- `Snapshot Engine & Local Ledger Cache`

Those selections are injected into generated config so template placeholders are replaced during scaffold.

## Pluggable Sync Lifecycle Hooks

The generated projects are structured around a strict separation:

- local replay runtime
- pluggable remote synchronization boundary

At the configuration layer, the intended hook shape is:

```ts
export const ternentEngine = createEngine({
  systemModules: {
    users: true,
    permissions: true,
  },
  features: {
    ageEncryption: true,
  },
  syncStrategy: {
    onPush: async (localCommits) => {
      // send signed commits to a remote relay, pod, object store, or API
    },
    onPull: async () => {
      // fetch remote commits or snapshots and return them to the local runtime
    },
    resolveConflict: (local, remote) => {
      // choose merge policy explicitly
      return local;
    },
  },
});
```

This boundary is intentionally pluggable. The central system should be treated as transport and persistence, not as the source of truth. Replayable signed history remains authoritative.

Typical sync targets:

- HTTP relay
- object storage
- Solid Pod
- custom file-based import/export
- CRDT or collaboration layer mounted above or beside Concord

## Template Inventory

Repo inventory lives under [templates/](/Users/sam/dev/ternent/create-ternent-app/templates):

- `templates/core-only/base/`
- `templates/functional-blueprint/base/`
- `templates/full-app-scaffold/base/`
- `templates/full-app-scaffold/react/`
- `templates/full-app-scaffold/vue/`
- `templates/full-app-scaffold/svelte/`

The scaffold engine copies the appropriate base template, applies any framework overlay, and replaces template variables such as:

- `__PROJECT_NAME__`
- `__FEATURE_IDENTITY__`
- `__FEATURE_PERMISSIONS__`
- `__FEATURE_AGE_ENCRYPTION__`

## Local Development

Install dependencies:

```bash
pnpm install
```

Run the verification suite:

```bash
pnpm test
```

Build the published CLI payload:

```bash
pnpm build
```

## Repository Status

Current verified coverage includes:

- prompt routing
- Clack adapter behavior
- recursive scaffold copy engine
- template variable injection
- config calibration
- compiled binary smoke test against the real template inventory
