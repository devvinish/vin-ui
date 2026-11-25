<script setup lang="ts">
/*
 * VinUI · Aspect Ratio (Vue). API: spec/aspect-ratio.json.
 *   <AspectRatio :ratio="16 / 9"><img … /></AspectRatio>
 */
withDefaults(defineProps<{
  /** Width ÷ height: 16 / 9, 4 / 3, 1 … or a CSS string like "16 / 9". Default 16 / 9. */
  ratio?: number | string;
}>(), { ratio: "16 / 9" });
</script>

<template>
  <div class="vin-aspect" :style="{ '--vin-ratio': String(ratio) }"><slot /></div>
</template>
