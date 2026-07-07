# Integrate Existing V1 Spec

## Objective

Deliver a CLI mode that adds Ternent runtime capability to an existing application codebase without forcing the team to adopt the full `app-shell` structure.

This mode exists for teams that already have:

- an established frontend
- an existing routing and layout system
- an existing design system
- existing state or service layers

They want to add:

- Ternent identity
- replay/runtime lifecycle
- native `users` and `permissions`
- privacy-aware selectors
- plugin seams

They do **not** want the CLI to replace their app shell.

## Product Decision

The CLI must support a separate adoption path:

- `integrate-existing`

This is a first-class mode, not a fallback and not a weaker version of `app-shell`.

## Core Promise

`integrate-existing` should:

- add Ternent infrastructure
- add a host integration adapter
- add sample domain seams
- avoid taking over the host application's layout, routing, styling, or file structure

The developer should end up with a working integration surface inside the existing app, not a parallel generated app that they ignore.

## Non-Goals

This mode must not:

- overwrite the host's top-level app entrypoint without explicit consent
- replace the host router
- replace the host state model wholesale
- inject an entire product shell by default
- generate multiple parallel UI frameworks
- move or rename existing host files

This mode is additive and surgical.

## User Experience

The CLI flow should be explicit that this is an integration path.

Example prompt flow:

1. `Project Name` or detect current package name
2. `Integration Mode`
   - `Add Ternent to Existing App`
3. `Framework`
   - `React`
   - `Vue`
   - `Svelte`
   - `Framework Agnostic`
4. `Target Source Root`
   - example: `src/`
5. `Host Integration Style`
   - `Create isolated ternent/ module`
   - `Generate plugin + API seams only`
6. `System Features`
   - `System Users`
   - `System Permissions`
   - `Snapshot Engine`

## Required Outcome

Running `integrate-existing` should generate:

- `ternent.config.ts`
- an integration module under the chosen source root
- native system module scaffolding
- runtime service scaffolding
- one host integration adapter
- one sample plugin
- one sample UI integration surface for the detected framework
- tests for the generated integration seams where feasible

It should also generate:

- a safe integration README or install note
- explicit `NEXT STEPS` comments where the host app must wire the generated seam manually

## Integration Shapes

V1 should support two integration shapes.

### 1. Isolated Ternent Module

The CLI creates a self-contained subtree such as:

```text
src/
  ternent/
    api/
    runtime/
    system/
    plugins/
    ui/
    index.ts
```

This is the default and safest shape.

Use this when:

- the host app has no strong Ternent conventions yet
- the team wants clear ownership boundaries
- the team may later promote the module into a fuller shell

### 2. Plugin + API Seams Only

The CLI creates a narrower integration surface such as:

```text
src/
  ternent/
    createTernentApi.ts
    system/
    plugins/
```

Use this when:

- the host app already has strong app-shell infrastructure
- the team only needs Ternent runtime and domain seams
- the team wants to wire UI manually

## Generated Boundaries

## 1. Ternent Config

The integration must generate a `ternent.config.ts` that includes:

- `systemModules.users`
- `systemModules.permissions`
- storage/snapshot defaults
- sync boundary hooks

The file should be easy to relocate if the host app has an existing config convention.

## 2. Host Integration Adapter

The CLI must generate a framework-appropriate adapter.

Examples:

- React: `useTernent.ts`
- Vue: `useTernent.ts` composable
- Svelte: `useTernent.ts` or store wrapper
- Framework-agnostic: `createTernentHost.ts`

The adapter should:

- initialize or return the Ternent API singleton
- expose lifecycle-safe consumption for the host framework
- avoid assuming router or layout ownership

## 3. Native System Layer

`integrate-existing` must scaffold the same native system contract as `app-shell`:

- `users`
- `permissions`
- `identity-session`
- `privacy`

The difference is not capability. The difference is host ownership of presentation and composition.

## 4. Sample Plugin

The integration must still include one sample app plugin.

Requirements:

- audience-aware command
- selector examples
- viewer-filtered read example
- no assumption that the sample plugin becomes the app's main screen

## 5. Sample UI Surface

The CLI should generate one small host-safe UI surface:

- React: component
- Vue: component
- Svelte: component
- framework-agnostic: HTML/TS example

This surface should demonstrate:

- identity state
- readable permissions
- visible sample records

It should be easy to mount into an existing route or page.

## File Ownership Rules

This is the most important contract for `integrate-existing`.

The CLI must define file ownership clearly.

### Files it may create freely

- `src/ternent/**` or the user-selected integration root
- `ternent.config.ts`
- framework adapter files under the integration root
- sample plugin files under the integration root
- docs/install notes under the integration root or root docs folder

### Files it may update only if explicitly requested

- `package.json`
- root `tsconfig.json`
- root `vite.config.*`
- root app entrypoints such as `src/main.tsx`, `src/main.ts`, `src/App.vue`

### Files it must never overwrite automatically

- existing router files
- existing design system files
- existing domain state modules
- existing page/layout components

If the host app needs manual integration, the CLI should generate instructions instead of mutating those files silently.

## Package.json Behavior

`integrate-existing` should support two modes:

### Safe Mode

Generate a report of required dependencies and scripts, but do not mutate `package.json`.

### Assisted Mode

Add required dependencies and minimal scripts automatically.

V1 default should be:

- assisted for brand new repos
- safe mode for clearly existing repos unless the user opts in

## Routing and Mounting

The CLI should not assume it owns routing.

Instead it should generate one of:

- a mountable panel component
- a route-ready feature component
- a host integration note showing how to attach it to a route/page

The default should be a mountable panel component.

## Required Tests

V1 is not complete without tests that prove the integration mode is additive.

Required coverage:

1. prompt routing for `integrate-existing`
2. scaffold engine support for integration shape options
3. package/config mutation behavior in safe mode vs assisted mode
4. generated host integration adapter presence
5. generated UI surface presence
6. generated sample plugin selector presence
7. no unintended overwrite of unrelated host files

## Acceptance Criteria

The slice is complete when all of the following are true:

1. the CLI can target an existing source root
2. it generates a self-contained Ternent integration subtree
3. it scaffolds `users`, `permissions`, `identity-session`, and `privacy`
4. it generates a host framework adapter instead of a full app shell
5. it generates a mountable sample UI surface
6. it does not silently overwrite existing host architecture files
7. it clearly documents any required manual wiring
8. the generated integration passes typecheck/build in a controlled sample host

## Recommended V1 Output Shape

```text
src/
  ternent/
    api/
      createTernentApi.ts
    runtime/
      identitySession.ts
      privacy.ts
      replayContext.ts
    system/
      users.ts
      permissions.ts
    plugins/
      tasks.ts
    ui/
      TernentPanel.tsx | .vue | .svelte
    useTernent.ts
    index.ts
ternent.config.ts
```

## Relationship To App Shell

`app-shell` and `integrate-existing` should share the same lower-level contracts:

- system modules
- runtime services
- plugin contracts
- selector patterns

The difference is composition:

- `app-shell` owns the host app
- `integrate-existing` plugs into someone else's host app

## Recommended Implementation Order

1. add CLI preset and prompt routing for `integrate-existing`
2. add scaffold engine support for integration shape options
3. generate isolated `src/ternent/` integration root
4. generate framework adapters
5. add safe mode package/config reporting
6. add assisted mode mutations behind explicit confirmation
7. add sample host fixture tests

## Follow-On Slice

After this mode lands, the next likely expansion is:

- `create ternent plugin`

That gives teams three clean adoption paths:

- `app-shell`
- `integrate-existing`
- `plugin`
