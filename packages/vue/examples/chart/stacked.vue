<script setup lang="ts">
import Chart from "@/components/vin/chart.vue";

const traffic = [
  { month: "Jan", organic: 420, paid: 210, referral: 90 },
  { month: "Feb", organic: 480, paid: 260, referral: 110 },
  { month: "Mar", organic: 510, paid: 240, referral: 150 },
  { month: "Apr", organic: 560, paid: 300, referral: 140 },
  { month: "May", organic: 610, paid: 320, referral: 170 },
  { month: "Jun", organic: 690, paid: 310, referral: 210 },
];
</script>

<template>
  <Chart
    type="bar"
    stacked
    label="Visits by traffic source, January to June"
    :data="traffic"
    index="month"
    index-label="Month"
    :series="[{ key: 'organic', label: 'Organic' }, { key: 'paid', label: 'Paid' }, { key: 'referral', label: 'Referral' }]"
  />
</template>
