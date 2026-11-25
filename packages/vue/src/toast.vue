<script lang="ts">
/*
 * VinUI · Toast (Vue). API: spec/toast.json.
 * Put <Toaster /> once in your app, then call toast({ title, description, variant, action }) from anywhere.
 * The timer pauses while the pointer or focus is on a toast.
 *   import Toaster, { Toast, toast, dismissToast } from "@/components/vin/toast.vue";
 */
import { defineComponent, h, onBeforeUnmount, onMounted, ref, shallowRef, type PropType } from "vue";

const cx = (...c: unknown[]) => c.filter((x) => typeof x === "string" && x).join(" ");

export type ToastVariant = "default" | "success" | "danger";
export type ToastAction = { label: string; onClick: () => void };
export type ToastOptions = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  action?: ToastAction;
  /** Milliseconds. Default 5000. */
  duration?: number;
};
type Entry = ToastOptions & { id: number; leaving?: boolean };

/** Every toast on screen, shared by the whole app. */
const entries = shallowRef<Entry[]>([]);
let nextId = 0;

/** Show a toast. Returns its id, for dismissToast(id). */
export function toast(options: ToastOptions | string): number {
  const opts = typeof options === "string" ? { title: options } : options;
  const id = ++nextId;
  entries.value = [...entries.value, { ...opts, id }];
  return id;
}

/** Close a toast early. */
export function dismissToast(id: number) {
  if (!entries.value.some((t) => t.id === id && !t.leaving)) return;
  entries.value = entries.value.map((t) => (t.id === id ? { ...t, leaving: true } : t));
  setTimeout(() => { entries.value = entries.value.filter((t) => t.id !== id); }, 160);
}

const svg = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": 2, "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" };
const ICONS: Partial<Record<ToastVariant, () => ReturnType<typeof h>[]>> = {
  success: () => [h("circle", { cx: 12, cy: 12, r: 9 }), h("path", { d: "m8.5 12 2.5 2.5 4.5-5" })],
  danger: () => [h("circle", { cx: 12, cy: 12, r: 9 }), h("path", { d: "M12 7.5v5" }), h("path", { d: "M12 16h.01" })],
};

/** One toast. <Toaster> uses it; you can also show one inline. */
export const Toast = defineComponent({
  name: "Toast",
  props: {
    title: { type: String, required: true },
    description: String,
    variant: { type: String as PropType<ToastVariant>, default: "default" },
    action: Object as PropType<ToastAction>,
  },
  emits: { close: () => true },
  setup: (props, { emit, slots }) => () => {
    const icon = ICONS[props.variant];
    return h("div", { class: cx("vin-toast", props.variant !== "default" && `vin-toast--${props.variant}`) }, [
      icon ? h("svg", { ...svg, class: "vin-toast__icon" }, icon()) : null,
      h("div", { class: "vin-toast__content" }, [
        h("p", { class: "vin-toast__title" }, slots.title?.() ?? props.title),
        props.description != null || slots.description ? h("p", { class: "vin-toast__description" }, slots.description?.() ?? props.description) : null,
        props.action
          ? h("div", { class: "vin-toast__actions" }, [
            h("button", { type: "button", class: "vin-btn vin-btn--outline vin-btn--sm", onClick: props.action.onClick }, props.action.label),
          ])
          : null,
      ]),
      h("button", { type: "button", class: "vin-btn vin-btn--ghost vin-btn--icon vin-toast__close", "aria-label": "Close", onClick: () => emit("close") }, [
        h("svg", svg, [h("path", { d: "M18 6 6 18" }), h("path", { d: "m6 6 12 12" })]),
      ]),
    ]);
  },
});

/** A toast on screen: its timer, and the live region that announces it. */
const Live = defineComponent({
  props: { entry: { type: Object as PropType<Entry>, required: true } },
  setup(props) {
    // Render the live region empty first, then the text, so screen readers announce it.
    const ready = ref(false);
    let timer: number | undefined;
    let left = props.entry.duration ?? 5000;
    let started = 0;
    let frame = 0;
    const run = () => { started = Date.now(); timer = window.setTimeout(() => dismissToast(props.entry.id), left); };
    const pause = () => { clearTimeout(timer); left -= Date.now() - started; };
    onMounted(() => { frame = requestAnimationFrame(() => { ready.value = true; }); run(); });
    onBeforeUnmount(() => { cancelAnimationFrame(frame); clearTimeout(timer); });
    return () => {
      const e = props.entry;
      const role = e.variant === "danger" ? "alert" : "status";
      if (!ready.value) return h("div", { role, class: cx("vin-toast", e.variant && e.variant !== "default" && `vin-toast--${e.variant}`) });
      return h(Toast, {
        role,
        title: e.title,
        description: e.description,
        variant: e.variant,
        action: e.action && { label: e.action.label, onClick: () => { e.action!.onClick(); dismissToast(e.id); } },
        onClose: () => dismissToast(e.id),
        "data-leaving": e.leaving ? "" : undefined,
        onPointerenter: pause,
        onPointerleave: run,
        onFocusin: pause,
        onFocusout: (ev: FocusEvent) => { if (!(ev.currentTarget as Node).contains(ev.relatedTarget as Node)) run(); },
      });
    };
  },
});

let owner: symbol | null = null;
</script>

<script setup lang="ts">
/** Where toasts appear. Put it once in your app (extra copies render nothing). */
withDefaults(defineProps<{ label?: string }>(), { label: "Notifications" });

const me = Symbol("toaster");
const active = ref(false);
onMounted(() => {
  if (!owner) owner = me;
  active.value = owner === me;
});
onBeforeUnmount(() => { if (owner === me) owner = null; });
</script>

<template>
  <Teleport v-if="active" to="body">
    <section class="vin-toaster" :aria-label="label">
      <Live v-for="t in entries" :key="t.id" :entry="t" />
    </section>
  </Teleport>
</template>
