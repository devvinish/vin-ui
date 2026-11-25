<script setup lang="ts">
import Field from "@/components/vin/input.vue";

</script>

<template>
  <div style="display: grid; gap: 16px; width: 100%; max-width: 320px">
    <Field label="Username" default-value="vinish" error="That username is taken." />
    <Field label="Plan" default-value="Free" disabled />
    <Field label="Bio" multiline :rows="3" placeholder="A few words about you" />
  </div>
</template>
