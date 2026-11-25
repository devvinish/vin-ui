<script setup lang="ts">
import Questionnaire, { type Question } from "@/components/vin/questionnaire.vue";

const questions: Question[] = [
  {
    id: "length",
    prompt: "How long do you want to hike?",
    options: [
      { value: "short", label: "Under 2 hours" },
      { value: "half-day", label: "Half a day" },
      { value: "full-day", label: "A full day" },
    ],
  },
];
</script>

<template>
  <Questionnaire
    label="Trip length"
    style="max-width: 440px"
    default-state="submitted"
    :default-values="{ length: ['half-day'] }"
    :questions="questions"
  />
</template>
