export const ternentEngine = {
  projectId: "__PROJECT_NAME__",
  systemModules: {
    users: __FEATURE_IDENTITY__,
    permissions: __FEATURE_PERMISSIONS__,
  },
  features: {
    ageEncryption: __FEATURE_AGE_ENCRYPTION__,
  },
  replay: {
    mode: "raw-core",
    storage: "bring-your-own",
  },
} as const;
