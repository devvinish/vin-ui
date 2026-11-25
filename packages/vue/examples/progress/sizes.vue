<script setup lang="ts">
import Progress from "@/components/vin/progress.vue";

</script>

<template>
  <div style="display: grid; gap: 20px; width: 100%; max-width: 320px">
    <Progress aria-label="Small" size="sm" :value="25" />
    <Progress aria-label="Medium" :value="50" />
    <Progress aria-label="Large" size="lg" :value="75" />
  </div>
</template>
