<script setup lang="ts">
/*
 * VinUI · Card (Vue). API: spec/card.json.
 * Every part is optional; styling comes from @vinui/styles.
 *   import Card, { CardHeader, CardTitle, CardDescription, CardBody, CardFooter } from "@/components/vin/card.vue";
 */
</script>

<script lang="ts">
import { defineComponent, h, type PropType } from "vue";

const part = (name: string, tag: string, cls: string) =>
  defineComponent({ name, setup: (_, { slots }) => () => h(tag, { class: cls }, slots.default?.()) });

export const CardHeader = part("CardHeader", "div", "vin-card__header");
export const CardDescription = part("CardDescription", "p", "vin-card__desc");
export const CardBody = part("CardBody", "div", "vin-card__body");
export const CardFooter = part("CardFooter", "div", "vin-card__footer");

export const CardTitle = defineComponent({
  name: "CardTitle",
  props: {
    /** Heading level, so the title fits your page outline. Default: "h3". */
    as: { type: String as PropType<"h2" | "h3" | "h4" | "p">, default: "h3" },
  },
  setup: (props, { slots }) => () => h(props.as, { class: "vin-card__title" }, slots.default?.()),
});
</script>

<template>
  <div class="vin-card"><slot /></div>
</template>
