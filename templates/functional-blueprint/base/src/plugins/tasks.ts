import type { ConcordReplayPlugin } from "@ternent/concord";

export type TaskRecord = {
  id: string;
  title: string;
  columnId: string;
  audienceType: "everyone" | "user" | "permission";
};

export type TasksState = {
  byId: Record<string, TaskRecord>;
  order: string[];
};

export function createTasksPlugin(): ConcordReplayPlugin<TasksState> {
  return {
    id: "tasks",
    initialState: () => ({ byId: {}, order: [] }),
    commands: {
      "task.create": async (_ctx, input: TaskRecord) => ({
        kind: "task.create",
        payload: input,
      }),
    },
    applyEntry(entry, ctx) {
      if (entry.kind !== "task.create" || entry.payload.type !== "plain") {
        return;
      }

      const task = entry.payload.data as TaskRecord;
      const state = ctx.getState();
      ctx.setState({
        byId: {
          ...state.byId,
          [task.id]: task,
        },
        order: state.order.includes(task.id) ? state.order : [...state.order, task.id],
      });
    },
  };
}
