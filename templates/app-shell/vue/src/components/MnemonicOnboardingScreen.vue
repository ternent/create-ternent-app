<script setup lang="ts">
defineProps<{
  mnemonicWords: string[];
  identityStatus: string;
  password: string;
  recoverMnemonic: string;
  errorMessage: string | null;
}>();

defineEmits<{
  "update:password": [value: string];
  "update:recover-mnemonic": [value: string];
  "create-draft": [];
  unlock: [];
  recover: [];
}>();
</script>

<template>
  <section class="onboarding">
    <h1>Ternent app shell</h1>
    <p>Bootstrap or unlock the local identity session before entering the app.</p>
    <p><strong>Identity status:</strong> {{ identityStatus }}</p>
    <div class="actions">
      <button type="button" @click="$emit('create-draft')">Create onboarding draft</button>
      <button type="button" @click="$emit('unlock')">Unlock session</button>
      <button type="button" @click="$emit('recover')">Recover from mnemonic</button>
    </div>
    <label class="field">
      <span>Password</span>
      <input :value="password" @input="$emit('update:password', ($event.target as HTMLInputElement).value)" />
    </label>
    <label class="field">
      <span>Recovery phrase</span>
      <textarea
        rows="3"
        :value="recoverMnemonic"
        @input="$emit('update:recover-mnemonic', ($event.target as HTMLTextAreaElement).value)"
      />
    </label>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <div class="word-grid">
      <div v-for="(word, index) in mnemonicWords" :key="word + index" class="word-chip">
        {{ index + 1 }}. {{ word }}
      </div>
    </div>
  </section>
</template>

<style scoped>
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
