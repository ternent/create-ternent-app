import { createConcordApp } from "@ternent/concord";
import type { LedgerReplayEntry } from "@ternent/ledger";
import type { SerializedIdentity } from "@ternent/identity";
import { createTasksPlugin } from "./plugins/tasks";
import { createSystemPlugins } from "./system";
import { ternentEngine } from "./ternent.config";

export async function createProjectRuntime(identity: SerializedIdentity) {
  const tasks = createTasksPlugin();
  const systemPlugins = createSystemPlugins(ternentEngine.systemModules);

  const app = await createConcordApp({
    identity,
    plugins: [...systemPlugins, tasks],
  });

  await app.load();

  return {
    appId: ternentEngine.projectId,
    engine: ternentEngine,
    replayEntryType: null as LedgerReplayEntry | null,
    app,
  };
}
