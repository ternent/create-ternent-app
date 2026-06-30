export type RuntimeAudienceType = "everyone" | "user" | "permission";

export type RuntimeAudience = {
  audienceType: RuntimeAudienceType;
  audienceId: string | null;
};

export type RuntimePrivacyService = {
  resolveProtection(audience: RuntimeAudience): {
    type: "none" | "recipients";
    recipients?: string[];
  };
  canWriteAudience(audience: RuntimeAudience, actorIdentityKey: string): boolean;
};

export function createRuntimePrivacyService(): RuntimePrivacyService {
  return {
    resolveProtection(audience) {
      if (audience.audienceType === "everyone") {
        return { type: "none" };
      }

      return {
        type: "recipients",
        recipients: audience.audienceId ? [audience.audienceId] : [],
      };
    },
    canWriteAudience(audience, actorIdentityKey) {
      if (audience.audienceType === "everyone") {
        return true;
      }

      return audience.audienceId === actorIdentityKey;
    },
  };
}
