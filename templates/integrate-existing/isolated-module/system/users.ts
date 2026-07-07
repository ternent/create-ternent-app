export type SystemUserRecord = {
  identityKey: string;
  label: string | null;
  createdAt: string;
};

export type SystemUsersState = {
  byId: Record<string, SystemUserRecord>;
  order: string[];
};

export function createUsersState(): SystemUsersState {
  return { byId: {}, order: [] };
}

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
