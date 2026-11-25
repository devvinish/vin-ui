<script lang="ts">
/*
 * VinUI · Menubar (Vue). API: spec/menubar.json. Needs dropdown-menu.vue next to it.
 * A row of menus with the WAI-ARIA menubar keys. The items are Dropdown Menu's.
 *   import Menubar, { MenubarMenu } from "@/components/vin/menubar.vue";
 *   <Menubar label="Editor">
 *     <MenubarMenu label="File"><DropdownMenuItem shortcut="⌘T">New tab</DropdownMenuItem></MenubarMenu>
 *   </Menubar>
 */
import {
  defineComponent, h, inject, onBeforeUnmount, onMounted, provide, ref, shallowRef, useId,
  type InjectionKey, type Ref,
} from "vue";
import { MenuKey } from "./dropdown-menu.vue";

/** Place the menu under its button, flipping up if there's no room, and keep it on screen. */
function place(el: HTMLElement, anchor: HTMLElement) {
  const r = anchor.getBoundingClientRect(), w = el.offsetWidth, h = el.offsetHeight, gap = 6;
  const vw = document.documentElement.clientWidth, vh = window.innerHeight, m = 8;
  const up = r.bottom + gap + h > vh - m && r.top - gap - h >= m;
  const rtl = getComputedStyle(anchor).direction === "rtl";
  const x = rtl ? r.right - w : r.left;
  el.style.left = `${Math.max(m, Math.min(x, vw - w - m))}px`;
  el.style.top = `${Math.max(m, Math.min(up ? r.top - gap - h : r.bottom + gap, vh - h - m))}px`;
  el.setAttribute("data-placed", up ? "top" : "bottom");
}

type Bar = {
  /** The menu whose button takes Tab (roving tabindex); null means the first. */
  active: Ref<string | null>;
  /** Menu ids in order, as they set up. */
  ids: Ref<string[]>;
  /** Open the menu of the trigger `step` places along from `from` (0 = itself). */
  openFrom: (from: HTMLElement, step: number, last?: boolean) => void;
  /** Move focus along the bar. */
  focusFrom: (from: HTMLElement, to: "next" | "prev" | "first" | "last") => void;
  anyOpen: () => boolean;
};
export const BarKey: InjectionKey<Bar> = Symbol("VinMenubar");

/** One menu: a button in the bar and the menu it opens. Its children are Dropdown Menu items. */
export const MenubarMenu = defineComponent({
  name: "MenubarMenu",
  inheritAttrs: false,
  props: {
    /** The button's text. */
    label: { type: String, required: true as const },
    disabled: { type: Boolean, default: false },
  },
  setup(props, { slots, attrs }) {
    const bar = inject(BarKey, null);
    const id = "vin-mb-" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
    bar?.ids.value.push(id);
    onBeforeUnmount(() => { if (bar) bar.ids.value = bar.ids.value.filter((x) => x !== id); });
    const btn = ref<HTMLButtonElement | null>(null);
    const menu = ref<HTMLDivElement | null>(null);
    const open = ref(false);

    const items = () => [...(menu.value?.querySelectorAll<HTMLButtonElement>('[role^="menuitem"]') ?? [])]
      .filter((el) => !el.disabled && el.getAttribute("aria-disabled") !== "true");
    const move = (to: number) => { const all = items(); if (all.length) all[(to + all.length) % all.length].focus(); };
    const close = () => { menu.value?.hidePopover?.(); btn.value?.focus(); };
    provide(MenuKey, { close });

    const reposition = () => { if (menu.value && btn.value) place(menu.value, btn.value); };
    const unlisten = () => { window.removeEventListener("scroll", reposition, true); window.removeEventListener("resize", reposition); };
    const focusItem = () => {
      const el = menu.value!;
      move(el.hasAttribute("data-vin-last") ? -1 : 0);
      el.removeAttribute("data-vin-last");
    };
    onMounted(() => menu.value?.addEventListener("vin-focus-item", focusItem));
    onBeforeUnmount(() => { unlisten(); menu.value?.removeEventListener("vin-focus-item", focusItem); });

    function onBeforetoggle(e: Event) {
      if ((e as ToggleEvent).newState === "closed" && menu.value?.contains(document.activeElement)) btn.value?.focus();
    }
    function onToggle(e: Event) {
      const now = (e as ToggleEvent).newState === "open";
      open.value = now;
      if (now) {
        if (bar) bar.active.value = id;
        reposition(); window.addEventListener("scroll", reposition, true); window.addEventListener("resize", reposition);
        focusItem();
      } else {
        unlisten();
        if (menu.value?.contains(document.activeElement)) btn.value?.focus();
      }
    }

    const typed = { text: "", at: 0 };
    function onMenuKeydown(e: KeyboardEvent) {
      const all = items(), at = all.indexOf(document.activeElement as HTMLButtonElement);
      if (e.key === "ArrowDown") { e.preventDefault(); move(at + 1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); move(at < 0 ? -1 : at - 1); }
      else if (e.key === "Home") { e.preventDefault(); move(0); }
      else if (e.key === "End") { e.preventDefault(); move(-1); }
      else if (e.key === "Tab") { e.preventDefault(); close(); }
      else if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); if (btn.value) bar?.openFrom(btn.value, e.key === "ArrowRight" ? 1 : -1); }
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
    function onMenuPointermove(e: PointerEvent) {
      const item = (e.target as HTMLElement).closest<HTMLButtonElement>('[role^="menuitem"]');
      if (item && items().includes(item) && document.activeElement !== item) item.focus({ preventScroll: true });
    }
    function onTriggerKeydown(e: KeyboardEvent) {
      const t = e.currentTarget as HTMLElement;
      const to = ({ ArrowRight: "next", ArrowLeft: "prev", Home: "first", End: "last" } as const)[e.key as "Home"];
      if (to) { e.preventDefault(); bar?.focusFrom(t, to); }
      else if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); bar?.openFrom(t, 0, e.key === "ArrowUp"); }
    }

    return () => {
      const tabbable = bar ? (bar.active.value ?? bar.ids.value[0]) === id : true;
      return [
        h("button", {
          type: "button",
          ref: btn,
          id: `${id}-trigger`,
          class: "vin-menubar__trigger",
          role: "menuitem",
          "aria-haspopup": "menu",
          "aria-expanded": open.value,
          popovertarget: id,
          tabindex: tabbable ? 0 : -1,
          disabled: props.disabled,
          onKeydown: onTriggerKeydown,
          onFocus: () => { if (bar) bar.active.value = id; },
          onPointerenter: (e: PointerEvent) => {
            if (e.pointerType !== "touch" && !open.value && bar?.anyOpen()) bar.openFrom(e.currentTarget as HTMLElement, 0);
          },
        }, props.label),
        h("div", {
          ...attrs,
          ref: menu,
          id,
          popover: "auto",
          role: "menu",
          "aria-labelledby": `${id}-trigger`,
          class: ["vin-menu", attrs.class],
          onBeforetoggle,
          onToggle,
          onKeydown: onMenuKeydown,
          onPointermove: onMenuPointermove,
        }, slots.default?.()),
      ];
    };
  },
});
</script>

<script setup lang="ts">
defineProps<{
  /** Name for the menubar, read by screen readers. */
  label: string;
}>();

const bar = ref<HTMLDivElement | null>(null);
const active = ref<string | null>(null);
const ids = shallowRef<string[]>([]);
const triggers = () => [...(bar.value?.querySelectorAll<HTMLButtonElement>(".vin-menubar__trigger") ?? [])].filter((t) => !t.disabled);
const menuOf = (t: HTMLElement) => document.getElementById(t.getAttribute("popovertarget") ?? "");
const rtl = () => !!bar.value && getComputedStyle(bar.value).direction === "rtl";
const setActive = (t: HTMLElement) => { active.value = t.getAttribute("popovertarget"); };

provide(BarKey, {
  active,
  ids,
  openFrom(from, step, last) {
    const all = triggers(), i = all.indexOf(from as HTMLButtonElement);
    const t = all[(i + (rtl() ? -step : step) + all.length) % all.length];
    const menu = t && menuOf(t);
    if (!t || !menu?.showPopover) return;
    setActive(t);
    menu.toggleAttribute("data-vin-last", !!last);
    if (menu.matches(":popover-open")) menu.dispatchEvent(new CustomEvent("vin-focus-item"));
    else menu.showPopover();
  },
  focusFrom(from, to) {
    const all = triggers(), i = all.indexOf(from as HTMLButtonElement), back = rtl();
    const next = to === "first" ? all[0] : to === "last" ? all[all.length - 1]
      : all[(i + ((to === "next") !== back ? 1 : -1) + all.length) % all.length];
    if (!next) return;
    setActive(next);
    next.focus();
  },
  anyOpen: () => triggers().some((t) => menuOf(t)?.matches(":popover-open")),
});
</script>

<template>
  <div ref="bar" role="menubar" :aria-label="label" class="vin-menubar"><slot /></div>
</template>
