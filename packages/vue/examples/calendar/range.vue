<script setup lang="ts">
import { ref } from "vue";
import Calendar, { type DateRange } from "@/components/vin/calendar.vue";

const trip = ref<DateRange>({ from: "2026-11-09", to: "2026-11-15" });
</script>

<template>
  <Calendar v-model="trip" mode="range" />
</template>
