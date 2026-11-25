<script setup lang="ts">
import Carousel from "@/components/vin/carousel.vue";
import Heading, { Text } from "@/components/vin/typography.vue";

const steps = [
  ["Pick a style", "Eight looks, one set of components."],
  ["Choose an accent", "Any colour. Text on it stays readable."],
  ["Copy the code", "Plain HTML or React. No build step needed."],
  ["Ship it", "Light, dark and accessible out of the box."],
];
const panel = "display: grid; align-content: end; gap: 6px; min-height: 200px; padding: 28px; border-radius: var(--vin-radius-lg); background: color-mix(in srgb, var(--vin-accent) 13%, transparent)";
</script>

<template>
  <Carousel label="Getting started" style="max-width: 520px">
    <div v-for="[title, text] in steps" :key="title" :style="panel">
      <Heading :level="3" style="margin: 0">{{ title }}</Heading>
      <Text style="margin: 0">{{ text }}</Text>
    </div>
  </Carousel>
</template>
