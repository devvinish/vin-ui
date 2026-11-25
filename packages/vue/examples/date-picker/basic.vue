<script setup lang="ts">
import DatePicker from "@/components/vin/date-picker.vue";
</script>

<template>
  <div style="display: grid; gap: 16px; width: 100%; max-width: 280px">
    <DatePicker label="Due date" default-value="2026-11-14" name="due" />
  </div>
</template>
