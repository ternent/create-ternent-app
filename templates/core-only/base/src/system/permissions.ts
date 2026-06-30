import type { ConcordReplayPlugin } from "@ternent/concord";

export type SystemPermissionRecord = {
  id: string;
  title: string;
  createdAt: string;
};

export type SystemPermissionsState = {
  byId: Record<string, SystemPermissionRecord>;
  order: string[];
};

export function createSystemPermissionsPlugin(): ConcordReplayPlugin<SystemPermissionsState> {
  return {
    id: "system-permissions",
    initialState: () => ({
      byId: {},
      order: [],
    }),
    commands: {
      "system.permission.create": async (_ctx, input: SystemPermissionRecord) => ({
        kind: "system.permission.create",
        payload: input,
      }),
    },
    applyEntry(entry, ctx) {
      if (entry.kind !== "system.permission.create" || entry.payload.type !== "plain") {
        return;
      }

      const permission = entry.payload.data as SystemPermissionRecord;
      const state = ctx.getState();
      ctx.setState({
        byId: {
          ...state.byId,
          [permission.id]: permission,
        },
        order: state.order.includes(permission.id) ? state.order : [...state.order, permission.id],
      });
    },
  };
}
