<script setup lang="ts">
import { onMounted, shallowRef } from "vue";
import MnemonicOnboardingScreen from "./components/MnemonicOnboardingScreen.vue";
import { useTernent } from "./composables/useTernent";

const api = shallowRef<Awaited<ReturnType<typeof import("./app/api/createAppApi").createAppApi>> | null>(null);

onMounted(async () => {
  api.value = (await useTernent()).value;
});
</script>

<template>
  <main>
    <MnemonicOnboardingScreen
      :mnemonic-words="['alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot']"
    />
    <section style="padding: 1.5rem">
      <h2>Workspace tasks</h2>
      <pre>{{ JSON.stringify(api?.tasks.all(), null, 2) }}</pre>
    </section>
  </main>
</template>
