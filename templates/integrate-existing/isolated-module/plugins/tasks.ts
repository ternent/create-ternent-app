import type { SystemPermissionsState } from "../system/permissions";

export type TaskRecord = {
  id: string;
  title: string;
  columnId: string;
  audienceType: "everyone" | "user" | "permission";
  audienceId: string | null;
  createdBy: string;
};

export type TasksState = {
  byId: Record<string, TaskRecord>;
  order: string[];
};

export function createTasksState(): TasksState {
  return { byId: {}, order: [] };
}

export function selectVisibleTasks(input: {
  tasks: TasksState;
  permissions: SystemPermissionsState;
  viewerIdentityKey: string | null;
}): TaskRecord[] {
  return input.tasks.order
    .map((taskId) => input.tasks.byId[taskId])
    .filter((task): task is NonNullable<typeof task> => Boolean(task))
    .filter((task) => {
      if (task.audienceType === "everyone") {
        return true;
      }

      if (!input.viewerIdentityKey) {
        return false;
      }

      if (task.audienceType === "user") {
        return task.audienceId === input.viewerIdentityKey;
      }

      if (!task.audienceId) {
        return false;
      }

      return Boolean(
        input.permissions.byId[task.audienceId]?.memberIdentityKeys.includes(input.viewerIdentityKey),
      );
    });
}
