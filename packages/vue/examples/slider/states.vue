<script setup lang="ts">
import Slider from "@/components/vin/slider.vue";

</script>

<template>
  <div style="display: grid; gap: 20px; width: 100%; max-width: 320px">
    <Slider label="Brightness" :default-value="70" :step="10" show-value :format-value="(v: number) => `${v}%`" />
    <Slider label="Bass (locked)" :default-value="30" disabled />
  </div>
</template>
