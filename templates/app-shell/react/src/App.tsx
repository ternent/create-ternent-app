import { useEffect, useState } from "react";
import { MnemonicOnboardingScreen } from "./components/MnemonicOnboardingScreen";
import { useTernent } from "./hooks/useTernent";

type OnboardingDraft = Awaited<
  ReturnType<Awaited<ReturnType<typeof useTernent>>["identity"]["createOnboardingDraft"]>
>;

export default function App() {
  const api = useTernent();
  const [draft, setDraft] = useState<OnboardingDraft | null>(null);
  const [password, setPassword] = useState("local-dev-password");
  const [recoverMnemonic, setRecoverMnemonic] = useState("");
  const [flowError, setFlowError] = useState<string | null>(null);

  useEffect(() => {
    if (!api || draft) {
      return;
    }

    void api.identity
      .createOnboardingDraft()
      .then(setDraft)
      .catch((error) => {
        setFlowError(error instanceof Error ? error.message : String(error));
      });
  }, [api, draft]);

  if (!api) {
    return <p style={{ padding: "2rem" }}>Booting app shell...</p>;
  }

  const activeIdentity = api.identity.getActiveIdentity();
  const permissions = api.permissions.readableForViewer();
  const visibleTasks = api.tasks.visible();

  async function handleCreateDraft() {
    setFlowError(null);
    setDraft(await api.identity.createOnboardingDraft());
  }

  async function handleUnlock() {
    setFlowError(null);

    try {
      if (draft) {
        await api.identity.completeOnboarding({
          draft,
          password,
          confirmPassword: password,
          mnemonicConfirmed: true,
        });
        return;
      }

      await api.identity.unlockWithPassword({ password });
    } catch (error) {
      setFlowError(error instanceof Error ? error.message : String(error));
    }
  }

  async function handleRecover() {
    setFlowError(null);

    try {
      await api.identity.recoverFromMnemonic({
        mnemonic: recoverMnemonic,
        password,
        confirmPassword: password,
      });
    } catch (error) {
      setFlowError(error instanceof Error ? error.message : String(error));
    }
  }

  return (
    <main>
      <MnemonicOnboardingScreen
        mnemonicWords={draft?.mnemonicWords ?? []}
        identityStatus={api.identity.status()}
        password={password}
        recoverMnemonic={recoverMnemonic}
        errorMessage={flowError ?? api.lastError.current()}
        onPasswordChange={setPassword}
        onRecoverMnemonicChange={setRecoverMnemonic}
        onCreateDraft={handleCreateDraft}
        onUnlock={handleUnlock}
        onRecover={handleRecover}
      />
      <section style={{ padding: "1.5rem", display: "grid", gap: "1rem" }}>
        <article>
          <h2>Runtime status</h2>
          <pre>{JSON.stringify({ status: api.status.current(), lastError: api.lastError.current() }, null, 2)}</pre>
        </article>
        <article>
          <h2>Active identity</h2>
          <pre>{JSON.stringify(api.identity.getActiveIdentity() ?? activeIdentity, null, 2)}</pre>
        </article>
        <article>
          <h2>Readable permissions</h2>
          <pre>{JSON.stringify(api.permissions.readableForViewer() ?? permissions, null, 2)}</pre>
        </article>
        <article>
          <h2>Visible tasks</h2>
          <pre>{JSON.stringify(api.tasks.visible() ?? visibleTasks, null, 2)}</pre>
        </article>
      </section>
    </main>
  );
}
