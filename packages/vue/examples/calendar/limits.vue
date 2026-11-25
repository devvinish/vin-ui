<script setup lang="ts">
import Calendar from "@/components/vin/calendar.vue";

// Weekdays only, between two dates; the week starts on Sunday.
const weekend = (date: string) => [0, 6].includes(new Date(`${date}T00:00:00Z`).getUTCDay());
</script>

<template>
  <Calendar default-value="2026-11-18" :week-starts-on="0" min="2026-11-05" max="2026-12-20" :is-date-disabled="weekend" />
</template>
