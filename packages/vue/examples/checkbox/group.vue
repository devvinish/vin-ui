<script setup lang="ts">
import Checkbox from "@/components/vin/checkbox.vue";

</script>

<template>
  <fieldset style="display: grid; gap: 10px; margin: 0; padding: 0; border: 0; min-width: 0">
    <legend class="vin-label" style="padding: 0; margin-bottom: 10px">Notify me about</legend>
    <Checkbox label="Comments" default-checked />
    <Checkbox label="Mentions" default-checked />
    <Checkbox label="New releases" />
    <Checkbox label="Billing (always on)" default-checked disabled />
  </fieldset>
</template>
