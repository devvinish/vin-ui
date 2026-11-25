<script setup lang="ts">
/*
 * VinUI · Skeleton (Vue). API: spec/skeleton.json.
 * Size each shape with style. Wrap them in one element with role="status" and an aria-label.
 */
withDefaults(defineProps<{ shape?: "block" | "text" | "circle" }>(), { shape: "block" });
</script>

<template>
  <div :class="['vin-skeleton', shape !== 'block' && `vin-skeleton--${shape}`]" />
</template>
