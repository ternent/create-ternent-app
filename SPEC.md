# THE TERNENT ENGINE: ARCHITECTURAL MANIFESTO & SYSTEM SPECIFICATION

## I. Executive Summary
Modern software engineering is trapped in an expensive, insecure paradigm. Applications rely on heavy, centralized cloud databases, exposing organizations to massive infrastructure bills, data breach liabilities, and brittle network dependencies. 

**The Ternent Engine** is an unopinionated, open-source cryptographic runtime substrate for building zero-trust, replayable software. It abstracts complex client-side cryptography, local-first data lifecycle management, and sovereign digital identity into a lightweight developer utility. By utilizing **deterministic state replay built on cryptographically signed history**, it transforms the central cloud into a cheap, dumb storage relay while turning the user's browser into an autonomous, secure, zero-connectivity environment.

---

## II. The Core Product Pillars
Every architectural, implementation, and formatting choice must strictly align with these three foundational principles:

1. **Sovereign Identity First (`@ternent/identity`)**: Application actions must be cryptographically signed locally via deterministic private keys (12-word mnemonic recovery phrases) on the client device *before* touching a network connection.
2. **Invisible Security Infrastructure (`@ternent/armour` & `@ternent/seal`)**: Client-side data payloads are protected natively using modern Age-encryption primitives and client-driven Row-Level Security (RLS) out-of-the-box. The central cloud server reads zero plain-text customer data.
3. **Infinite Auditability (`@ternent/concord` & `@ternent/ledger`)**: Application state is never overwritten or mutated blindly. State is calculated by passing an immutable, chronological sequence of signed ledger commits through a deterministic replay pipeline.

---

## III. System Architecture: The Pluggable Core
The engine strictly separates **Local State Execution** from **Network Synchronization**. It remains completely unopinionated regarding how data flows across the web, exposing a pluggable lifecycle interface.

```
+---------------------------------------------------------------------------------+|                             LOCAL APPLICATION RUNTIME                           ||                                                                                 ||  +--------------------------+     +------------------------------------------+  ||  |    @ternent/identity     | --> |             @ternent/concord             |  ||  | (Local Mnemonic Key Gen) |     | (Command -> Stage -> Commit -> Replay)   |  ||  +--------------------------+     +------------------------------------------+  ||                                                         |                       ||                                                         v                       ||                                   +------------------------------------------+  ||                                   |             @ternent/ledger              |  ||                                   |     (IndexedDB + Periodic Snapshots)     |  ||                                   +------------------------------------------+  |+---------------------------------------------------------|-----------------------+|v+------------------------------------------+|     Pluggable Sync Strategy Hook Layer   |+------------------------------------------+/                                      \/                                        \+---------------------------------------+  +---------------------------------------+|     Git-Style Repository Strategy     |  |         Real-Time CRDT Relay          || (Explicit Push/Pull / Auditable Logs) |  |   (Yjs / Automerge Multi-User Sync)   |+---------------------------------------+  +---------------------------------------+
```

---

## IV. CLI Target Interface (`@ternent/create-ternent-app`)
To minimize developer friction and maximize distribution, the entry point for the entire framework is an organization-scoped command-line tool. It must scaffold an application base using a modular template matrix:

### 1. Template Matrix Options
* **Tier 1: Core Only (Framework Agnostic):** Raw TypeScript engine initialization files, configuration modules, and schema validators. No UI or layout code.
* **Tier 2: Functional Blueprint (Vanilla TS):** A barebones HTML structure that visualizes signed ledger states and app mutations using native DOM manipulations.
* **Tier 3: App Shell:** Complete UI-reactive templates containing built-in authentication, mnemonic generation views, and task/data view matrices based on production command structures.

### 2. User Prompts Layout
```text
┌──────────────────────────────────────────────────────────┐
│   ■ ▲ ●  create-ternent-app                             │
└──────────────────────────────────────────────────────────┘

? Project Name: › zero-knowledge-vault

? Select Core Layer Profile:
  ○ Core Only            [Cryptographic runtimes & definitions only]
  ○ Functional Blueprint [Barebone state logging using Vanilla HTML/TS]
❯ ● App Shell           [Complete secure Ternent application shell]

? Select Frontend Framework UI (Skip if choosing Core/Blueprint):
❯ ● React    (Vite + TS)
  ○ Vue      (Vite + TS)
  ○ Svelte   (Vite + TS)

? Select Default Core Components (Spacebar to toggle):
  ❯ [X] Identity Flow & Mnemonic Seed Recovery
    [X] Age-Encrypted Row-Level Security (RLS) Permissions
    [X] Snapshot Engine & Local Ledger Cache 
```

---

## V. Key Configuration Artifacts

### 1. The Core Infrastructure Mapping (`src/ternent.config.ts`)
```typescript
import { createEngine } from '@ternent/core';

export const ternentEngine = createEngine({
  storageSubstrate: 'indexeddb', // Local browser storage substrate
  snapshotInterval: 50,          // Flattens ledger streams after 50 transactions to solve memory lag
  features: {
    identity: true,              // Enables deterministic local key derivation
    ageEncryption: true,         // Client-side payload encryption via Age primitives
  },
  // Decoupled sync boundary hooks (Allows standard plugins, Solid Pods, Dropbox, or CRDT networks)
  syncStrategy: {
    onPush: async (localCommits) => { /* Handle remote backup */ },
    onPull: async () => { /* Handle remote ingestion */ },
    resolveConflict: (local, remote) => { /* Explicit merge strategy */ }
  }
});
```

### 2. Target Core Schema Ingestion (`src/plugins/tasks.ts`)
The CLI must parse and map existing production command structures as standard boilerplate data:
```typescript
export type TaskRecord = {
  id: string;
  title: string;
  columnId: string;
  audienceType: "everyone" | "user" | "permission";
  audienceId: string | null;
  createdBy: string;
};

export const taskPluginSchema = {
  initialState: { byId: {}, order: [] },
  commands: {
    "task.create": (state: any, payload: any) => {
      if (state.byId[payload.taskId]) return state;
      state.byId[payload.taskId] = { ...payload };
      state.order.push(payload.taskId);
    },
    "task.move": (state: any, payload: any) => {
      if (state.byId[payload.taskId]) state.byId[payload.taskId].columnId = payload.columnId;
    }
  }
};
```

---

## VI. Implementation Steps for Codex Agent
1. **Analyze Dependencies:** Analyze and map out function signatures for `@ternent/concord`, `ledger`, `identity`, `armour`, and `seal`.
2. **Setup CLI Scaffolder Package:** Generate root `package.json` scoped under `"name": "@ternent/create-ternent-app"` with `"publishConfig": { "access": "public" }`.
3. **Build the Prompt Layer:** Build the interactive console user interface using Clack or Inquirer.
4. **Isolate Template Directories:** Write an aggregation script that cleanly creates the specified directories (Core, Blueprint, React, Vue, Svelte) and dynamically injects the `ternent.config.ts` configuration file.
