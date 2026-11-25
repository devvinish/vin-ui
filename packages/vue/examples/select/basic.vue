<script setup lang="ts">
import Select from "@/components/vin/select.vue";


const frameworks = [
  { value: "astro", label: "Astro" },
  { value: "next", label: "Next.js" },
  { value: "nuxt", label: "Nuxt" },
  { value: "remix", label: "Remix" },
  { value: "sveltekit", label: "SvelteKit" },
];
</script>

<template>
  <Select label="Framework" :options="frameworks" default-value="astro" name="framework" style="width: 100%; max-width: 320px" />
</template>
