import type { SystemPermissionsState } from "./system/permissions";

export type RuntimeAudience = {
  audienceType: "everyone" | "user" | "permission";
  audienceId: string | null;
};

export function createRuntimePrivacyService() {
  return {
    resolveAudience(audience: RuntimeAudience, permissionsState: SystemPermissionsState) {
      if (audience.audienceType === "everyone") {
        return { type: "none" as const };
      }

      if (audience.audienceType === "permission" && audience.audienceId) {
        return {
          type: "recipients" as const,
          recipients: permissionsState.byId[audience.audienceId]?.memberIdentityKeys ?? [],
        };
      }

      return {
        type: "recipients" as const,
        recipients: audience.audienceId ? [audience.audienceId] : [],
      };
    },
    canWriteAudience(
      audience: RuntimeAudience,
      actorIdentityKey: string,
      permissionsState: SystemPermissionsState,
    ) {
      if (audience.audienceType === "everyone") {
        return true;
      }

      if (audience.audienceType === "user") {
        return audience.audienceId === actorIdentityKey;
      }

      if (!audience.audienceId) {
        return false;
      }

      return Boolean(
        permissionsState.byId[audience.audienceId]?.memberIdentityKeys.includes(actorIdentityKey),
      );
    },
    listReadableAudiences(
      permissionsState: SystemPermissionsState,
      viewerIdentityKey: string | null,
    ) {
      if (!viewerIdentityKey) {
        return [];
      }

      return permissionsState.order
        .map((permissionId) => permissionsState.byId[permissionId])
        .filter((permission): permission is NonNullable<typeof permission> => Boolean(permission))
        .filter((permission) => permission.memberIdentityKeys.includes(viewerIdentityKey))
        .map((permission) => ({
          id: permission.id,
          title: permission.title,
        }));
    },
  };
}
