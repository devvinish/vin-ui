<script setup lang="ts">
import Chart from "@/components/vin/chart.vue";

const browsers = [
  { browser: "Chrome", visitors: 275 },
  { browser: "Safari", visitors: 200 },
  { browser: "Firefox", visitors: 187 },
  { browser: "Edge", visitors: 173 },
  { browser: "Other", visitors: 90 },
];
</script>

<template>
  <Chart
    type="donut"
    center-label="Visitors"
    label="Visitors by browser"
    :data="browsers"
    index="browser"
    index-label="Browser"
    :series="[{ key: 'visitors', label: 'Visitors' }]"
  />
</template>
