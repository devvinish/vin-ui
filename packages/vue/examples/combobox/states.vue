<script setup lang="ts">
import Combobox from "@/components/vin/combobox.vue";

const countries = [
  { value: "au", label: "Australia" },
  { value: "ca", label: "Canada" },
  { value: "in", label: "India" },
  { value: "jp", label: "Japan", disabled: true },
  { value: "gb", label: "United Kingdom" },
];
const languages = [{ value: "en", label: "English" }, { value: "hi", label: "Hindi" }];
</script>

<template>
  <div style="display: grid; gap: 16px; width: 100%; max-width: 320px">
    <Combobox label="Country" :options="countries" placeholder="Search countries…" error="Choose your country." />
    <Combobox label="Language" :options="languages" default-value="en" disabled />
  </div>
</template>
