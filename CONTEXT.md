# Context

## Terms

### Ternent App Shell
The default runnable application scaffold produced by the CLI for product-facing apps. It includes native system primitives, runtime services, plugin seams, and a starter UI shell so developers can focus on domain models and user flows.

### System Module
A persisted, replayed platform domain that is treated as native infrastructure by the scaffold rather than as an ordinary app plugin. In v1, `users` and `permissions` are system modules.

### Runtime Service
A native application service that is injected by the shell and depends on runtime state, but is not itself a persisted replay domain. In v1, `identity-session` and `privacy` are runtime services.

### App Plugin
A developer-authored domain module that contributes commands, replay logic, selectors, and UI-facing contracts. App plugins sit on top of the native system layer.

### Micro-App Preset
A focused scaffold target that loads the same ledger/container model through a narrower UI and capability set than the main app shell. Examples include an audit viewer or permissions admin surface.

### Viewer-Filtered Selector
A selector that returns data already filtered for the active identity and permission context, so UI code consumes safe, audience-aware projections by default.

### Existing-Host Integration
An adoption mode where the CLI adds Ternent runtime, system modules, and scaffolding seams into an existing application codebase without replacing the host app's existing product structure.

### Host Integration Adapter
The generated boundary code that connects Ternent runtime contracts to an existing application's framework, router, state model, or UI composition approach.

### Integration Mutation Mode
The policy that decides whether `integrate-existing` only reports required host changes or explicitly updates approved host files such as `package.json`.
