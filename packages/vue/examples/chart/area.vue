<script setup lang="ts">
import Chart from "@/components/vin/chart.vue";

const revenue = [
  { month: "Jan", revenue: 12400 },
  { month: "Feb", revenue: 15100 },
  { month: "Mar", revenue: 14200 },
  { month: "Apr", revenue: 18900 },
  { month: "May", revenue: 22300 },
  { month: "Jun", revenue: 21000 },
  { month: "Jul", revenue: 26400 },
  { month: "Aug", revenue: 29800 },
];

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const short = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", notation: "compact", maximumFractionDigits: 0 });
const format = (v: number) => inr.format(v);
const tickFormat = (v: number) => short.format(v);
</script>

<template>
  <Chart
    type="area"
    label="Revenue by month, January to August"
    :data="revenue"
    index="month"
    index-label="Month"
    :series="[{ key: 'revenue', label: 'Revenue' }]"
    :format="format"
    :tick-format="tickFormat"
    style="max-width: 560px"
  />
</template>
