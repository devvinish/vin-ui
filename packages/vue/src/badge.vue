<script setup lang="ts">
/*
 * VinUI · Badge (Vue). API: spec/badge.json.
 * Styling comes from @vinui/styles (the vin-badge classes), so this file is the same for all 8 styles.
 */
import { computed } from "vue";

const props = withDefaults(defineProps<{
  /** Colour and meaning. Default: "neutral". */
  variant?: BadgeVariant;
  /** Show a status dot before the label. */
  dot?: boolean;
}>(), { variant: "neutral" });

const cls = computed(() => badgeClasses({ variant: props.variant }));
</script>

<script lang="ts">
export type BadgeVariant = "neutral" | "primary" | "success" | "warning" | "danger" | "outline";

/** The class list for a badge. */
export function badgeClasses({ variant = "neutral", className }: { variant?: BadgeVariant; className?: string } = {}): string {
  return ["vin-badge", variant !== "neutral" && `vin-badge--${variant}`, className].filter(Boolean).join(" ");
}
</script>

<template>
  <span :class="cls"><span v-if="dot" class="vin-badge__dot" aria-hidden="true" /><slot /></span>
</template>
