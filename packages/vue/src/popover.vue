<script lang="ts">
/*
 * VinUI · Popover (Vue). API: spec/popover.json.
 * The browser's popover: Escape and a click outside close it. This places it next to the trigger.
 *   <Popover title="Dimensions"><template #trigger><Button>Dimensions</Button></template>…</Popover>
 */
import {
  Comment, Fragment, Text, cloneVNode, computed, onBeforeUnmount, onMounted, ref, useAttrs, useId, watch,
  type FunctionalComponent, type VNode,
} from "vue";

type Side = "top" | "right" | "bottom" | "left";
type Align = "start" | "center" | "end";

/** Place `el` next to `anchor`, flipping to the other side if there's no room, and keep it on screen. */
function place(el: HTMLElement, anchor: HTMLElement, side: Side, align: Align, gap: number) {
  const r = anchor.getBoundingClientRect(), w = el.offsetWidth, h = el.offsetHeight;
  const vw = document.documentElement.clientWidth, vh = window.innerHeight, m = 8;
  const opposite = { top: "bottom", bottom: "top", left: "right", right: "left" } as const;
  const fits = { top: r.top - gap - h >= m, bottom: r.bottom + gap + h <= vh - m, left: r.left - gap - w >= m, right: r.right + gap + w <= vw - m };
  if (!fits[side] && fits[opposite[side]]) side = opposite[side];
  if (getComputedStyle(anchor).direction === "rtl") align = align === "start" ? "end" : align === "end" ? "start" : align;
  let x: number, y: number;
  if (side === "top" || side === "bottom") {
    y = side === "top" ? r.top - gap - h : r.bottom + gap;
    x = align === "start" ? r.left : align === "end" ? r.right - w : r.left + (r.width - w) / 2;
  } else {
    x = side === "left" ? r.left - gap - w : r.right + gap;
    y = align === "start" ? r.top : align === "end" ? r.bottom - h : r.top + (r.height - h) / 2;
  }
  el.style.left = `${Math.max(m, Math.min(x, vw - w - m))}px`;
  el.style.top = `${Math.max(m, Math.min(y, vh - h - m))}px`;
  el.setAttribute("data-placed", side);
}

/** The first real node of a slot (skipping comments, blank text and fragments). */
function firstNode(nodes: VNode[] | undefined): VNode | undefined {
  for (const n of nodes ?? []) {
    if (n.type === Comment || (n.type === Text && !String(n.children).trim())) continue;
    if (n.type === Fragment) { const f = firstNode(n.children as VNode[]); if (f) return f; continue; }
    return n;
  }
}
/** The element behind a template ref: a component's root element, or the element itself. */
const elOf = (r: unknown) => ((r as { $el?: unknown } | null)?.$el ?? r) as HTMLElement | null;
</script>

<script setup lang="ts">
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<{
  /** Or use the #title slot. */
  title?: string;
  /** Or use the #description slot. */
  description?: string;
  /** Open or closed (v-model:open). */
  open?: boolean;
  /** Open at first, when you don't use v-model:open. */
  defaultOpen?: boolean;
  side?: Side;
  align?: Align;
}>(), { open: undefined, side: "bottom", align: "start" });

const emit = defineEmits<{ "update:open": [open: boolean] }>();
const slots = defineSlots<{ default?(): unknown; trigger?(): VNode[]; title?(): unknown; description?(): unknown }>();
const attrs = useAttrs();

const id = "vin-pop-" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
const pop = ref<HTMLDivElement | null>(null);
let btn: HTMLElement | null = null;
const setBtn = (r: unknown) => { btn = elOf(r); };
const inner = ref(props.defaultOpen);
const isOpen = computed(() => props.open ?? inner.value);
const hasTitle = computed(() => props.title != null || !!slots.title);
const hasDesc = computed(() => props.description != null || !!slots.description);

const reposition = () => { if (pop.value && btn) place(pop.value, btn, props.side, props.align, 6); };
const unlisten = () => { window.removeEventListener("scroll", reposition, true); window.removeEventListener("resize", reposition); };

// Follow the browser's open/close (Escape, click outside), and keep it placed while open.
function onToggle(e: Event) {
  const now = (e as ToggleEvent).newState === "open";
  if (now) { reposition(); window.addEventListener("scroll", reposition, true); window.addEventListener("resize", reposition); }
  else unlisten();
  inner.value = now;
  emit("update:open", now);
}
onBeforeUnmount(unlisten);

// Controlled or defaultOpen: open or close it to match.
function sync() {
  const el = pop.value;
  if (!el?.showPopover) return;
  const shown = el.matches(":popover-open");
  if (isOpen.value && !shown) el.showPopover();
  if (!isOpen.value && shown) el.hidePopover();
}
onMounted(sync);
watch(isOpen, sync, { flush: "post" });

const Trigger: FunctionalComponent = () => {
  const n = firstNode(slots.trigger?.());
  return n ? cloneVNode(n, { popovertarget: id, "aria-expanded": isOpen.value, ref: setBtn }, true) : null;
};
</script>

<template>
  <Trigger />
  <div
    ref="pop"
    v-bind="attrs"
    :id="id"
    popover="auto"
    role="dialog"
    :aria-labelledby="hasTitle ? `${id}-title` : undefined"
    :data-side="side"
    :data-align="align"
    class="vin-popover"
    @toggle="onToggle"
  >
    <p v-if="hasTitle" class="vin-popover__title" :id="`${id}-title`"><slot name="title">{{ title }}</slot></p>
    <p v-if="hasDesc" class="vin-popover__description"><slot name="description">{{ description }}</slot></p>
    <slot />
  </div>
</template>
