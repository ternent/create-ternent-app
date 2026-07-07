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

export function createPermissionsState(): SystemPermissionsState {
  return { byId: {}, order: [] };
}

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
