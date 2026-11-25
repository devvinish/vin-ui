<script setup lang="ts">
import RadioGroup from "@/components/vin/radio-group.vue";


const plans = [
  { value: "hobby", label: "Hobby", description: "Free for personal projects." },
  { value: "pro", label: "Pro", description: "For small teams, billed monthly." },
  { value: "enterprise", label: "Enterprise", description: "Single sign-on and priority support." },
];
</script>

<template>
  <RadioGroup label="Plan" :options="plans" default-value="pro" variant="cards" style="width: 100%; max-width: 360px" />
</template>
