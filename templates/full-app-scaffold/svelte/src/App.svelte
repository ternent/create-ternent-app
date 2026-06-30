<script lang="ts">
  import MnemonicOnboardingScreen from "./components/MnemonicOnboardingScreen.svelte";
  import { useTernent } from "./lib/useTernent";

  let api: Awaited<ReturnType<typeof useTernent>> | null = null;

  useTernent().then((value) => {
    api = value;
  });
</script>

<main>
  <MnemonicOnboardingScreen
    mnemonicWords={["alpha", "bravo", "charlie", "delta", "echo", "foxtrot"]}
  />
  <section style="padding: 1.5rem">
    <h2>Workspace tasks</h2>
    <pre>{JSON.stringify(api?.tasks.all(), null, 2)}</pre>
  </section>
</main>
