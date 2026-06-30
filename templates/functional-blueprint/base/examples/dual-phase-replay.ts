import { createConcordApp } from "@ternent/concord";
import { createIdentity } from "@ternent/identity";
import { createTasksPlugin } from "../src/plugins/tasks";

export async function runDualPhaseReplayExample() {
  const identity = await createIdentity();
  const app = await createConcordApp({
    identity,
    plugins: [createTasksPlugin()],
  });

  await app.load();

  // Phase 1: verify system surfaces and bootstrap history.
  await app.replay();

  // Phase 2: render application-facing projections.
  await app.replay();

  return app.getState();
}
