<script lang="ts">
/*
 * VinUI · Typography (Vue). API: spec/typography.json.
 * The look (level, variant) and the tag (as) are separate, so headings can follow your page outline.
 *   import Heading, { Text, Blockquote, List, Code, Link, Prose } from "@/components/vin/typography.vue";
 */
import { defineComponent, h, type PropType } from "vue";

const simple = (name: string, tag: string, cls: string) =>
  defineComponent({ name, setup: (_, { slots }) => () => h(tag, { class: cls }, slots.default?.()) });

export const Text = defineComponent({
  name: "Text",
  props: {
    variant: { type: String as PropType<"p" | "lead" | "muted" | "small">, default: "p" },
    as: { type: String, default: "p" },
  },
  setup: (props, { slots }) => () => h(props.as, { class: `vin-${props.variant}` }, slots.default?.()),
});

export const Blockquote = simple("Blockquote", "blockquote", "vin-blockquote");
export const Code = simple("Code", "code", "vin-code");
export const Link = simple("Link", "a", "vin-link");

export const List = defineComponent({
  name: "List",
  props: { ordered: Boolean },
  setup: (props, { slots }) => () => h(props.ordered ? "ol" : "ul", { class: "vin-list" }, slots.default?.()),
});

/** Styles the plain tags inside: Markdown or CMS output. */
export const Prose = defineComponent({
  name: "Prose",
  props: { as: { type: String, default: "div" } },
  setup: (props, { slots }) => () => h(props.as, { class: "vin-prose" }, slots.default?.()),
});
</script>

<script setup lang="ts">
/** A heading. `level` sets the look; `as` sets the tag (default h1–h4 to match). */
withDefaults(defineProps<{
  /** The size: 1 is the largest. Default 2. */
  level?: 1 | 2 | 3 | 4;
  as?: string;
}>(), { level: 2 });
</script>

<template>
  <component :is="as ?? `h${level}`" :class="`vin-h${level}`"><slot /></component>
</template>
