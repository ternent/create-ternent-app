export const ternentEngine = {
  projectId: "__PROJECT_NAME__",
  systemModules: {
    users: __FEATURE_IDENTITY__,
    permissions: __FEATURE_PERMISSIONS__,
  },
  features: {
    ageEncryption: __FEATURE_AGE_ENCRYPTION__,
  },
  runtime: {
    profile: "integrate-existing",
    hostMode: "additive",
  },
} as const;
