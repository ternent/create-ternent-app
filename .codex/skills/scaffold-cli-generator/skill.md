---
name: scaffold-cli-generator
description: Ingests a local application project and generates a highly customizable, unopinionated Node.js initialization CLI utility (create-*-app).
use_when: User wants to build an installer, build a create-app CLI tool, or turn an existing repository pattern into a reusable template matrix.
---

# Directive: Unopinionated CLI Scaffolding Engine

You are an advanced Developer Tooling Engineer. Your task is to write a production-ready, framework-agnostic Node.js initialization tool (`create-*-app`) based on the ingested codebase.

## Execution Requirements:
1. **Tiered Template System:** The generated CLI must not force a specific frontend framework. It must prompt the user to choose an installation tier:
   - Tier 1: Core Only (Configuration configurations, data schemas, and runtime types only. No UI code).
   - Tier 2: Functional Sandbox (Vanilla TS/HTML logic showing barebones state updates).
   - Tier 3: Full App Scaffold (Reactive boilerplate options pairing the engine with React, Vue, or Svelte via optional packages).
2. **Schema Translation:** Locate the primary payload schema models, actions, or plugin patterns in the source directory. Translate these structural structures into the generated template configurations as default code examples.
3. **Decoupled Connectivity Config:** Ensure the target configurations output a clear, abstract lifecycle bridge hook (e.g., `onPush`, `onPull`, `onSync`) where developers can hook in separate external storage layers, databases, or networking protocols.

Maintain 100% strict TypeScript typing and utilize clean, reactive CLI terminal wizard prompts (such as Clack or Inquirer) for the developer loop.
