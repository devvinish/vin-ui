<script setup lang="ts">
import Questionnaire, { type Question, type QuestionnaireAnswers } from "@/components/vin/questionnaire.vue";

const questions: Question[] = [
  {
    id: "who",
    prompt: "Who is coming?",
    options: [
      { value: "solo", label: "Just me" },
      { value: "friends", label: "Friends" },
      { value: "kids", label: "Family with kids" },
    ],
  },
  {
    id: "see",
    prompt: "What would you like to see?",
    hint: "Choose any.",
    multiple: true,
    options: [
      { value: "lakes", label: "Lakes" },
      { value: "views", label: "Mountain views" },
      { value: "waterfalls", label: "Waterfalls" },
    ],
    other: true,
  },
];
const onSubmit = (answers: QuestionnaireAnswers) => console.log(answers);
</script>

<template>
  <Questionnaire
    title="A few questions first"
    description="So I can plan the right trip for you."
    style="max-width: 440px"
    :questions="questions"
    :default-values="{ who: ['solo'], see: ['lakes', 'other'] }"
    :default-other="{ see: 'Wildflowers' }"
    @submit="onSubmit"
  />
</template>
