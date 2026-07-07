<script setup lang="ts">
import { onMounted, ref } from "vue";
import MnemonicOnboardingScreen from "./components/MnemonicOnboardingScreen.vue";
import { useTernent } from "./composables/useTernent";

const api = ref<Awaited<ReturnType<typeof import("./app/api/createAppApi").createAppApi>> | null>(null);
const draft = ref<{ mnemonicWords: string[]; createdAt: string } | null>(null);
const password = ref("local-dev-password");
const recoverMnemonic = ref("");
const flowError = ref<string | null>(null);

onMounted(async () => {
  api.value = (await useTernent()).value;
  if (api.value) {
    draft.value = await api.value.identity.createOnboardingDraft();
  }
});

async function handleCreateDraft() {
  flowError.value = null;
  if (!api.value) {
    return;
  }
  draft.value = await api.value.identity.createOnboardingDraft();
}

async function handleUnlock() {
  flowError.value = null;
  if (!api.value) {
    return;
  }

  try {
    if (draft.value) {
      await api.value.identity.completeOnboarding({
        draft: draft.value,
        password: password.value,
        confirmPassword: password.value,
        mnemonicConfirmed: true,
      });
      return;
    }

    await api.value.identity.unlockWithPassword({ password: password.value });
  } catch (error) {
    flowError.value = error instanceof Error ? error.message : String(error);
  }
}

async function handleRecover() {
  flowError.value = null;
  if (!api.value) {
    return;
  }

  try {
    await api.value.identity.recoverFromMnemonic({
      mnemonic: recoverMnemonic.value,
      password: password.value,
      confirmPassword: password.value,
    });
  } catch (error) {
    flowError.value = error instanceof Error ? error.message : String(error);
  }
}
</script>

<template>
  <main>
    <MnemonicOnboardingScreen
      :mnemonic-words="draft?.mnemonicWords ?? []"
      :identity-status="api?.identity.status() ?? 'locked'"
      :password="password"
      :recover-mnemonic="recoverMnemonic"
      :error-message="flowError ?? api?.lastError.current() ?? null"
      @update:password="password = $event"
      @update:recover-mnemonic="recoverMnemonic = $event"
      @create-draft="handleCreateDraft"
      @unlock="handleUnlock"
      @recover="handleRecover"
    />
    <section style="padding: 1.5rem; display: grid; gap: 1rem">
      <article>
        <h2>Runtime status</h2>
        <pre>{{ JSON.stringify({ status: api?.status.current(), lastError: api?.lastError.current() }, null, 2) }}</pre>
      </article>
      <article>
        <h2>Active identity</h2>
        <pre>{{ JSON.stringify(api?.identity.getActiveIdentity(), null, 2) }}</pre>
      </article>
      <article>
        <h2>Readable permissions</h2>
        <pre>{{ JSON.stringify(api?.permissions.readableForViewer(), null, 2) }}</pre>
      </article>
      <article>
        <h2>Visible tasks</h2>
        <pre>{{ JSON.stringify(api?.tasks.visible(), null, 2) }}</pre>
      </article>
    </section>
  </main>
</template>
