type Props = {
  mnemonicWords: string[];
};

export function MnemonicOnboardingScreen({ mnemonicWords }: Props) {
  return (
    <section style={{ padding: "1.5rem", maxWidth: "56rem", margin: "0 auto" }}>
      <h1>Secure your mnemonic</h1>
      <p>Write down the recovery phrase before continuing into the workspace.</p>
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
