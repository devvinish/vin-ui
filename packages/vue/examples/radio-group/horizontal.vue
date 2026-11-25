<script setup lang="ts">
import RadioGroup from "@/components/vin/radio-group.vue";


const sizes = [
  { value: "s", label: "S" },
  { value: "m", label: "M" },
  { value: "l", label: "L" },
  { value: "xl", label: "XL (sold out)", disabled: true },
];
</script>

<template>
  <RadioGroup label="Size" :options="sizes" default-value="m" orientation="horizontal" />
</template>
