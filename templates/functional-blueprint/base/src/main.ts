import { createConcordApp } from "@ternent/concord";
import { createIdentity } from "@ternent/identity";
import { createTasksPlugin } from "./plugins/tasks";
import { ternentEngine } from "./ternent.config";

const output = document.querySelector<HTMLPreElement>("#state-log");
const createButton = document.querySelector<HTMLButtonElement>("#create-task");

if (!output || !createButton) {
  throw new Error("Blueprint shell failed to mount.");
}

const identity = await createIdentity();
const app = await createConcordApp({
  identity,
  plugins: [createTasksPlugin()],
});

const render = () => {
  output.textContent = JSON.stringify(
    {
      projectId: ternentEngine.projectId,
      engine: ternentEngine,
      state: app.getState(),
      tasks: app.getReplayState("tasks"),
    },
    null,
    2,
  );
};

app.subscribe(render);
await app.load();
render();

createButton.addEventListener("click", async () => {
  await app.command("task.create", {
    id: crypto.randomUUID(),
    title: "Blueprint task",
    columnId: "todo",
    audienceType: "everyone",
  });
  render();
});
