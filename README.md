# `create-ternent-app`

Scaffold replay-first Ternent applications with a tiered template matrix:

- `Core Only`: raw TypeScript infrastructure over `@ternent/concord` and `@ternent/ledger`
- `Functional Blueprint`: a vanilla HTML/TS sandbox that logs replay state in real time
- `App Shell`: a richer app-runtime shell with native system modules, privacy services, and framework overlays
- `Integrate Existing`: an additive Ternent integration subtree for existing host applications

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

Runtime requirements:

- Node.js `>=20`
- `pnpm` `11.x` for local development and release verification

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

### 3. App Shell

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

Scope note:

- this is an advanced scaffold, not a full clone of the `../workspace` product runtime
- identity, onboarding, storage, and privacy flows are scaffold seams intended for extension

### 4. Integrate Existing

Use this when you already have an application shell and want to add Ternent without replacing your host architecture.

Generated shape:

- root `ternent.config.ts`
- `src/ternent/` integration subtree
- native `users` and `permissions` system seams
- `identity-session` and `privacy` runtime services
- framework adapter and mountable integration panel
- sample plugin and viewer-filtered selectors

Mutation modes:

- `safe-report-only`: generates a root integration report and leaves `package.json` untouched
- `assisted-package-json`: updates `package.json` with Ternent dependencies and a namespaced check script

Best for:

- existing frontend products
- teams with an established router and design system
- incremental Ternent adoption inside a live codebase

## Prompt Flow

The CLI currently routes through these decisions:

1. `Project Name`
2. `Core Layer Profile`
3. `Frontend Framework UI` for `App Shell` only
4. `Host Framework` for `Integrate Existing`
5. `Target Source Root` for `Integrate Existing`
6. `Host Integration Style` for `Integrate Existing`
7. `Package Mutation Mode` for `Integrate Existing`
8. `Default Core Components` for every tier except `Core Only`

Default feature toggles:

- `System Users & Identity`
- `System Permissions & Audience Privacy`
- `Snapshot Engine & Local Ledger Cache`

Those selections are injected into generated config so template placeholders are replaced during scaffold.

Routing notes:

- `Core Only` skips framework and feature prompts entirely
- `Functional Blueprint` skips framework selection but still captures feature toggles
- `App Shell` requires a framework overlay
- `Integrate Existing` captures framework, source root, integration style, and package mutation mode before feature selection

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
- `templates/app-shell/base/`
- `templates/app-shell/react/`
- `templates/app-shell/vue/`
- `templates/app-shell/svelte/`
- `templates/integrate-existing/base-root/`
- `templates/integrate-existing/isolated-module/`
- `templates/integrate-existing/plugin-api-seams-only/`
- `templates/integrate-existing/react/`
- `templates/integrate-existing/vue/`
- `templates/integrate-existing/svelte/`

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
pnpm run verify
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
