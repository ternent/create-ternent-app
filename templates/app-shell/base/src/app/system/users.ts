import type { ConcordReplayPlugin } from "@ternent/concord";

export type SystemUserRecord = {
  identityKey: string;
  label: string | null;
  createdAt: string;
};

export type SystemUsersState = {
  byId: Record<string, SystemUserRecord>;
  order: string[];
};

export function selectUserByIdentityKey(
  state: SystemUsersState,
  identityKey: string,
): SystemUserRecord | null {
  return state.byId[identityKey] ?? null;
}

export function selectActiveUser(
  state: SystemUsersState,
  identityKey: string | null,
): SystemUserRecord | null {
  if (!identityKey) {
    return null;
  }

  return selectUserByIdentityKey(state, identityKey);
}

export function createSystemUsersPlugin(): ConcordReplayPlugin<SystemUsersState> {
  return {
    id: "system-users",
    initialState: () => ({ byId: {}, order: [] }),
    commands: {
      "system.user.register": async (_ctx, input: SystemUserRecord) => ({
        kind: "system.user.register",
        payload: input,
      }),
    },
    applyEntry(entry, ctx) {
      if (entry.kind !== "system.user.register" || entry.payload.type !== "plain") {
        return;
      }

      const user = entry.payload.data as SystemUserRecord;
      const state = ctx.getState();
      ctx.setState({
        byId: {
          ...state.byId,
          [user.identityKey]: user,
        },
        order: state.order.includes(user.identityKey) ? state.order : [...state.order, user.identityKey],
      });
    },
  };
}
