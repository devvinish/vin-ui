<script lang="ts">
/*
 * VinUI · Hover Card (Vue). API: spec/hover-card.json.
 * A Popover that opens when the pointer rests on its trigger (after openDelay) or the trigger gets
 * keyboard focus. The pointer can move onto the card; Esc closes it.
 *   <HoverCard><template #trigger><a href="/u/ada">@ada</a></template><p class="vin-popover__title">Ada Lovelace</p>…</HoverCard>
 */
import {
  Comment, Fragment, Text, cloneVNode, onBeforeUnmount, onMounted, ref,
  type FunctionalComponent, type VNode,
} from "vue";

type Side = "top" | "bottom" | "left" | "right";

function place(el: HTMLElement, anchor: HTMLElement, side: Side, gap: number) {
  const r = anchor.getBoundingClientRect(), w = el.offsetWidth, h = el.offsetHeight;
  const vw = document.documentElement.clientWidth, vh = window.innerHeight, m = 8;
  const opposite = { top: "bottom", bottom: "top", left: "right", right: "left" } as const;
  const fits = { top: r.top - gap - h >= m, bottom: r.bottom + gap + h <= vh - m, left: r.left - gap - w >= m, right: r.right + gap + w <= vw - m };
  if (!fits[side] && fits[opposite[side]]) side = opposite[side];
  let x: number, y: number;
  if (side === "top" || side === "bottom") { y = side === "top" ? r.top - gap - h : r.bottom + gap; x = r.left + (r.width - w) / 2; }
  else { x = side === "left" ? r.left - gap - w : r.right + gap; y = r.top + (r.height - h) / 2; }
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
  side?: Side;
  /** Milliseconds before it opens on hover. Default 500. */
  openDelay?: number;
  /** Milliseconds before it closes after the pointer leaves. Default 300. */
  closeDelay?: number;
}>(), { side: "bottom", openDelay: 500, closeDelay: 300 });

const emit = defineEmits<{ "update:open": [open: boolean] }>();
const slots = defineSlots<{ default?(): unknown; trigger?(): VNode[] }>();

const card = ref<HTMLDivElement | null>(null);
let anchor: HTMLElement | null = null;
const setAnchor = (r: unknown) => { anchor = elOf(r); };
const timers: { show?: number; hide?: number } = {};

const isOpen = () => !!card.value?.matches(":popover-open");
function show(delay: number) {
  clearTimeout(timers.hide); clearTimeout(timers.show);
  timers.show = window.setTimeout(() => {
    const el = card.value;
    if (!el?.showPopover || !anchor) return;
    if (!isOpen()) { el.showPopover(); emit("update:open", true); }
    place(el, anchor, props.side, 8);
  }, delay);
}
function hide(delay: number) {
  clearTimeout(timers.show); clearTimeout(timers.hide);
  timers.hide = window.setTimeout(() => { if (isOpen()) { card.value?.hidePopover(); emit("update:open", false); } }, delay);
}
const keep = () => clearTimeout(timers.hide);
const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && isOpen()) { e.stopPropagation(); hide(0); } };
onMounted(() => document.addEventListener("keydown", onKey, true));
onBeforeUnmount(() => {
  document.removeEventListener("keydown", onKey, true);
  clearTimeout(timers.show); clearTimeout(timers.hide);
});
function onCardBlur(e: FocusEvent) {
  const el = e.currentTarget as HTMLElement;
  if (!el.contains(e.relatedTarget as Node) && e.relatedTarget !== anchor) hide(150);
}

const Trigger: FunctionalComponent = () => {
  const n = firstNode(slots.trigger?.());
  if (!n) return null;
  return cloneVNode(n, {
    ref: setAnchor,
    onPointerenter: (e: PointerEvent) => { if (e.pointerType !== "touch") show(props.openDelay); },
    onPointerleave: () => hide(props.closeDelay),
    onFocus: (e: FocusEvent) => { if ((e.currentTarget as HTMLElement).matches(":focus-visible")) show(0); },
    onBlur: () => hide(150),
  }, true);
};
</script>

<template>
  <Trigger />
  <div
    v-bind="$attrs"
    ref="card"
    popover="manual"
    :data-side="side === 'bottom' ? undefined : side"
    class="vin-popover vin-hover-card"
    @pointerenter="keep"
    @pointerleave="hide(closeDelay)"
    @focusin="keep"
    @focusout="onCardBlur"
  >
    <slot />
  </div>
</template>
