type Props = {
  mnemonicWords: string[];
  identityStatus: string;
  password: string;
  recoverMnemonic: string;
  errorMessage: string | null;
  onPasswordChange(value: string): void;
  onRecoverMnemonicChange(value: string): void;
  onCreateDraft(): void;
  onUnlock(): void;
  onRecover(): void;
};

export function MnemonicOnboardingScreen({
  mnemonicWords,
  identityStatus,
  password,
  recoverMnemonic,
  errorMessage,
  onPasswordChange,
  onRecoverMnemonicChange,
  onCreateDraft,
  onUnlock,
  onRecover,
}: Props) {
  return (
    <section style={{ padding: "1.5rem", maxWidth: "56rem", margin: "0 auto" }}>
      <h1>Ternent app shell</h1>
      <p>Bootstrap or unlock the local identity session before entering the app.</p>
      <p>
        <strong>Identity status:</strong> {identityStatus}
      </p>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        <button type="button" onClick={onCreateDraft}>
          Create onboarding draft
        </button>
        <button type="button" onClick={onUnlock}>
          Unlock session
        </button>
        <button type="button" onClick={onRecover}>
          Recover from mnemonic
        </button>
      </div>
      <label style={{ display: "grid", gap: "0.35rem", marginBottom: "1rem" }}>
        <span>Password</span>
        <input value={password} onChange={(event) => onPasswordChange(event.target.value)} />
      </label>
      <label style={{ display: "grid", gap: "0.35rem", marginBottom: "1rem" }}>
        <span>Recovery phrase</span>
        <textarea
          rows={3}
          value={recoverMnemonic}
          onChange={(event) => onRecoverMnemonicChange(event.target.value)}
        />
      </label>
      {errorMessage ? <p style={{ color: "#b91c1c" }}>{errorMessage}</p> : null}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "0.75rem",
        }}
      >
        {mnemonicWords.map((word, index) => (
          <div
            key={word + index}
            style={{ border: "1px solid #cbd5e1", borderRadius: "0.75rem", padding: "0.75rem" }}
          >
            {index + 1}. {word}
          </div>
        ))}
      </div>
    </section>
  );
}
