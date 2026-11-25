<script setup lang="ts">
import Switch from "@/components/vin/switch.vue";

</script>

<template>
  <div style="display: grid; gap: 18px; width: 100%; max-width: 380px">
    <Switch label="Marketing emails" description="News, offers and product updates." control-position="end" />
    <Switch label="Security alerts" description="Sign-ins from new devices." control-position="end" default-checked />
  </div>
</template>
