<script setup lang="ts">
import Switch from "@/components/vin/switch.vue";

</script>

<template>
  <div style="display: grid; gap: 14px">
    <Switch label="Compact view" size="sm" default-checked />
    <Switch label="Beta features (managed)" default-checked disabled />
    <Switch label="Offline sync" disabled />
  </div>
</template>
