# App Shell V1 Spec

## Objective

Deliver a new default CLI preset that scaffolds a **minimal but full-featured** Ternent application shell.

For this project, **minimal but full-featured** means:

- developers receive a runnable app shell with native security and lifecycle primitives already wired
- developers mainly implement domain models, commands, selectors, and UI flows
- security-critical and replay-critical infrastructure is present by default
- product-specific surfaces beyond the core shell stay out of the default scaffold

This slice should move the CLI from a `workspace-inspired starter` to a `credible application shell`.

## Product Decision

### Default Preset

The main product-facing scaffold target is:

- `app-shell`

This replaces the current mental model where `full-app-scaffold` is treated as a workspace proxy. The shell is the main recommendation for building real Ternent apps.

### Sample Domain Plugin

- `tasks` remains the canonical sample app plugin
- `tasks` is **not** part of the platform contract
- it exists to demonstrate plugin authoring, selectors, privacy-aware commands, and starter UI composition

### Native Runtime Boundary

V1 draws a hard distinction between **persisted system modules** and **runtime services**:

- persisted system modules:
  - `users`
  - `permissions`
- native runtime services:
  - `identity-session`
  - `privacy`

This keeps the replayed system surface small while still treating auth and privacy as native infrastructure.

## Goals

The `app-shell` scaffold must include:

1. identity bootstrap and recovery flow
2. unlock/session flow
3. native `users` system module
4. native `permissions` system module
5. native privacy/RLS runtime service
6. permission groups and key-aware audience handling
7. replay/runtime lifecycle state
8. local storage and sync boundary hooks
9. viewer-filtered selector conventions
10. plugin registration and scaffolding seams
11. one sample domain plugin
12. one starter UI shell

## Non-Goals

This slice does **not** attempt to scaffold the entire workspace product.

Out of scope:

- full workspace parity
- runtime app registry and multi-app shell orchestration
- multiple bundled product UIs
- a full audit viewer in the main shell
- admin tooling beyond the base shell contract
- provider-specific remote sync implementations as required defaults
- multiple sample domain plugins in the base preset

Those should come later as micro-app presets or add-on generators.

## Required CLI Outcome

Running the CLI against the `app-shell` preset should produce:

- a runnable Vite + TypeScript application
- a generated `ternent.config.ts`
- native system module wiring for `users` and `permissions`
- runtime service wiring for `identity-session` and `privacy`
- a starter plugin registry with one sample domain plugin
- a usable onboarding and unlock surface
- a simple shell view that demonstrates:
  - active identity state
  - group/permission context
  - sample plugin data
  - replay/runtime status

## Architecture

## 1. Persisted System Modules

### `users`

Responsibilities:

- project user records into replay state
- map active identities to projected user records
- provide selectors for lookup and active-user resolution

Required generated API surface:

- `api.users.create(...)`
- `api.users.all()`
- `api.users.byIdentityKey(identityKey)`
- `api.users.active()`

### `permissions`

Responsibilities:

- represent groups/permissions as replayed state
- manage grants and revokes
- track membership and audience relationships
- expose selectors used by privacy and UI filtering

Required generated API surface:

- `api.permissions.createGroup(...)`
- `api.permissions.grant(...)`
- `api.permissions.revoke(...)`
- `api.permissions.all()`
- `api.permissions.byId(permissionId)`
- `api.permissions.readableForViewer()`

## 2. Native Runtime Services

### `identity-session`

Responsibilities:

- onboarding draft creation
- mnemonic confirmation
- password-based unlock
- recovery flow
- current session identity state

Required generated API surface:

- `api.identity.getActiveIdentity()`
- `api.identity.ensureUnlocked()`
- `api.identity.createOnboardingDraft()`
- `api.identity.completeOnboarding(...)`
- `api.identity.recoverFromMnemonic(...)`
- `api.identity.unlockWithPassword(...)`
- `api.identity.lock()`

### `privacy`

Responsibilities:

- resolve audience protection policies
- enforce write eligibility
- drive viewer-filtered selectors
- expose replay decryption inputs derived from permission state

Required generated API surface:

- `api.privacy.resolveAudience(...)`
- `api.privacy.canWriteAudience(...)`
- `api.privacy.listReadableAudiences()`

Note:
The exact cryptographic implementation may remain intentionally thin in v1, but the service contract must be correct and extensible.

## 3. Runtime Lifecycle

The shell must ship with a first-class lifecycle wrapper around Concord:

- `load`
- `command`
- `commit`
- `discard`
- `replay`
- `exportLedger`
- `importLedger`
- `subscribe`

The shell must surface status:

- `restoring`
- `ready`
- `error`

It must also expose:

- `lastError`
- active identity state
- replay/runtime phase information

## 4. Selector Contract

Generated plugins and system modules must support selectors.

The scaffold should establish two selector categories:

- raw selectors:
  - state-shaped reads for infrastructure and debugging
- viewer-filtered selectors:
  - identity-aware, permission-aware reads intended for UI use

Rule:
UI examples should default to viewer-filtered selectors where possible.

## 5. Plugin Contract

The generated sample plugin must define:

- domain record types
- command input types
- replay plugin logic
- selectors
- one starter UI integration example

The plugin generator path should ultimately reuse this contract.

Required sample plugin behaviors:

- create records
- update at least one mutable field
- use audience-aware command input
- expose `all`, `byId`, and one viewer-filtered selector

## 6. UI Shell

The base shell must include these screens or panels:

### Onboarding

- create mnemonic-backed identity
- confirm mnemonic visibility/acknowledgement
- complete initial bootstrap

### Unlock

- unlock existing local identity
- recover from mnemonic

### Shell Surface

- active identity summary
- permission/group context
- runtime status
- sample plugin surface
- basic debug/replay panel

The UI should be functional, not decorative.

## Preset Matrix After This Slice

The CLI matrix should be reframed as:

1. `core-only`
2. `functional-blueprint`
3. `app-shell`

Follow-on presets, not part of this slice:

- `audit-viewer`
- `permissions-admin`
- `task-workspace`

## Template Layout Target

```text
templates/
  core-only/
  functional-blueprint/
  app-shell/
    base/
      src/
        app/
          api/
          runtime/
          system/
          plugins/
          ui/
    react/
    vue/
    svelte/
```

## Required Tests

This slice is not complete until the CLI validates generated usability, not just file presence.

Add coverage for:

1. prompt routing for the `app-shell` preset
2. scaffold engine overlay behavior for `app-shell`
3. config injection for:
   - system modules
   - runtime service flags or contracts where applicable
4. generated app compile checks
5. generated app typecheck checks
6. framework smoke checks for the chosen shell framework
7. selector and privacy service unit coverage in scaffolded templates where feasible

## Acceptance Criteria

The slice is complete when all of the following are true:

1. the CLI scaffolds an `app-shell` project without manual file edits
2. the generated app boots and renders the shell
3. onboarding and unlock flows are present in generated code
4. `users` and `permissions` are scaffolded as native system modules
5. `identity-session` and `privacy` are scaffolded as native runtime services
6. the sample plugin demonstrates audience-aware commands and selectors
7. generated projects pass `typecheck` and `build`
8. the CLI test suite verifies generated app usability, not just placeholder replacement

## Recommended Implementation Order

1. rename and reframe Tier 3 as `app-shell`
2. deepen `createAppApi` into a real shell API contract
3. scaffold `users` and `permissions` as first-class system modules
4. scaffold `identity-session` and `privacy` runtime services
5. add viewer-filtered selectors
6. upgrade the sample `tasks` plugin to use the new contracts
7. replace static onboarding components with real flow stubs and state
8. strengthen E2E to run generated app typecheck/build

## Follow-On Slice

After `app-shell` lands, the next major slice should be:

- plugin generator and micro-app presets

That includes:

- `create ternent plugin`
- `create ternent audit-viewer`
- `create ternent permissions-admin`

## AI Delivery Track

This should remain a separate delivery track after the shell contract stabilizes.

Target outputs:

- app-spec template
- plugin-spec template
- UI-flow template
- agent prompts and instructions
- “build from spec” generation workflow

Do not start the AI layer until the `app-shell` contract is stable enough to scaffold predictably.
