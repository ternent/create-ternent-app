import { createConcordApp } from "@ternent/concord";
import { createIdentity } from "@ternent/identity";
import { createTasksPlugin } from "../plugins/tasks";
import { createRuntimePrivacyService } from "../runtime/privacy";
import { createRuntimeReplayContext } from "../runtime/replayContext";
import { createSystemPlugins } from "../system";
import { ternentEngine } from "../../ternent.config";

export async function createAppApi() {
  const identity = await createIdentity();
  const privacy = createRuntimePrivacyService();
  const replayContext = createRuntimeReplayContext();
  const app = await createConcordApp({
    identity,
    plugins: [...createSystemPlugins(ternentEngine.systemModules), createTasksPlugin()],
  });

  await app.load();
  replayContext.beginSystemPhase();
  await app.replay();
  replayContext.beginApplicationPhase();
  await app.replay();

  return {
    app,
    identity,
    privacy,
    replayContext,
    tasks: {
      all() {
        return app.getReplayState("tasks");
      },
      async create(title: string) {
        await app.command("task.create", {
          id: crypto.randomUUID(),
          title,
          columnId: "todo",
          audienceType: "everyone",
          audienceId: null,
          createdBy: identity.keyId,
        });
      },
    },
  };
}
