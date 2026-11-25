<script lang="ts">
/*
 * VinUI · Accordion (Vue). API: spec/accordion.json.
 * Native <details>: the browser handles keyboard and find-in-page. type="single" keeps one open (same name on every item).
 *   <Accordion v-model="open" :items="faq" />
 * Use the #title and #content slots ({ item }) for rich content.
 */
import { computed, ref, useId } from "vue";

export type AccordionItem = { value: string; title: string; content?: string };
</script>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  items: AccordionItem[];
  type?: "single" | "multiple";
  /** The open items (v-model). */
  modelValue?: string[];
  /** Open at first, when you don't use v-model. */
  defaultValue?: string[];
  variant?: "default" | "outline";
}>(), { type: "single", modelValue: undefined, defaultValue: () => [], variant: "default" });

const emit = defineEmits<{ "update:modelValue": [value: string[]] }>();
defineSlots<{ title?(p: { item: AccordionItem }): unknown; content?(p: { item: AccordionItem }): unknown }>();

const name = "vin-acc-" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
const inner = ref<string[]>(props.defaultValue);
const open = computed(() => props.modelValue ?? inner.value);
// The latest list, even before the parent passes a new v-model back (toggle events can come in pairs).
let latest = open.value;

function set(next: string[]) {
  latest = next;
  inner.value = next;
  emit("update:modelValue", next);
}
function onToggle(v: string, e: Event) {
  const isOpen = (e.currentTarget as HTMLDetailsElement).open;
  const cur = props.modelValue !== undefined && props.modelValue !== latest ? (latest = props.modelValue) : latest;
  if (isOpen && !cur.includes(v)) set(props.type === "single" ? [v] : [...cur, v]);
  if (!isOpen && cur.includes(v)) set(cur.filter((x) => x !== v));
}
</script>

<template>
  <div :class="['vin-accordion', variant === 'outline' && 'vin-accordion--outline']">
    <details
      v-for="item in items"
      :key="item.value"
      class="vin-accordion__item"
      :name="type === 'single' ? name : undefined"
      :open="open.includes(item.value)"
      @toggle="onToggle(item.value, $event)"
    >
      <summary class="vin-accordion__trigger"><slot name="title" :item="item">{{ item.title }}</slot></summary>
      <div class="vin-accordion__content"><slot name="content" :item="item">{{ item.content }}</slot></div>
    </details>
  </div>
</template>
