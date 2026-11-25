<script lang="ts">
/*
 * VinUI · Navigation Menu (Vue). API: spec/navigation-menu.json.
 * Disclosure buttons whose panels open on hover, click or Down Arrow.
 *   import NavigationMenu, { NavigationMenuItem, NavigationMenuLink, NavigationMenuGrid, NavigationMenuCard } from "@/components/vin/navigation-menu.vue";
 *   <NavigationMenu label="Main">
 *     <NavigationMenuItem trigger="Products">
 *       <NavigationMenuGrid><NavigationMenuCard href="/analytics" title="Analytics">See what's working.</NavigationMenuCard></NavigationMenuGrid>
 *     </NavigationMenuItem>
 *     <NavigationMenuLink href="/docs" active>Docs</NavigationMenuLink>
 *   </NavigationMenu>
 */
import { defineComponent, h, onBeforeUnmount, ref, useId } from "vue";

/** Place the panel under its button, flipping up if there's no room, and keep it on screen. */
function place(el: HTMLElement, anchor: HTMLElement) {
  const r = anchor.getBoundingClientRect(), w = el.offsetWidth, h = el.offsetHeight, gap = 6;
  const vw = document.documentElement.clientWidth, vh = window.innerHeight, m = 8;
  const up = r.bottom + gap + h > vh - m && r.top - gap - h >= m;
  const rtl = getComputedStyle(anchor).direction === "rtl";
  el.style.left = `${Math.max(m, Math.min(rtl ? r.right - w : r.left, vw - w - m))}px`;
  el.style.top = `${Math.max(m, Math.min(up ? r.top - gap - h : r.bottom + gap, vh - h - m))}px`;
  el.setAttribute("data-placed", up ? "top" : "bottom");
}

/** A top-level button with a panel. The default slot is the panel: usually a NavigationMenuGrid. */
export const NavigationMenuItem = defineComponent({
  name: "NavigationMenuItem",
  inheritAttrs: false,
  props: {
    /** The button's text. Or use the #trigger slot. */
    trigger: { type: String, default: undefined },
  },
  emits: { "update:open": (_open: boolean) => true },
  setup(props, { slots, attrs, emit }) {
    const id = "vin-nm-" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
    const btn = ref<HTMLButtonElement | null>(null);
    const panel = ref<HTMLDivElement | null>(null);
    const open = ref(false);
    let pinned = false, focusFirst = false, timer: number | undefined;

    const isOpen = () => !!panel.value?.matches(":popover-open");
    const links = () => [...(panel.value?.querySelectorAll<HTMLElement>("a[href], button:not(:disabled)") ?? [])];
    const later = (fn: () => void, ms: number) => { clearTimeout(timer); timer = window.setTimeout(fn, ms); };
    const show = (pin: boolean) => { clearTimeout(timer); pinned = pin; if (!isOpen()) panel.value?.showPopover?.(); };
    const hide = () => { clearTimeout(timer); if (isOpen()) panel.value?.hidePopover(); };

    const reposition = () => { if (panel.value && btn.value) place(panel.value, btn.value); };
    const unlisten = () => { window.removeEventListener("scroll", reposition, true); window.removeEventListener("resize", reposition); };
    onBeforeUnmount(() => { unlisten(); clearTimeout(timer); });

    function onBeforetoggle(e: Event) {
      if ((e as ToggleEvent).newState === "closed" && panel.value?.contains(document.activeElement)) btn.value?.focus();
    }
    function onToggle(e: Event) {
      const now = (e as ToggleEvent).newState === "open";
      open.value = now;
      emit("update:open", now);
      if (now) {
        reposition(); window.addEventListener("scroll", reposition, true); window.addEventListener("resize", reposition);
        if (focusFirst) links()[0]?.focus();
      } else {
        pinned = false;
        unlisten();
      }
      focusFirst = false;
    }
    function onPanelKeydown(e: KeyboardEvent) {
      if (e.key === "Escape") { e.preventDefault(); hide(); btn.value?.focus(); return; }
      const l = links(), i = l.indexOf(document.activeElement as HTMLElement);
      const to = e.key === "ArrowDown" ? l[(i + 1) % l.length] : e.key === "ArrowUp" ? l[(i - 1 + l.length) % l.length]
        : e.key === "Home" ? l[0] : e.key === "End" ? l[l.length - 1] : null;
      if (to) { e.preventDefault(); to.focus(); }
    }
    function onItemFocusout(e: FocusEvent) {
      // Focus leaving the button and its panel closes it.
      const item = e.currentTarget as HTMLElement, to = e.relatedTarget as Node | null;
      if (to) { if (!item.contains(to)) hide(); }
      else setTimeout(() => { if (!item.contains(document.activeElement)) hide(); }, 0);
    }
    function onClick(e: MouseEvent) {
      // The click is ours: a panel opened by hover stays open when clicked, a second click closes it.
      e.preventDefault();
      if (isOpen() && !pinned) { pinned = true; clearTimeout(timer); }
      else if (isOpen()) hide();
      else show(true);
    }
    function onTriggerKeydown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen()) { e.preventDefault(); hide(); return; }
      if (e.key !== "ArrowDown") return;
      e.preventDefault();
      if (isOpen()) { pinned = true; links()[0]?.focus(); }
      else { focusFirst = true; show(true); }
    }
    const leave = (e: PointerEvent) => { if (e.pointerType !== "touch" && !pinned) later(hide, 200); };

    return () =>
      h("li", { class: "vin-nav-menu__item", onFocusout: onItemFocusout }, [
        h("button", {
          type: "button",
          ref: btn,
          class: "vin-nav-menu__trigger",
          "aria-expanded": open.value,
          "aria-controls": id,
          popovertarget: id,
          onClick,
          onKeydown: onTriggerKeydown,
          onPointerenter: (e: PointerEvent) => {
            if (e.pointerType === "touch") return;
            if (isOpen()) clearTimeout(timer);
            else later(() => show(false), 120);
          },
          onPointerleave: leave,
        }, [
          slots.trigger ? slots.trigger() : props.trigger,
          h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" }, [h("path", { d: "m6 9 6 6 6-6" })]),
        ]),
        h("div", {
          ...attrs,
          ref: panel,
          id,
          popover: "auto",
          class: ["vin-nav-menu__panel", attrs.class],
          onBeforetoggle,
          onToggle,
          onKeydown: onPanelKeydown,
          onPointerenter: () => clearTimeout(timer),
          onPointerleave: leave,
        }, slots.default?.()),
      ]);
  },
});

/** A top-level link with no panel. */
export const NavigationMenuLink = defineComponent({
  name: "NavigationMenuLink",
  inheritAttrs: false,
  props: {
    /** Marks the link to the current page. */
    active: { type: Boolean, default: false },
  },
  setup: (props, { slots, attrs }) => () =>
    h("li", { class: "vin-nav-menu__item" }, [
      h("a", { "aria-current": props.active ? "page" : undefined, ...attrs, class: ["vin-nav-menu__link", attrs.class] }, slots.default?.()),
    ]),
});

/** The links in a panel: two columns, or one with `list`. */
export const NavigationMenuGrid = defineComponent({
  name: "NavigationMenuGrid",
  props: {
    /** One column of links instead of two. */
    list: { type: Boolean, default: false },
  },
  setup: (props, { slots }) => () => h("ul", { class: ["vin-nav-menu__grid", props.list && "vin-nav-menu__grid--list"] }, slots.default?.()),
});

/** A link in a panel: a title and, as the default slot, an optional line of text. */
export const NavigationMenuCard = defineComponent({
  name: "NavigationMenuCard",
  inheritAttrs: false,
  props: {
    title: { type: String, required: true as const },
    /** Marks the link to the current page. */
    active: { type: Boolean, default: false },
  },
  setup: (props, { slots, attrs }) => () =>
    h("li", null, [
      h("a", { "aria-current": props.active ? "page" : undefined, ...attrs, class: ["vin-nav-menu__card", attrs.class] }, [
        h("span", { class: "vin-nav-menu__card-title" }, props.title),
        slots.default && h("span", { class: "vin-nav-menu__card-text" }, slots.default()),
      ]),
    ]),
});
</script>

<script setup lang="ts">
defineProps<{
  /** Name for the navigation, read by screen readers. */
  label: string;
}>();
const nav = ref<HTMLElement | null>(null);

// Left and Right Arrow, Home and End move between the top-level items.
function onKeydown(e: KeyboardEvent) {
  const list = [...(nav.value?.querySelectorAll<HTMLElement>(".vin-nav-menu__item > .vin-nav-menu__trigger, .vin-nav-menu__item > .vin-nav-menu__link") ?? [])];
  const i = list.indexOf(e.target as HTMLElement);
  if (i < 0) return;
  const rtl = getComputedStyle(nav.value!).direction === "rtl";
  const next = e.key === "ArrowRight" || e.key === "ArrowLeft" ? list[(i + ((e.key === "ArrowRight") !== rtl ? 1 : -1) + list.length) % list.length]
    : e.key === "Home" ? list[0] : e.key === "End" ? list[list.length - 1] : null;
  if (next) { e.preventDefault(); next.focus(); }
}
</script>

<template>
  <nav ref="nav" :aria-label="label" class="vin-nav-menu" @keydown="onKeydown">
    <ul class="vin-nav-menu__list"><slot /></ul>
  </nav>
</template>
