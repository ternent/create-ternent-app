<script lang="ts">
  export let mnemonicWords: string[] = [];
  export let identityStatus = "locked";
  export let password = "";
  export let recoverMnemonic = "";
  export let errorMessage: string | null = null;
  export let onCreateDraft: () => void = () => undefined;
  export let onUnlock: () => void = () => undefined;
  export let onRecover: () => void = () => undefined;
  export let onPasswordChange: (value: string) => void = () => undefined;
  export let onRecoverMnemonicChange: (value: string) => void = () => undefined;
</script>

<section class="onboarding">
  <h1>Ternent app shell</h1>
  <p>Bootstrap or unlock the local identity session before entering the app.</p>
  <p><strong>Identity status:</strong> {identityStatus}</p>
  <div class="actions">
    <button type="button" on:click={onCreateDraft}>Create onboarding draft</button>
    <button type="button" on:click={onUnlock}>Unlock session</button>
    <button type="button" on:click={onRecover}>Recover from mnemonic</button>
  </div>
  <label class="field">
    <span>Password</span>
    <input value={password} on:input={(event) => onPasswordChange((event.currentTarget as HTMLInputElement).value)} />
  </label>
  <label class="field">
    <span>Recovery phrase</span>
    <textarea
      rows="3"
      value={recoverMnemonic}
      on:input={(event) => onRecoverMnemonicChange((event.currentTarget as HTMLTextAreaElement).value)}
    />
  </label>
  {#if errorMessage}
    <p class="error">{errorMessage}</p>
  {/if}
  <div class="word-grid">
    {#each mnemonicWords as word, index}
      <div class="word-chip">{index + 1}. {word}</div>
    {/each}
  </div>
</section>

<style>
  .onboarding {
    padding: 1.5rem;
    max-width: 56rem;
    margin: 0 auto;
  }

  .actions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    margin-bottom: 1rem;
  }

  .field {
    display: grid;
    gap: 0.35rem;
    margin-bottom: 1rem;
  }

  .word-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 0.75rem;
  }

  .word-chip {
    border: 1px solid #cbd5e1;
    border-radius: 0.75rem;
    padding: 0.75rem;
  }

  .error {
    color: #b91c1c;
  }
</style>
