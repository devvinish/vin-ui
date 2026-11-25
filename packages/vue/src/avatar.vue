<script lang="ts">
/*
 * VinUI · Avatar (Vue). API: spec/avatar.json.
 * role="img" with the person's name; the picture covers the initials, and if it fails to load the initials show.
 *   import Avatar, { AvatarGroup } from "@/components/vin/avatar.vue";
 */
import { defineComponent, h, ref, watch } from "vue";

/** "Ada Lovelace" → "AL". */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

export const AvatarGroup = defineComponent({
  name: "AvatarGroup",
  props: {
    /** Name for the group, e.g. "Project members". */
    label: String,
  },
  setup: (props, { slots }) => () => h("div", { role: "group", "aria-label": props.label, class: "vin-avatar-group" }, slots.default?.()),
});
</script>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  /** Who it is: the accessible name, and the initials when there's no picture. */
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg";
  shape?: "circle" | "square";
  /** Presence dot. It is added to the name: "Ada Lovelace (online)". */
  status?: "online" | "busy" | "away";
  /** Text to show instead of the initials, e.g. "+3". */
  fallback?: string;
}>(), { size: "md", shape: "circle" });

const failed = ref(false);
watch(() => props.src, () => { failed.value = false; });
</script>

<template>
  <span
    role="img"
    :aria-label="status ? `${name} (${status})` : name"
    :class="['vin-avatar', size !== 'md' && `vin-avatar--${size}`, shape === 'square' && 'vin-avatar--square']"
  >
    <img v-if="src && !failed" class="vin-avatar__img" :src="src" alt="" @error="failed = true" />
    <span class="vin-avatar__fallback">{{ fallback ?? initials(name) }}</span>
    <span v-if="status" :class="`vin-avatar__status vin-avatar__status--${status}`" />
  </span>
</template>
