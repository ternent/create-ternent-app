export type IdentitySessionStatus = "locked" | "ready";

export type IdentityOnboardingDraft = {
  mnemonicWords: string[];
  createdAt: string;
};

export type ActiveIdentity = {
  identityKey: string;
  label: string;
};

const defaultMnemonicWords = [
  "alpha",
  "bravo",
  "charlie",
  "delta",
  "echo",
  "foxtrot",
  "golf",
  "hotel",
  "india",
  "juliet",
  "kilo",
  "lima",
];

export function createIdentitySessionService() {
  let locked = false;
  let activeIdentity: ActiveIdentity | null = {
    identityKey: "identity:demo-user",
    label: "Demo identity",
  };

  return {
    status(): IdentitySessionStatus {
      return locked ? "locked" : "ready";
    },
    getActiveIdentity() {
      return activeIdentity;
    },
    async createOnboardingDraft(): Promise<IdentityOnboardingDraft> {
      return {
        mnemonicWords: [...defaultMnemonicWords],
        createdAt: new Date().toISOString(),
      };
    },
    async completeOnboarding(input: {
      draft: IdentityOnboardingDraft;
      password: string;
      confirmPassword: string;
      mnemonicConfirmed: boolean;
    }) {
      if (!input.mnemonicConfirmed) {
        throw new Error("Mnemonic confirmation is required.");
      }
      if (input.password !== input.confirmPassword) {
        throw new Error("Passwords do not match.");
      }
      locked = false;
      activeIdentity = {
        identityKey: "identity:demo-user",
        label: "Demo identity",
      };
      return activeIdentity;
    },
    async recoverFromMnemonic(input: {
      mnemonic: string;
      password: string;
      confirmPassword: string;
    }) {
      if (!input.mnemonic.trim()) {
        throw new Error("Mnemonic is required.");
      }
      if (input.password !== input.confirmPassword) {
        throw new Error("Passwords do not match.");
      }
      locked = false;
      return activeIdentity;
    },
    async unlockWithPassword(input: { password: string }) {
      if (!input.password) {
        throw new Error("Password is required.");
      }
      locked = false;
      return activeIdentity;
    },
    async ensureUnlocked() {
      if (locked || !activeIdentity) {
        throw new Error("Identity session is locked.");
      }
      return activeIdentity;
    },
    async lock() {
      locked = true;
    },
  };
}
