<script lang="ts">
/*
 * VinUI · Bubble (Vue). API: spec/bubble.json.
 * A chat bubble: the assistant on the start side, the person on the end side in the accent tint.
 *   import Bubble, { BubbleGroup, TypingBubble } from "@/components/vin/bubble.vue";
 *   <BubbleGroup><Bubble as="p" from="user">Hi!</Bubble><TypingBubble /></BubbleGroup>
 */
import { defineComponent, h } from "vue";

/** A column of bubbles. Bubbles from the same speaker sit close together. */
export const BubbleGroup = defineComponent({
  name: "BubbleGroup",
  setup: (_, { slots }) => () => h("div", { class: "vin-bubble-group" }, slots.default?.()),
});

/** Three animated dots while a reply is on its way. They stay still for people who reduce motion. */
export const TypingBubble = defineComponent({
  name: "TypingBubble",
  props: {
    /** What screen readers hear. Default: "Assistant is typing". */
    label: { type: String, default: "Assistant is typing" },
  },
  setup: (props) => () =>
    h("div", { role: "status", class: "vin-bubble vin-bubble--typing" }, [
      h("span", { class: "vin-bubble__dot" }),
      h("span", { class: "vin-bubble__dot" }),
      h("span", { class: "vin-bubble__dot" }),
      h("span", { class: "vin-bubble__label" }, props.label),
    ]),
});
</script>

<script setup lang="ts">
withDefaults(defineProps<{
  /** Who is speaking. "user" sits on the end side, tinted with the accent. Default: "assistant". */
  from?: "assistant" | "user";
  /** With from="user": a solid accent fill instead of a tint. */
  solid?: boolean;
  /** The element to render. Use "p" for a single line of text. Default: "div". */
  as?: "div" | "p";
}>(), { from: "assistant", as: "div" });
</script>

<template>
  <component :is="as" :class="['vin-bubble', from === 'user' && 'vin-bubble--user', from === 'user' && solid && 'vin-bubble--solid']">
    <slot />
  </component>
</template>
