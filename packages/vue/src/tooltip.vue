<script lang="ts">
/*
 * VinUI · Tooltip (Vue). API: spec/tooltip.json.
 * Wrap one trigger: <Tooltip content="Add to library"><Button>Save</Button></Tooltip>.
 * Hover (after `delay`) or keyboard focus shows it; Escape hides it. It sits in the top layer (popover).
 * Attributes such as class go on the tooltip.
 */
import {
  Comment, Fragment, Text, cloneVNode, onBeforeUnmount, ref, useId,
  type FunctionalComponent, type VNode,
} from "vue";

type Side = "top" | "right" | "bottom" | "left";

/** Place `el` next to `anchor`, flipping to the other side if there's no room, and keep it on screen. */
function place(el: HTMLElement, anchor: HTMLElement, side: Side, align: "start" | "center" | "end", gap: number) {
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
  /** The tip's text. Or use the #content slot. */
  content?: string;
  side?: Side;
  /** The tooltip is the trigger's name (icon buttons): aria-labelledby instead of aria-describedby. */
  label?: boolean;
  /** Milliseconds before it shows on hover. Default 300. */
  delay?: number;
}>(), { side: "top", delay: 300 });

const slots = defineSlots<{ default?(): VNode[]; content?(): unknown }>();

const id = "vin-tip-" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
const tip = ref<HTMLDivElement | null>(null);
let trigger: HTMLElement | null = null;
const setTrigger = (r: unknown) => { trigger = elOf(r); };
const timers: { show?: number; hide?: number } = {};
const keep = () => clearTimeout(timers.hide);

const isOpen = () => !!tip.value?.matches(":popover-open");
const onKey = (e: KeyboardEvent) => {
  if (e.key === "Escape" && isOpen()) { e.stopPropagation(); hide(true); }
};
function show(now = false) {
  clearTimeout(timers.hide); clearTimeout(timers.show);
  timers.show = window.setTimeout(() => {
    const el = tip.value;
    if (!el || !trigger) return;
    if (!isOpen()) el.showPopover?.();
    place(el, trigger, props.side, "center", 6);
    document.addEventListener("keydown", onKey, true);
  }, now ? 0 : props.delay);
}
function hide(now = false) {
  clearTimeout(timers.show); clearTimeout(timers.hide);
  timers.hide = window.setTimeout(() => {
    if (isOpen()) tip.value?.hidePopover?.();
    document.removeEventListener("keydown", onKey, true);
  }, now ? 0 : 100);
}
onBeforeUnmount(() => {
  clearTimeout(timers.show); clearTimeout(timers.hide);
  document.removeEventListener("keydown", onKey, true);
});

const Trigger: FunctionalComponent = () => {
  const n = firstNode(slots.default?.());
  if (!n) return null;
  return cloneVNode(n, {
    [props.label ? "aria-labelledby" : "aria-describedby"]: id,
    ref: setTrigger,
    onPointerenter: (e: PointerEvent) => { if (e.pointerType !== "touch") show(); },
    onPointerleave: () => hide(),
    onPointerdown: () => hide(true),
    onFocus: (e: FocusEvent) => { if ((e.target as HTMLElement).matches(":focus-visible")) show(true); },
    onBlur: () => hide(true),
  }, true);
};
</script>

<template>
  <Trigger />
  <div
    ref="tip"
    v-bind="$attrs"
    :id="id"
    role="tooltip"
    popover="manual"
    :data-side="side"
    class="vin-tooltip"
    @pointerenter="keep"
    @pointerleave="hide()"
  >
    <slot name="content">{{ content }}</slot>
  </div>
</template>
