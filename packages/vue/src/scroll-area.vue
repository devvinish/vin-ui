<script setup lang="ts">
/*
 * VinUI · Scroll Area (Vue). API: spec/scroll-area.json.
 * Native scrolling with thin, themed scrollbars. The box is in the Tab order (tabindex 0),
 * so keyboard users can scroll it; with a label it is a named region for screen readers.
 *   <ScrollArea label="Releases" style="height: 220px">…</ScrollArea>
 */
withDefaults(defineProps<{
  /** Which way the content scrolls. */
  orientation?: "vertical" | "horizontal" | "both";
  /** A name for the region, read by screen readers. */
  label?: string;
}>(), { orientation: "vertical" });
</script>

<template>
  <div
    :role="label ? 'region' : undefined"
    :aria-label="label"
    tabindex="0"
    :class="['vin-scroll-area', orientation === 'horizontal' && 'vin-scroll-area--horizontal', orientation === 'both' && 'vin-scroll-area--both']"
  >
    <slot />
  </div>
</template>
