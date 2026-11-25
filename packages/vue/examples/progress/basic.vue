<script setup lang="ts">
import Progress from "@/components/vin/progress.vue";

</script>

<template>
  <div style="display: grid; gap: 20px; width: 100%; max-width: 320px">
    <Progress label="Uploading design.fig" :value="64" show-value />
    <Progress label="Backup complete" :value="100" variant="success" show-value />
  </div>
</template>
