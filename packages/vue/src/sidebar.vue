<script lang="ts">
/*
 * VinUI · Sidebar (Vue). API: spec/sidebar.json. Needs button.vue next to it.
 * 768px and wider it sits beside the page and folds to icons; narrower, the trigger slides it in.
 *   import SidebarLayout, { Sidebar, SidebarContent, SidebarGroup, SidebarItem, SidebarInset, SidebarTrigger } from "@/components/vin/sidebar.vue";
 *   <SidebarLayout>
 *     <Sidebar label="App">
 *       <SidebarContent>
 *         <SidebarGroup label="Platform">
 *           <SidebarItem href="/" active><template #icon><HomeIcon /></template>Dashboard</SidebarItem>
 *         </SidebarGroup>
 *       </SidebarContent>
 *     </Sidebar>
 *     <SidebarInset><SidebarTrigger />…</SidebarInset>
 *   </SidebarLayout>
 */
import {
  computed, defineComponent, h, inject, onBeforeUnmount, onMounted, provide, ref, shallowRef, useId,
  type InjectionKey, type Ref, type VNode,
} from "vue";
import Button from "./button.vue";

const PHONE = "(max-width: 767px)";
const isPhone = () => !!window.matchMedia?.(PHONE).matches;

type Ctx = {
  id: string;
  collapsed: Readonly<Ref<boolean>>;
  setCollapsed: (on: boolean) => void;
  phone: Ref<boolean>;
  open: Ref<boolean>;
  nav: Ref<HTMLElement | null>;
  opener: Ref<HTMLElement | null>;
};
const SidebarKey: InjectionKey<Ctx> = Symbol("VinSidebar");
const useSidebar = () => {
  const ctx = inject(SidebarKey, null);
  if (!ctx) throw new Error("VinUI Sidebar parts must be inside <SidebarLayout>.");
  return ctx;
};

/** The plain text of slot content, for the tooltip shown when folded. */
const textOf = (nodes: VNode[] | undefined): string =>
  (nodes ?? []).map((n) => (typeof n.children === "string" ? n.children : Array.isArray(n.children) ? textOf(n.children as VNode[]) : "")).join("").trim();
/** Folded, each item shows its name as a tooltip. */
const tipFor = (ctx: Ctx | null, text: string) => (ctx && ctx.collapsed.value && !ctx.phone.value && text ? text : undefined);

/** The navigation itself. On phones it's a popover the trigger opens. */
export const Sidebar = defineComponent({
  name: "Sidebar",
  props: {
    /** Name for the navigation, read by screen readers. */
    label: { type: String, required: true as const },
  },
  setup(props, { slots }) {
    const ctx = useSidebar();
    function onBeforetoggle(e: Event) {
      if ((e as ToggleEvent).newState === "closed" && ctx.nav.value?.contains(document.activeElement)) ctx.opener.value?.focus();
    }
    function onToggle(e: Event) {
      const now = (e as ToggleEvent).newState === "open";
      ctx.open.value = now;
      const el = ctx.nav.value;
      if (now && el) (el.querySelector<HTMLElement>('[aria-current="page"]') ?? el.querySelector<HTMLElement>("a[href], summary, button:not(:disabled)"))?.focus();
    }
    function onClick(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest("a[href], summary");
      if (!target) return;
      const nav = ctx.nav.value;
      // On a phone, following a link closes the sidebar.
      if (ctx.phone.value && target.tagName === "A" && nav?.matches(":popover-open")) nav.hidePopover();
      // Folded, a nested list's button unfolds the sidebar to show it.
      if (!ctx.phone.value && ctx.collapsed.value && target.tagName === "SUMMARY") {
        e.preventDefault();
        (target.parentElement as HTMLDetailsElement).open = true;
        ctx.setCollapsed(false);
      }
    }
    return () => h("nav", {
      ref: ctx.nav,
      id: ctx.id,
      "aria-label": props.label,
      popover: "auto",
      class: "vin-sidebar",
      onBeforetoggle,
      onToggle,
      onClick,
    }, slots.default?.());
  },
});

const part = (name: string, tag: string, cls: string) =>
  defineComponent({ name, setup: (_, { slots }) => () => h(tag, { class: cls }, slots.default?.()) });
/** The top of the sidebar, e.g. the app's name. */
export const SidebarHeader = part("SidebarHeader", "div", "vin-sidebar__header");
/** The groups. It scrolls when they don't fit. */
export const SidebarContent = part("SidebarContent", "div", "vin-sidebar__content");
/** The bottom of the sidebar, e.g. help or the account. */
export const SidebarFooter = part("SidebarFooter", "div", "vin-sidebar__footer");
/** The page next to the sidebar. */
export const SidebarInset = part("SidebarInset", "div", "vin-sidebar-inset");
/** A list of items outside a group, e.g. in the header or footer. */
export const SidebarMenu = part("SidebarMenu", "ul", "vin-sidebar__menu");

/** A labelled list of items. */
export const SidebarGroup = defineComponent({
  name: "SidebarGroup",
  props: {
    /** The group's heading. It also names the list for screen readers. */
    label: { type: String, required: true as const },
  },
  setup(props, { slots }) {
    const id = "vin-sbg-" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
    return () => h("div", { class: "vin-sidebar__group" }, [
      h("p", { class: "vin-sidebar__label", id }, props.label),
      h("ul", { class: "vin-sidebar__menu", "aria-labelledby": id }, slots.default?.()),
    ]);
  },
});

/** A link. The #icon slot is shown on its own when the sidebar is folded. */
export const SidebarItem = defineComponent({
  name: "SidebarItem",
  inheritAttrs: false,
  props: {
    /** Marks the link to the current page. */
    active: { type: Boolean, default: false },
    /** A count or short label at the end, e.g. unread messages. */
    badge: { type: [String, Number], default: undefined },
  },
  setup(props, { slots, attrs }) {
    const ctx = inject(SidebarKey, null);
    return () => {
      const text = slots.default?.();
      return h("li", null, [
        h("a", {
          title: tipFor(ctx, textOf(text)),
          "aria-current": props.active ? "page" : undefined,
          ...attrs,
          class: ["vin-sidebar__item", attrs.class],
        }, [
          slots.icon?.(),
          h("span", { class: "vin-sidebar__text" }, text),
          props.badge != null && h("span", { class: "vin-sidebar__badge" }, String(props.badge)),
        ]),
      ]);
    };
  },
});

/** An item that opens a nested list of SidebarItems. */
export const SidebarSub = defineComponent({
  name: "SidebarSub",
  props: {
    /** The item's text. */
    label: { type: String, required: true as const },
    defaultOpen: { type: Boolean, default: false },
  },
  setup(props, { slots }) {
    const ctx = inject(SidebarKey, null);
    return () => h("li", null, [
      h("details", { open: props.defaultOpen || undefined, class: "vin-sidebar__sub" }, [
        h("summary", { class: "vin-sidebar__item", title: tipFor(ctx, props.label) }, [
          slots.icon?.(),
          h("span", { class: "vin-sidebar__text" }, props.label),
        ]),
        h("ul", { class: "vin-sidebar__submenu" }, slots.default?.()),
      ]),
    ]);
  },
});

/** Folds the sidebar to icons, or opens it on phones. Default slot: your own icon. */
export const SidebarTrigger = defineComponent({
  name: "SidebarTrigger",
  inheritAttrs: false,
  emits: { click: (_e: MouseEvent) => true },
  setup(_, { slots, attrs, emit }) {
    const ctx = useSidebar();
    function onClick(e: MouseEvent) {
      emit("click", e);
      if (e.defaultPrevented) return;
      if (!isPhone()) { ctx.setCollapsed(!ctx.collapsed.value); return; }
      ctx.opener.value = e.currentTarget as HTMLElement;
      const nav = ctx.nav.value;
      if (nav?.matches(":popover-open")) nav.hidePopover(); else nav?.showPopover?.();
    }
    return () => h(Button, {
      variant: "ghost",
      size: "icon",
      "aria-label": "Toggle sidebar",
      ...attrs,
      class: ["vin-sidebar__trigger", attrs.class],
      "aria-controls": ctx.id,
      "aria-expanded": ctx.phone.value ? ctx.open.value : !ctx.collapsed.value,
      onClick,
    }, () => slots.default?.() ?? [
      h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" }, [
        h("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2" }), h("path", { d: "M9 3v18" }),
      ]),
    ]);
  },
});
</script>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  /** Folded to icons on wide screens (v-model:collapsed). */
  collapsed?: boolean;
  defaultCollapsed?: boolean;
}>(), { collapsed: undefined, defaultCollapsed: false });
const emit = defineEmits<{ "update:collapsed": [collapsed: boolean] }>();

const id = "vin-sb-" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
const inner = ref(props.defaultCollapsed);
const isCollapsed = computed(() => props.collapsed ?? inner.value);
const phone = ref(false);
const open = ref(false);
const nav = shallowRef<HTMLElement | null>(null);
const opener = shallowRef<HTMLElement | null>(null);

let mq: MediaQueryList | undefined;
const onMedia = () => {
  phone.value = !!mq?.matches;
  if (!phone.value && nav.value?.matches(":popover-open")) nav.value.hidePopover();
};
onMounted(() => {
  mq = window.matchMedia?.(PHONE);
  onMedia();
  mq?.addEventListener("change", onMedia);
});
onBeforeUnmount(() => mq?.removeEventListener("change", onMedia));

provide(SidebarKey, {
  id,
  collapsed: isCollapsed,
  setCollapsed: (on) => { inner.value = on; emit("update:collapsed", on); },
  phone,
  open,
  nav,
  opener,
});
</script>

<template>
  <div :data-state="isCollapsed ? 'collapsed' : undefined" class="vin-sidebar-layout"><slot /></div>
</template>
