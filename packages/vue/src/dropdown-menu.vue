<script lang="ts">
/*
 * VinUI · Dropdown Menu (Vue). API: spec/dropdown-menu.json.
 * The browser's popover with the menu keyboard: arrows, Home/End, type to jump, Escape or Tab to close.
 *   import DropdownMenu, { DropdownMenuItem, DropdownMenuSeparator } from "@/components/vin/dropdown-menu.vue";
 *   <DropdownMenu>
 *     <template #trigger><Button>My account</Button></template>
 *     <DropdownMenuItem @select="…">Profile</DropdownMenuItem>
 *   </DropdownMenu>
 */
import {
  Comment, Fragment, Text, cloneVNode, computed, defineComponent, h, inject, onBeforeUnmount, onMounted, provide, ref, useAttrs, useId, watch,
  type ComputedRef, type InjectionKey, type VNode,
} from "vue";

type Side = "top" | "bottom";
type Align = "start" | "center" | "end";

/** Place `el` next to `anchor`, flipping to the other side if there's no room, and keep it on screen. */
function place(el: HTMLElement, anchor: HTMLElement, side: Side, align: Align, gap: number) {
  const r = anchor.getBoundingClientRect(), w = el.offsetWidth, h = el.offsetHeight;
  const vw = document.documentElement.clientWidth, vh = window.innerHeight, m = 8;
  const fits = { top: r.top - gap - h >= m, bottom: r.bottom + gap + h <= vh - m };
  if (!fits[side] && fits[side === "top" ? "bottom" : "top"]) side = side === "top" ? "bottom" : "top";
  if (getComputedStyle(anchor).direction === "rtl") align = align === "start" ? "end" : align === "end" ? "start" : align;
  const y = side === "top" ? r.top - gap - h : r.bottom + gap;
  const x = align === "start" ? r.left : align === "end" ? r.right - w : r.left + (r.width - w) / 2;
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

/** Lets the items close the menu they are in (Context Menu provides it too). */
export const MenuKey: InjectionKey<{ close: () => void }> = Symbol("VinMenu");
const RadioKey: InjectionKey<{ value: ComputedRef<string | undefined>; set: (v: string) => void }> = Symbol("VinMenuRadio");

export const DropdownMenuItem = defineComponent({
  name: "DropdownMenuItem",
  props: {
    /** A keyboard shortcut shown at the end, e.g. "⌘B". */
    shortcut: String,
    /** For an action that deletes. */
    danger: Boolean,
  },
  emits: {
    click: (_e: MouseEvent) => true,
    /** The item was chosen. Call event.preventDefault() to keep the menu open. */
    select: (_e: MouseEvent) => true,
  },
  setup(props, { slots, emit }) {
    const menu = inject(MenuKey, { close: () => {} });
    return () =>
      h(
        "button",
        {
          type: "button",
          role: "menuitem",
          tabindex: -1,
          class: ["vin-menu__item", props.danger && "vin-menu__item--danger"],
          onClick: (e: MouseEvent) => { emit("click", e); emit("select", e); if (!e.defaultPrevented) menu.close(); },
        },
        [
          slots.icon?.(),
          slots.default?.(),
          props.shortcut != null ? h("span", { class: "vin-menu__shortcut", "aria-hidden": "true" }, props.shortcut) : null,
        ],
      );
  },
});

/** An option that turns on and off (v-model:checked). The menu stays open. */
export const DropdownMenuCheckboxItem = defineComponent({
  name: "DropdownMenuCheckboxItem",
  props: {
    checked: { type: Boolean, default: undefined },
    defaultChecked: Boolean,
  },
  emits: { "update:checked": (_v: boolean) => true, click: (_e: MouseEvent) => true },
  setup(props, { slots, emit }) {
    const inner = ref(props.defaultChecked);
    const on = computed(() => props.checked ?? inner.value);
    return () =>
      h(
        "button",
        {
          type: "button",
          role: "menuitemcheckbox",
          "aria-checked": on.value,
          tabindex: -1,
          class: "vin-menu__item",
          onClick: (e: MouseEvent) => { emit("click", e); inner.value = !on.value; emit("update:checked", inner.value); },
        },
        slots.default?.(),
      );
  },
});

/** A set of options where one is picked (v-model). The menu stays open. */
export const DropdownMenuRadioGroup = defineComponent({
  name: "DropdownMenuRadioGroup",
  props: {
    modelValue: { type: String, default: undefined },
    defaultValue: String,
    /** Name for the group, read by screen readers. */
    label: { type: String, required: true },
  },
  emits: { "update:modelValue": (_v: string) => true },
  setup(props, { slots, emit }) {
    const inner = ref(props.defaultValue);
    const value = computed(() => props.modelValue ?? inner.value);
    provide(RadioKey, { value, set: (v) => { inner.value = v; emit("update:modelValue", v); } });
    return () => h("div", { role: "group", "aria-label": props.label }, slots.default?.());
  },
});

export const DropdownMenuRadioItem = defineComponent({
  name: "DropdownMenuRadioItem",
  props: { value: { type: String, required: true } },
  emits: { click: (_e: MouseEvent) => true },
  setup(props, { slots, emit }) {
    const group = inject(RadioKey, { value: computed(() => undefined), set: () => {} });
    return () =>
      h(
        "button",
        {
          type: "button",
          role: "menuitemradio",
          "aria-checked": group.value.value === props.value,
          tabindex: -1,
          class: "vin-menu__item",
          onClick: (e: MouseEvent) => { emit("click", e); group.set(props.value); },
        },
        slots.default?.(),
      );
  },
});

/** A heading for a group of items. */
export const DropdownMenuLabel = defineComponent({
  name: "DropdownMenuLabel",
  setup: (_, { slots }) => () => h("p", { role: "presentation", class: "vin-menu__label" }, slots.default?.()),
});

export const DropdownMenuSeparator = defineComponent({
  name: "DropdownMenuSeparator",
  setup: () => () => h("div", { role: "separator", class: "vin-menu__separator" }),
});
</script>

<script setup lang="ts">
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<{
  side?: Side;
  align?: Align;
  /** Open or closed (v-model:open). */
  open?: boolean;
  /** Open at first, when you don't use v-model:open. */
  defaultOpen?: boolean;
}>(), { side: "bottom", align: "start", open: undefined });

const emit = defineEmits<{ "update:open": [open: boolean] }>();
const slots = defineSlots<{ default?(): unknown; trigger?(): VNode[] }>();
const attrs = useAttrs();

const id = "vin-menu-" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
const menu = ref<HTMLDivElement | null>(null);
let btn: HTMLElement | null = null;
const setBtn = (r: unknown) => { btn = elOf(r); };
let focusLast = false;
const inner = ref(props.defaultOpen);
const isOpen = computed(() => props.open ?? inner.value);

const items = () => [...(menu.value?.querySelectorAll<HTMLButtonElement>('[role^="menuitem"]') ?? [])]
  .filter((el) => !el.disabled && el.getAttribute("aria-disabled") !== "true");
const move = (to: number) => { const all = items(); if (all.length) all[(to + all.length) % all.length].focus(); };
const close = () => { menu.value?.hidePopover?.(); btn?.focus(); };
provide(MenuKey, { close });

const reposition = () => { if (menu.value && btn) place(menu.value, btn, props.side, props.align, 4); };
const unlisten = () => { window.removeEventListener("scroll", reposition, true); window.removeEventListener("resize", reposition); };

// Follow the browser's open/close, keep it placed, and put focus on the first (or last) item.
function onToggle(e: Event) {
  const now = (e as ToggleEvent).newState === "open";
  if (now) {
    reposition(); window.addEventListener("scroll", reposition, true); window.addEventListener("resize", reposition);
    move(focusLast ? -1 : 0); focusLast = false;
  } else unlisten();
  inner.value = now;
  emit("update:open", now);
}
onBeforeUnmount(unlisten);

function sync() {
  const el = menu.value;
  if (!el?.showPopover) return;
  const shown = el.matches(":popover-open");
  if (isOpen.value && !shown) el.showPopover();
  if (!isOpen.value && shown) el.hidePopover();
}
onMounted(sync);
watch(isOpen, sync, { flush: "post" });

const typed = { text: "", at: 0 };
function onKeydown(e: KeyboardEvent) {
  const all = items(), at = all.indexOf(document.activeElement as HTMLButtonElement);
  if (e.key === "ArrowDown") { e.preventDefault(); move(at + 1); }
  else if (e.key === "ArrowUp") { e.preventDefault(); move(at < 0 ? -1 : at - 1); }
  else if (e.key === "Home") { e.preventDefault(); move(0); }
  else if (e.key === "End") { e.preventDefault(); move(-1); }
  else if (e.key === "Tab") { e.preventDefault(); close(); }
  else if (e.key.length === 1 && e.key !== " " && !e.ctrlKey && !e.metaKey && !e.altKey) {
    // One letter jumps to the next match; a quick run of letters refines the current one.
    const now = Date.now();
    typed.text = (now - typed.at > 600 ? "" : typed.text) + e.key.toLowerCase(); typed.at = now;
    const start = typed.text.length > 1 ? Math.max(at, 0) : at + 1;
    for (let i = 0; i < all.length; i++) {
      const item = all[(start + i) % all.length];
      if (item.textContent?.trim().toLowerCase().startsWith(typed.text)) { item.focus(); break; }
    }
  }
}
function onPointermove(e: PointerEvent) {
  const item = (e.target as HTMLElement).closest<HTMLButtonElement>('[role^="menuitem"]');
  if (item && items().includes(item) && document.activeElement !== item) item.focus({ preventScroll: true });
}

// The trigger is rendered inline, so the menu can name it by its id in the same pass (SSR included).
let triggerId = `${id}-trigger`;
function triggerNode() {
  const n = firstNode(slots.trigger?.());
  if (!n) return h(Comment);
  triggerId = (n.props?.id as string | undefined) ?? `${id}-trigger`;
  return cloneVNode(n, {
    id: triggerId,
    popovertarget: id,
    "aria-haspopup": "menu",
    "aria-expanded": isOpen.value,
    ref: setBtn,
    onKeydown: (e: KeyboardEvent) => {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      e.preventDefault();
      focusLast = e.key === "ArrowUp";
      if (!menu.value?.matches(":popover-open")) menu.value?.showPopover();
      else move(focusLast ? -1 : 0);
    },
  }, true);
};
</script>

<template>
  <component :is="triggerNode()" />
  <div
    ref="menu"
    v-bind="attrs"
    :id="id"
    popover="auto"
    role="menu"
    :aria-labelledby="triggerId"
    :data-side="side === 'bottom' ? undefined : side"
    :data-align="align === 'start' ? undefined : align"
    class="vin-menu"
    @keydown="onKeydown"
    @pointermove="onPointermove"
    @toggle="onToggle"
  >
    <slot />
  </div>
</template>
