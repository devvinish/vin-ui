<script setup lang="ts">
import RadioGroup from "@/components/vin/radio-group.vue";


const options = [
  { value: "instant", label: "Instantly" },
  { value: "daily", label: "Once a day" },
  { value: "weekly", label: "Once a week" },
  { value: "never", label: "Never" },
];
</script>

<template>
  <RadioGroup label="Email me" :options="options" default-value="daily" />
</template>
