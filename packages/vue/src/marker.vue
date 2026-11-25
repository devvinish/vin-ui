<script lang="ts">
/*
 * VinUI · Marker (Vue). API: spec/marker.json.
 * Marker: a numbered citation chip that links to its source and previews it on hover and focus.
 * StatusMarker: what the assistant is doing ("Searching…", "Done", "Error"), inline in a reply.
 *   import Marker, { StatusMarker } from "@/components/vin/marker.vue";
 *   <Marker :index="1" href="https://…" title="Fetch Standard" source="whatwg.org" />
 */
import { computed, defineComponent, h, onBeforeUnmount, onMounted, ref, type PropType } from "vue";

const icon = (paths: ReturnType<typeof h>[]) =>
  h("svg", { class: "vin-marker__icon", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2.25", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" }, paths);

export const StatusMarker = defineComponent({
  name: "StatusMarker",
  props: {
    /** "running" shows a spinner, "done" a check, "error" a warning sign. Default: "running". */
    status: { type: String as PropType<"running" | "done" | "error">, default: "running" },
    /** Announce changes to screen readers (role="status"). Default: true while running. */
    live: { type: Boolean, default: undefined },
  },
  setup: (props, { slots }) => () => {
    const isLive = props.live ?? props.status === "running";
    return h("span", {
      role: isLive ? "status" : undefined,
      class: ["vin-marker vin-marker--status", props.status === "done" && "vin-marker--success", props.status === "error" && "vin-marker--danger"],
    }, [
      props.status === "running" && h("span", { class: "vin-spinner vin-spinner--sm", "aria-hidden": "true" }),
      props.status === "done" && icon([h("circle", { cx: "12", cy: "12", r: "9" }), h("path", { d: "m8.5 12 2.5 2.5 4.5-5" })]),
      props.status === "error" && icon([h("circle", { cx: "12", cy: "12", r: "9" }), h("path", { d: "M12 8v4.5" }), h("path", { d: "M12 16h.01" })]),
      slots.default?.(),
    ]);
  },
});
</script>

<script setup lang="ts">
const props = defineProps<{
  /** The number shown in the chip. */
  index: number | string;
  /** Where the source lives. */
  href: string;
  /** The source's title, shown in the preview and read out by screen readers. */
  title?: string;
  /** Where it's from, e.g. a domain. */
  source?: string;
}>();

const dismissed = ref(false);
let active = 0;
// Escape hides the preview without moving the pointer or focus (WCAG 1.4.13).
const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && active > 0) dismissed.value = true; };
onMounted(() => document.addEventListener("keydown", onKey));
onBeforeUnmount(() => document.removeEventListener("keydown", onKey));
const enter = () => { active++; };
const leave = () => { active = Math.max(0, active - 1); if (!active) dismissed.value = false; };

const label = computed(() => [`Source ${props.index}`, props.title && `: ${props.title}`, props.source && `, ${props.source}`].filter(Boolean).join(""));
</script>

<template>
  <a
    :aria-label="label"
    :href="href"
    class="vin-marker"
    :data-dismissed="dismissed || undefined"
    @mouseenter="enter"
    @mouseleave="leave"
    @focus="enter"
    @blur="leave"
  >{{ index }}<span v-if="title" class="vin-marker__preview" aria-hidden="true"><span class="vin-marker__title">{{ title }}</span><span v-if="source" class="vin-marker__source">{{ source }}</span></span></a>
</template>
