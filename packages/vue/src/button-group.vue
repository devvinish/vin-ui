<script lang="ts">
/*
 * VinUI · Button Group (Vue). API: spec/button-group.json.
 * Joins Buttons into one control. Name the group with aria-label.
 */
import { useAttrs } from "vue";

/** Dev-only warnings, without needing Node's `process` (Vite and the browser don't have it). */
const isDev = () => (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV !== "production";
</script>

<script setup lang="ts">
withDefaults(defineProps<{ orientation?: "horizontal" | "vertical" }>(), { orientation: "horizontal" });

const attrs = useAttrs();
if (isDev() && !attrs["aria-label"] && !attrs["aria-labelledby"]) {
  console.warn("VinUI ButtonGroup: give the group an aria-label.");
}
</script>

<template>
  <div role="group" :class="['vin-btn-group', orientation === 'vertical' && 'vin-btn-group--vertical']"><slot /></div>
</template>
