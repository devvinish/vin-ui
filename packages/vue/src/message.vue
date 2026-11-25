<script lang="ts">
/*
 * VinUI · Message (Vue). API: spec/message.json.
 * One chat message: avatar, author and time, the content, and small icon actions
 * (copy, retry, thumbs up and down).
 *   import Message, { MessageAction, MessageCopy, MessageFeedback } from "@/components/vin/message.vue";
 *   <Message author="Assistant" time="10:42">
 *     <template #avatar><Avatar name="Assistant" fallback="AI" /></template>
 *     <p>Hello!</p>
 *     <template #actions><MessageCopy /><MessageFeedback v-model="rating" /></template>
 *   </Message>
 */
import { defineComponent, h, onBeforeUnmount, ref, type PropType, type VNode } from "vue";

/** Dev-only warnings, without needing Node's `process` (Vite and the browser don't have it). */
const isDev = () => (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV !== "production";

const icon = (paths: VNode[]) =>
  h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" }, paths);
const copyIcon = () => icon([h("rect", { x: "9", y: "9", width: "12", height: "12", rx: "2" }), h("path", { d: "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" })]);
const upIcon = () => icon([h("path", { d: "M7 10v12" }), h("path", { d: "M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" })]);
const downIcon = () => icon([h("path", { d: "M17 14V2" }), h("path", { d: "M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z" })]);

/** A small icon button for the actions row. Put an SVG inside. */
export const MessageAction = defineComponent({
  name: "MessageAction",
  props: {
    /** What the button does. Screen readers read it; the button only shows an icon. */
    label: { type: String, required: true as const },
    /** For toggles: pressed or not (sets aria-pressed). */
    pressed: { type: Boolean, default: undefined },
  },
  setup(props, { slots }) {
    if (isDev() && !props.label) console.warn("VinUI MessageAction: give it a label so screen readers can name it.");
    return () => h("button", { type: "button", "aria-label": props.label, "aria-pressed": props.pressed, class: "vin-btn vin-btn--ghost vin-btn--icon" }, slots.default?.());
  },
});

/** Copies the message (or `text`) to the clipboard and says "Copied" for two seconds. */
export const MessageCopy = defineComponent({
  name: "MessageCopy",
  props: {
    /** The text to copy. Default: the message's content. */
    text: { type: String, default: undefined },
    label: { type: String, default: "Copy" },
    /** The label for two seconds after copying. Default: "Copied". */
    copiedLabel: { type: String, default: "Copied" },
  },
  emits: { click: (_e: MouseEvent) => true },
  setup(props, { emit }) {
    const copied = ref(false);
    let timer: number | undefined;
    onBeforeUnmount(() => clearTimeout(timer));
    function onClick(e: MouseEvent) {
      emit("click", e);
      if (e.defaultPrevented) return;
      const el = e.currentTarget as HTMLElement;
      const value = props.text ?? el.closest(".vin-message")?.querySelector(".vin-message__content")?.textContent?.trim() ?? "";
      navigator.clipboard?.writeText(value).catch(() => {});
      copied.value = true;
      clearTimeout(timer);
      timer = window.setTimeout(() => { copied.value = false; }, 2000);
    }
    return () => h(MessageAction, { label: copied.value ? props.copiedLabel : props.label, "data-copied": copied.value || undefined, onClick }, copyIcon);
  },
});

export type Feedback = "up" | "down" | null;

/** Thumbs up and down (v-model). One can be pressed at a time; pressing it again clears it. */
export const MessageFeedback = defineComponent({
  name: "MessageFeedback",
  props: {
    modelValue: { type: String as PropType<Feedback>, default: undefined },
    defaultValue: { type: String as PropType<Feedback>, default: null },
    /** Default: "Good response". */
    upLabel: { type: String, default: "Good response" },
    /** Default: "Bad response". */
    downLabel: { type: String, default: "Bad response" },
  },
  emits: { "update:modelValue": (_v: Feedback) => true },
  setup(props, { emit }) {
    const inner = ref<Feedback>(props.defaultValue);
    const current = () => (props.modelValue === undefined ? inner.value : props.modelValue);
    const choose = (v: "up" | "down") => {
      const next = current() === v ? null : v;
      inner.value = next;
      emit("update:modelValue", next);
    };
    return () => [
      h(MessageAction, { label: props.upLabel, pressed: current() === "up", onClick: () => choose("up") }, upIcon),
      h(MessageAction, { label: props.downLabel, pressed: current() === "down", onClick: () => choose("down") }, downIcon),
    ];
  },
});
</script>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  /** Who wrote it, shown above the content. Or use the #author slot. */
  author?: string;
  /** The time to show, e.g. "10:42". */
  time?: string;
  /** Machine-readable time (ISO). With it, the time is a <time> element. */
  dateTime?: string;
  /** "end" puts the avatar on the end side, for the person's own messages. Default: "start". */
  align?: "start" | "end";
  /** The reply is still being written: shows a caret and sets aria-busy. */
  streaming?: boolean;
  /** Name for the actions group. Default: "Message actions". */
  actionsLabel?: string;
}>(), { align: "start", actionsLabel: "Message actions" });
const slots = defineSlots<{
  default?(): unknown;
  /** Usually an Avatar. Hidden from screen readers, because the author name says who it is. */
  avatar?(): unknown;
  author?(): unknown;
  /** Icon actions under the content: MessageCopy, MessageFeedback, MessageAction. */
  actions?(): unknown;
}>();
const hasAuthor = () => props.author != null || !!slots.author;
</script>

<template>
  <article
    :aria-busy="streaming || undefined"
    :class="['vin-message', align === 'end' && 'vin-message--end', streaming && 'vin-message--streaming']"
  >
    <div v-if="slots.avatar" class="vin-message__avatar" aria-hidden="true"><slot name="avatar" /></div>
    <div class="vin-message__body">
      <header v-if="hasAuthor() || time != null" class="vin-message__header">
        <p v-if="hasAuthor()" class="vin-message__author"><slot name="author">{{ author }}</slot></p>
        <time v-if="time != null && dateTime" class="vin-message__time" :datetime="dateTime">{{ time }}</time>
        <span v-else-if="time != null" class="vin-message__time">{{ time }}</span>
      </header>
      <div class="vin-message__content"><slot /></div>
      <div v-if="slots.actions" class="vin-message__actions" role="group" :aria-label="actionsLabel"><slot name="actions" /></div>
    </div>
  </article>
</template>
