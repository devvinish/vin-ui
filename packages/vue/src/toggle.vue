<script lang="ts">
/*
 * VinUI · Toggle (Vue). API: spec/toggle.json.
 * A button that stays pressed: aria-pressed tells screen readers its state.
 *   <Toggle v-model:pressed="bold" size="icon" aria-label="Bold">…</Toggle>
 */
import { computed, ref, useAttrs } from "vue";

/** Dev-only warnings, without needing Node's `process` (Vite and the browser don't have it). */
const isDev = () => (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV !== "production";
const cx = (...c: unknown[]) => c.filter((x) => typeof x === "string" && x).join(" ");

export type ToggleVariant = "default" | "outline";
export type ToggleSize = "sm" | "md" | "lg" | "icon";

/** The class list for a toggle. */
export function toggleClasses({ variant = "default", size = "md", className }: { variant?: ToggleVariant; size?: ToggleSize; className?: string } = {}) {
  return cx("vin-toggle", variant === "outline" && "vin-toggle--outline", size !== "md" && `vin-toggle--${size}`, className);
}
</script>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  /** Pressed state (v-model:pressed). */
  pressed?: boolean;
  /** Pressed at first, when you don't use v-model:pressed. */
  defaultPressed?: boolean;
  variant?: ToggleVariant;
  /** "icon" is square, for icon-only toggles (give them an aria-label). */
  size?: ToggleSize;
}>(), { pressed: undefined, variant: "default", size: "md" });

const emit = defineEmits<{
  "update:pressed": [pressed: boolean];
  /** Call event.preventDefault() to keep the state. */
  click: [event: MouseEvent];
}>();

const attrs = useAttrs();
if (isDev() && props.size === "icon" && !attrs["aria-label"] && !attrs["aria-labelledby"]) {
  console.warn("VinUI Toggle: icon-only toggles need an aria-label.");
}

const inner = ref(props.defaultPressed);
const on = computed(() => props.pressed ?? inner.value);
function onClick(e: MouseEvent) {
  emit("click", e);
  if (e.defaultPrevented) return;
  inner.value = !on.value;
  emit("update:pressed", inner.value);
}
</script>

<template>
  <button type="button" :aria-pressed="on" :class="toggleClasses({ variant, size })" @click="onClick"><slot /></button>
</template>
