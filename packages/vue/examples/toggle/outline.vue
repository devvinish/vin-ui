<script setup lang="ts">
import Toggle from "@/components/vin/toggle.vue";

</script>

<template>
  <Toggle variant="outline" default-pressed>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9z" /></svg>
    Starred
  </Toggle>
  <Toggle variant="outline">Show archived</Toggle>
  <Toggle variant="outline" disabled>Locked</Toggle>
</template>
