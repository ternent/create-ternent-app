<script lang="ts">
  import MnemonicOnboardingScreen from "./components/MnemonicOnboardingScreen.svelte";
  import { useTernent } from "./lib/useTernent";

  let api: Awaited<ReturnType<typeof useTernent>> | null = null;
  let draft: { mnemonicWords: string[]; createdAt: string } | null = null;
  let password = "local-dev-password";
  let recoverMnemonic = "";
  let flowError: string | null = null;

  useTernent().then(async (value) => {
    api = value;
    draft = await value.identity.createOnboardingDraft();
  });

  async function handleCreateDraft() {
    flowError = null;
    draft = api ? await api.identity.createOnboardingDraft() : null;
  }

  async function handleUnlock() {
    flowError = null;
    if (!api) {
      return;
    }

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
      flowError = error instanceof Error ? error.message : String(error);
    }
  }

  async function handleRecover() {
    flowError = null;
    if (!api) {
      return;
    }

    try {
      await api.identity.recoverFromMnemonic({
        mnemonic: recoverMnemonic,
        password,
        confirmPassword: password,
      });
    } catch (error) {
      flowError = error instanceof Error ? error.message : String(error);
    }
  }
</script>

<main>
  <MnemonicOnboardingScreen
    mnemonicWords={draft?.mnemonicWords ?? []}
    identityStatus={api?.identity.status() ?? "locked"}
    {password}
    {recoverMnemonic}
    errorMessage={flowError ?? api?.lastError.current() ?? null}
    onCreateDraft={handleCreateDraft}
    onUnlock={handleUnlock}
    onRecover={handleRecover}
    onPasswordChange={(value) => (password = value)}
    onRecoverMnemonicChange={(value) => (recoverMnemonic = value)}
  />
  <section style="padding: 1.5rem; display: grid; gap: 1rem">
    <article>
      <h2>Runtime status</h2>
      <pre>{JSON.stringify({ status: api?.status.current(), lastError: api?.lastError.current() }, null, 2)}</pre>
    </article>
    <article>
      <h2>Active identity</h2>
      <pre>{JSON.stringify(api?.identity.getActiveIdentity(), null, 2)}</pre>
    </article>
    <article>
      <h2>Readable permissions</h2>
      <pre>{JSON.stringify(api?.permissions.readableForViewer(), null, 2)}</pre>
    </article>
    <article>
      <h2>Visible tasks</h2>
      <pre>{JSON.stringify(api?.tasks.visible(), null, 2)}</pre>
    </article>
  </section>
</main>
