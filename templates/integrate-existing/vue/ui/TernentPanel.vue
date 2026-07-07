<script setup lang="ts">
import { useTernent } from "../useTernent";

const api = useTernent();
</script>

<template>
  <section>
    <h2>Ternent integration panel</h2>
    <pre>{{ JSON.stringify(api.value?.identity.getActiveIdentity(), null, 2) }}</pre>
    <pre>{{ JSON.stringify(api.value?.permissions.readableForViewer(), null, 2) }}</pre>
    <pre>{{ JSON.stringify(api.value?.tasks.visible(), null, 2) }}</pre>
  </section>
</template>
