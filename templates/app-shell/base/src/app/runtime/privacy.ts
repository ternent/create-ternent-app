import type { SystemPermissionsState } from "../system/permissions";

export type RuntimeAudienceType = "everyone" | "user" | "permission";

export type RuntimeAudience = {
  audienceType: RuntimeAudienceType;
  audienceId: string | null;
};

export type RuntimePrivacyService = {
  resolveAudience(
    audience: RuntimeAudience,
    permissionsState: SystemPermissionsState,
  ): {
    type: "none" | "recipients";
    recipients?: string[];
  };
  canWriteAudience(
    audience: RuntimeAudience,
    actorIdentityKey: string,
    permissionsState: SystemPermissionsState,
  ): boolean;
  listReadableAudiences(
    permissionsState: SystemPermissionsState,
    viewerIdentityKey: string | null,
  ): Array<{ id: string; title: string }>;
};

export function createRuntimePrivacyService(): RuntimePrivacyService {
  return {
    resolveAudience(audience, permissionsState) {
      if (audience.audienceType === "everyone") {
        return { type: "none" };
      }

      if (audience.audienceType === "permission" && audience.audienceId) {
        const permission = permissionsState.byId[audience.audienceId];
        return {
          type: "recipients",
          recipients: permission ? permission.memberIdentityKeys : [],
        };
      }

      return {
        type: "recipients",
        recipients: audience.audienceId ? [audience.audienceId] : [],
      };
    },
    canWriteAudience(audience, actorIdentityKey, permissionsState) {
      if (audience.audienceType === "everyone") {
        return true;
      }

      if (audience.audienceType === "permission") {
        if (!audience.audienceId) {
          return false;
        }
        return Boolean(
          permissionsState.byId[audience.audienceId]?.memberIdentityKeys.includes(actorIdentityKey),
        );
      }

      return audience.audienceId === actorIdentityKey;
    },
    listReadableAudiences(permissionsState, viewerIdentityKey) {
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
