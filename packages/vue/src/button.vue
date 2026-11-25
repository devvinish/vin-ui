<script setup lang="ts">
/*
 * VinUI · Button (Vue)
 * API: spec/button.json. Styling comes from @vinui/styles (the vin-btn classes),
 * so this file is the same for all 8 styles. Pass href to render a link.
 */
import { computed, useAttrs } from "vue";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<{
  /** Visual weight. Default: "primary". */
  variant?: ButtonVariant;
  /** Height and padding. "icon" makes a square button: give it an aria-label. Default: "md". */
  size?: ButtonSize;
  /** Render an <a> instead of a <button>. */
  href?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}>(), { variant: "primary", size: "md", type: "button" });

const attrs = useAttrs();
if (isDev() && props.size === "icon" && !attrs["aria-label"] && !attrs["aria-labelledby"]) {
  console.warn("VinUI Button: icon-only buttons need an aria-label so screen readers can name them.");
}

const cls = computed(() => buttonClasses({ variant: props.variant, size: props.size }));

/** A disabled link keeps its look but can't be followed or focused. */
function linkAttrs() {
  if (!props.disabled) return attrs;
  const { onClick: _onClick, ...rest } = attrs;
  return { ...rest, tabindex: -1, "aria-disabled": "true", onClick: (e: MouseEvent) => e.preventDefault() };
}
</script>

<script lang="ts">
/** Dev-only warnings, without needing Node's `process` (Vite and the browser don't have it). */
const isDev = () => (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV !== "production";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

/** The class list for a button. Useful when you style a router's link component. */
export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}): string {
  return ["vin-btn", variant !== "primary" && `vin-btn--${variant}`, size !== "md" && `vin-btn--${size}`, className]
    .filter(Boolean)
    .join(" ");
}
</script>

<template>
  <a v-if="href !== undefined" v-bind="linkAttrs()" :href="href" :class="cls"><slot /></a>
  <button v-else v-bind="attrs" :type="type" :disabled="disabled" :class="cls"><slot /></button>
</template>
