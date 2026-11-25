<script setup lang="ts">
import Carousel from "@/components/vin/carousel.vue";
import Card, { CardHeader, CardTitle, CardDescription } from "@/components/vin/card.vue";

const styles = [
  ["Precision", "Crisp hairlines, quiet depth."],
  ["Tactile", "Physical, pressable buttons."],
  ["Clay", "Puffy, friendly, inflated."],
  ["Tonal", "Colour-led, pill shapes, springy."],
  ["Editorial", "Typographic, airy, magazine."],
  ["Terminal", "Developer-native, monospace."],
  ["Paper", "Warm, hand-made, human."],
  ["Bento", "Calm, layered, borderless."],
];
</script>

<template>
  <Carousel label="The eight styles" :per-view="3" :dots="false">
    <Card v-for="[name, text] in styles" :key="name">
      <CardHeader>
        <CardTitle>{{ name }}</CardTitle>
        <CardDescription>{{ text }}</CardDescription>
      </CardHeader>
    </Card>
  </Carousel>
</template>
