<script setup lang="ts">
import Calendar from "@/components/vin/calendar.vue";

const onChange = (date: unknown) => console.log(date);
</script>

<template>
  <Calendar default-value="2026-11-14" @update:model-value="onChange" />
</template>
