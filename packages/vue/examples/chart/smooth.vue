<script setup lang="ts">
import Chart from "@/components/vin/chart.vue";

const visitors = [
  { month: "Jan", desktop: 186, mobile: 80 },
  { month: "Feb", desktop: 305, mobile: 200 },
  { month: "Mar", desktop: 237, mobile: 120 },
  { month: "Apr", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "Jun", desktop: 214, mobile: 140 },
];
</script>

<template>
  <Chart
    type="area"
    stacked
    curve="smooth"
    label="Visitors by device, January to June"
    :data="visitors"
    index="month"
    index-label="Month"
    :series="[{ key: 'desktop', label: 'Desktop' }, { key: 'mobile', label: 'Mobile' }]"
  />
</template>
