<script setup lang="ts">
import Slider from "@/components/vin/slider.vue";

</script>

<template>
  <Slider
    label="Price"
    :default-value="[200, 700]"
    :min="0"
    :max="1000"
    :step="50"
    show-value
    :format-value="(v: number) => `₹${v}`"
    :thumb-labels="['Minimum price', 'Maximum price']"
    name="price"
    style="width: 100%; max-width: 320px"
  />
</template>
