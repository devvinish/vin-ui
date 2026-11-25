<script lang="ts">
/*
 * VinUI · Trace (Vue). API: spec/trace.json.
 * What an agent did, step by step: an ordered list with a status icon, a title, the kind
 * and duration, and details behind a native <details>.
 *   import Trace, { TraceStep } from "@/components/vin/trace.vue";
 *   <Trace><TraceStep title="Searched the web" kind="Tool call" duration="1.2s"><p>8 results</p></TraceStep></Trace>
 */
import { computed, defineComponent, h, ref, type PropType, type SlotsType, type VNode } from "vue";

export type TraceStatus = "done" | "running" | "error" | "pending";

const STATUS_LABEL: Record<TraceStatus, string> = { done: "Done", running: "Running", error: "Failed", pending: "Not started" };

const svg = (paths: VNode[]) =>
  h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "3", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" }, paths);

/** One step. Children (the default slot) go behind a disclosure: the input, output or error. */
export const TraceStep = defineComponent({
  name: "TraceStep",
  props: {
    /** Default: "done". */
    status: { type: String as PropType<TraceStatus>, default: "done" },
    /** What happened, e.g. "Searched the web". Or use the #title slot. */
    title: { type: String, default: undefined },
    /** The kind of step, e.g. "Tool call", "Thought" or "Result". */
    kind: { type: String, default: undefined },
    /** How long it took, e.g. "1.2s". */
    duration: { type: String, default: undefined },
    /** Your own text instead of kind and duration. Or use the #meta slot. */
    meta: { type: String, default: undefined },
    /** What screen readers hear for the status. Default: Done, Running, Failed or Not started. */
    statusLabel: { type: String, default: undefined },
    /** With details: open or closed (v-model:open). */
    open: { type: Boolean, default: undefined },
    defaultOpen: { type: Boolean, default: false },
  },
  emits: { "update:open": (_open: boolean) => true },
  slots: Object as SlotsType<{ default: Record<string, never>; title: Record<string, never>; meta: Record<string, never> }>,
  setup(props, { emit, slots }) {
    const inner = ref(props.defaultOpen);
    const isOpen = computed(() => props.open ?? inner.value);
    return () => {
      const line = slots.meta ? slots.meta({}) : props.meta ?? ([props.kind, props.duration].filter(Boolean).join(" · ") || null);
      const head = [
        h("span", { class: "vin-trace__title" }, slots.title ? slots.title({}) : props.title),
        line != null && h("span", { class: "vin-trace__meta" }, line),
      ];
      const s = props.status;
      return h("li", { class: ["vin-trace__step", s !== "done" && `vin-trace__step--${s}`] }, [
        h("span", { class: "vin-trace__icon", role: "img", "aria-label": props.statusLabel ?? STATUS_LABEL[s] }, [
          s === "done" && svg([h("path", { d: "m5 12.5 4.5 4.5L19 7.5" })]),
          s === "error" && svg([h("path", { d: "M17 7 7 17" }), h("path", { d: "m7 7 10 10" })]),
          s === "running" && h("span", { class: "vin-spinner vin-spinner--sm", "aria-hidden": "true" }),
        ]),
        !slots.default
          ? h("div", { class: "vin-trace__head" }, head)
          : h("details", {
            class: "vin-collapsible vin-trace__details",
            open: isOpen.value,
            onToggle: (e: Event) => {
              const now = (e.currentTarget as HTMLDetailsElement).open;
              if (now === isOpen.value) return;
              inner.value = now;
              emit("update:open", now);
            },
          }, [
            h("summary", { class: "vin-collapsible__trigger vin-trace__head" }, head),
            h("div", { class: "vin-collapsible__content vin-trace__body" }, slots.default({})),
          ]),
      ]);
    };
  },
});
</script>

<script setup lang="ts">
withDefaults(defineProps<{
  /** Name for the list. Default: "Agent steps". */
  label?: string;
}>(), { label: "Agent steps" });
</script>

<template>
  <ol :aria-label="label" class="vin-trace"><slot /></ol>
</template>
