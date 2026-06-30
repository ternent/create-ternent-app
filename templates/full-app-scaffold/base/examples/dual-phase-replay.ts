import { createAppApi } from "../src/app/api/createAppApi";

export async function runDualPhaseReplayExample() {
  const api = await createAppApi();

  // System verification and native module projection happen first.
  api.replayContext.beginSystemPhase();
  await api.app.replay();

  // Application replay happens second over system-verified state.
  api.replayContext.beginApplicationPhase();
  await api.app.replay();

  return {
    runtime: api.app.getState(),
    tasks: api.tasks.all(),
  };
}
