<script lang="ts">
/*
 * VinUI · Separator (Vue). API: spec/separator.json.
 * An <hr> (a separator to screen readers), a hidden decorative line, or a line with a word in the middle.
 */
import { computed } from "vue";
</script>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  orientation?: "horizontal" | "vertical";
  /** Only visual: hidden from screen readers. */
  decorative?: boolean;
  /** A word in the middle of the line, like "or". Or use the default slot. */
  label?: string;
}>(), { orientation: "horizontal" });

const slots = defineSlots<{ default?(): unknown }>();
const hasLabel = computed(() => props.label != null || !!slots.default);
const cls = computed(() => [
  "vin-separator",
  props.orientation === "vertical" && "vin-separator--vertical",
  hasLabel.value && "vin-separator--label",
]);
</script>

<template>
  <div v-if="hasLabel" :class="cls"><slot>{{ label }}</slot></div>
  <div v-else-if="decorative" aria-hidden="true" :class="cls" />
  <hr v-else :aria-orientation="orientation === 'vertical' ? 'vertical' : undefined" :class="cls" />
</template>
