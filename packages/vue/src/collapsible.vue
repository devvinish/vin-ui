<script lang="ts">
/*
 * VinUI · Collapsible (Vue). API: spec/collapsible.json.
 * A native <details>: one section behind a small button.
 *   <Collapsible v-model:open="open" trigger="Order details">…</Collapsible>
 */
import { computed, ref, type HTMLAttributes } from "vue";
</script>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  /** The summary text. Or use the #trigger slot. */
  trigger?: string;
  /** Open or closed (v-model:open). */
  open?: boolean;
  /** Open at first, when you don't use v-model:open. */
  defaultOpen?: boolean;
  /** Attributes for the content wrapper (class, style). */
  contentProps?: HTMLAttributes;
}>(), { open: undefined });

const emit = defineEmits<{ "update:open": [open: boolean] }>();
defineSlots<{ default?(): unknown; trigger?(): unknown }>();

const inner = ref(props.defaultOpen);
const isOpen = computed(() => props.open ?? inner.value);
function onToggle(e: Event) {
  const now = (e.currentTarget as HTMLDetailsElement).open;
  if (now === isOpen.value) return;
  inner.value = now;
  emit("update:open", now);
}
</script>

<template>
  <details class="vin-collapsible" :open="isOpen" @toggle="onToggle">
    <summary class="vin-collapsible__trigger"><slot name="trigger">{{ trigger }}</slot></summary>
    <div v-bind="contentProps" :class="['vin-collapsible__content', contentProps?.class]"><slot /></div>
  </details>
</template>
