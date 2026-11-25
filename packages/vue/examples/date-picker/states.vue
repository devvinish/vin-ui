<script setup lang="ts">
import DatePicker from "@/components/vin/date-picker.vue";
</script>

<template>
  <div style="display: grid; gap: 16px; width: 100%; max-width: 280px">
    <DatePicker label="Start date" error="Choose a start date." />
    <DatePicker label="End date" default-value="2026-12-31" disabled />
  </div>
</template>
