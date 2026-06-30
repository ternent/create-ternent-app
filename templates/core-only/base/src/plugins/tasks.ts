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
    initialState: () => ({
      byId: {},
      order: [],
    }),
    commands: {
      "task.create": async (_ctx, input: TaskRecord) => ({
        kind: "task.create",
        payload: input,
      }),
      "task.move": async (_ctx, input: { taskId: string; columnId: string }) => ({
        kind: "task.move",
        payload: input,
      }),
    },
    applyEntry(entry, ctx) {
      const state = ctx.getState();
      if (entry.kind === "task.create" && entry.payload.type === "plain") {
        const task = entry.payload.data as TaskRecord;
        ctx.setState({
          byId: {
            ...state.byId,
            [task.id]: task,
          },
          order: state.order.includes(task.id) ? state.order : [...state.order, task.id],
        });
      }

      if (entry.kind === "task.move" && entry.payload.type === "plain") {
        const payload = entry.payload.data as { taskId: string; columnId: string };
        const current = state.byId[payload.taskId];
        if (!current) {
          return;
        }
        ctx.setState({
          byId: {
            ...state.byId,
            [payload.taskId]: {
              ...current,
              columnId: payload.columnId,
            },
          },
          order: [...state.order],
        });
      }
    },
  };
}
