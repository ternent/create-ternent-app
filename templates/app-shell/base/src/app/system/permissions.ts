import type { ConcordReplayPlugin } from "@ternent/concord";

export type SystemPermissionRecord = {
  id: string;
  title: string;
  createdAt: string;
  memberIdentityKeys: string[];
};

export type SystemPermissionsState = {
  byId: Record<string, SystemPermissionRecord>;
  order: string[];
};

export function selectPermissionById(
  state: SystemPermissionsState,
  permissionId: string,
): SystemPermissionRecord | null {
  return state.byId[permissionId] ?? null;
}

export function selectReadablePermissions(
  state: SystemPermissionsState,
  viewerIdentityKey: string | null,
): SystemPermissionRecord[] {
  if (!viewerIdentityKey) {
    return [];
  }

  return state.order
    .map((permissionId) => state.byId[permissionId])
    .filter((permission): permission is NonNullable<typeof permission> => Boolean(permission))
    .filter((permission) => permission.memberIdentityKeys.includes(viewerIdentityKey));
}

export function createSystemPermissionsPlugin(): ConcordReplayPlugin<SystemPermissionsState> {
  return {
    id: "system-permissions",
    initialState: () => ({ byId: {}, order: [] }),
    commands: {
      "system.permission.create": async (_ctx, input: SystemPermissionRecord) => ({
        kind: "system.permission.create",
        payload: input,
      }),
      "system.permission.grant": async (
        _ctx,
        input: { permissionId: string; identityKey: string },
      ) => ({
        kind: "system.permission.grant",
        payload: input,
      }),
      "system.permission.revoke": async (
        _ctx,
        input: { permissionId: string; identityKey: string },
      ) => ({
        kind: "system.permission.revoke",
        payload: input,
      }),
    },
    applyEntry(entry, ctx) {
      if (entry.payload.type !== "plain") {
        return;
      }

      const state = ctx.getState();

      if (entry.kind === "system.permission.create") {
        const permission = entry.payload.data as SystemPermissionRecord;
        ctx.setState({
          byId: {
            ...state.byId,
            [permission.id]: permission,
          },
          order: state.order.includes(permission.id) ? state.order : [...state.order, permission.id],
        });
        return;
      }

      if (entry.kind === "system.permission.grant") {
        const payload = entry.payload.data as { permissionId: string; identityKey: string };
        const permission = state.byId[payload.permissionId];
        if (!permission) {
          return;
        }
        ctx.setState({
          byId: {
            ...state.byId,
            [permission.id]: {
              ...permission,
              memberIdentityKeys: permission.memberIdentityKeys.includes(payload.identityKey)
                ? permission.memberIdentityKeys
                : [...permission.memberIdentityKeys, payload.identityKey],
            },
          },
          order: [...state.order],
        });
        return;
      }

      if (entry.kind === "system.permission.revoke") {
        const payload = entry.payload.data as { permissionId: string; identityKey: string };
        const permission = state.byId[payload.permissionId];
        if (!permission) {
          return;
        }
        ctx.setState({
          byId: {
            ...state.byId,
            [permission.id]: {
              ...permission,
              memberIdentityKeys: permission.memberIdentityKeys.filter(
                (identityKey) => identityKey !== payload.identityKey,
              ),
            },
          },
          order: [...state.order],
        });
      }
    },
  };
}
