<script setup lang="ts">
import Chart from "@/components/vin/chart.vue";

const signups = [
  { day: "Mon", now: 42, before: 35 },
  { day: "Tue", now: 58, before: 41 },
  { day: "Wed", now: 51, before: 49 },
  { day: "Thu", now: 73, before: 52 },
  { day: "Fri", now: 69, before: 61 },
  { day: "Sat", now: 38, before: 30 },
  { day: "Sun", now: 31, before: 24 },
];
</script>

<template>
  <Chart
    type="line"
    label="Signups per day, this week and last week"
    :data="signups"
    index="day"
    index-label="Day"
    :series="[{ key: 'now', label: 'This week' }, { key: 'before', label: 'Last week' }]"
    style="max-width: 560px"
  />
</template>
