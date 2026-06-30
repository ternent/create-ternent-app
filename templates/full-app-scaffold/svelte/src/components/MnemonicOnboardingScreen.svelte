<script lang="ts">
  export let mnemonicWords: string[] = [];
</script>

<section class="onboarding">
  <h1>Secure your mnemonic</h1>
  <p>Store the recovery phrase before continuing into the workspace shell.</p>
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
</style>
