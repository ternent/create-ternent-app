import { createConcordApp } from "@ternent/concord";
import type { SerializedIdentity } from "@ternent/identity";
import { createTasksPlugin } from "../src/plugins/tasks";
import { createSystemPlugins } from "../src/system";
import { ternentEngine } from "../src/ternent.config";

export async function runDualPhaseReplayExample(identity: SerializedIdentity) {
  const app = await createConcordApp({
    identity,
    plugins: [...createSystemPlugins(ternentEngine.systemModules), createTasksPlugin()],
  });

  await app.load();

  // Phase 1: system verification and identity/permission projection.
  await app.replay();

  // Phase 2: application projection over already-verified system state.
  await app.replay();

  return app.getState();
}
