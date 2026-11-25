<script setup lang="ts">
import Questionnaire, { type Question, type QuestionnaireAnswers } from "@/components/vin/questionnaire.vue";

const questions: Question[] = [
  {
    id: "length",
    prompt: "How long do you want to hike?",
    options: [
      { value: "short", label: "Under 2 hours" },
      { value: "half-day", label: "Half a day" },
      { value: "full-day", label: "A full day" },
    ],
    other: true,
  },
];
const onSubmit = (answers: QuestionnaireAnswers) => console.log(answers);
</script>

<template>
  <Questionnaire label="Trip length" style="max-width: 440px" :questions="questions" @submit="onSubmit" />
</template>
