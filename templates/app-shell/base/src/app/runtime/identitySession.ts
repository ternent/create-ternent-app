export type IdentitySessionStatus = "locked" | "ready";

export type IdentityOnboardingDraft = {
  mnemonicWords: string[];
  createdAt: string;
};

export type ActiveIdentity = {
  identityKey: string;
  label: string;
};

export type IdentitySessionService = {
  status(): IdentitySessionStatus;
  getActiveIdentity(): ActiveIdentity | null;
  ensureUnlocked(): Promise<ActiveIdentity>;
  createOnboardingDraft(): Promise<IdentityOnboardingDraft>;
  completeOnboarding(input: {
    draft: IdentityOnboardingDraft;
    password: string;
    confirmPassword: string;
    mnemonicConfirmed: boolean;
  }): Promise<ActiveIdentity>;
  recoverFromMnemonic(input: {
    mnemonic: string;
    password: string;
    confirmPassword: string;
  }): Promise<ActiveIdentity>;
  unlockWithPassword(input: { password: string }): Promise<ActiveIdentity>;
  lock(): Promise<void>;
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

export function createIdentitySessionService(input: {
  identityKey: string;
  label?: string;
}): IdentitySessionService {
  let locked = false;
  let activeIdentity: ActiveIdentity | null = {
    identityKey: input.identityKey,
    label: input.label ?? "Primary identity",
  };

  return {
    status() {
      return locked ? "locked" : "ready";
    },
    getActiveIdentity() {
      return activeIdentity;
    },
    async ensureUnlocked() {
      if (locked || !activeIdentity) {
        throw new Error("Identity session is locked.");
      }
      return activeIdentity;
    },
    async createOnboardingDraft() {
      return {
        mnemonicWords: [...defaultMnemonicWords],
        createdAt: new Date().toISOString(),
      };
    },
    async completeOnboarding(inputValue) {
      if (!inputValue.mnemonicConfirmed) {
        throw new Error("Mnemonic confirmation is required.");
      }
      if (inputValue.password !== inputValue.confirmPassword) {
        throw new Error("Passwords do not match.");
      }
      locked = false;
      activeIdentity = {
        identityKey: input.identityKey,
        label: input.label ?? "Primary identity",
      };
      return activeIdentity;
    },
    async recoverFromMnemonic(inputValue) {
      if (inputValue.password !== inputValue.confirmPassword) {
        throw new Error("Passwords do not match.");
      }
      if (!inputValue.mnemonic.trim()) {
        throw new Error("Mnemonic is required.");
      }
      locked = false;
      activeIdentity = {
        identityKey: input.identityKey,
        label: "Recovered identity",
      };
      return activeIdentity;
    },
    async unlockWithPassword(inputValue) {
      if (!inputValue.password) {
        throw new Error("Password is required.");
      }
      locked = false;
      if (!activeIdentity) {
        activeIdentity = {
          identityKey: input.identityKey,
          label: input.label ?? "Primary identity",
        };
      }
      return activeIdentity;
    },
    async lock() {
      locked = true;
    },
  };
}
