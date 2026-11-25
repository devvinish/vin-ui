<script lang="ts">
/*
 * VinUI · Context Menu (Vue). API: spec/context-menu.json. Needs dropdown-menu.vue next to it.
 * Right-click, long-press, or focus the area and press Shift+F10 / the Menu key. The items are
 * Dropdown Menu's: DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioGroup…
 *   <ContextMenu label="File actions">
 *     Right-click here
 *     <template #content><DropdownMenuItem>Rename</DropdownMenuItem></template>
 *   </ContextMenu>
 */
import { provide, ref, useAttrs, useId } from "vue";
import { MenuKey } from "./dropdown-menu.vue";
</script>

<script setup lang="ts">
defineOptions({ inheritAttrs: false });

defineProps<{
  /** Name for the menu, read by screen readers. */
  label: string;
}>();
const emit = defineEmits<{ "update:open": [open: boolean] }>();
defineSlots<{ default?(): unknown; content?(): unknown }>();
const attrs = useAttrs() as Record<string, any>;

const id = "vin-cm-" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
const area = ref<HTMLDivElement | null>(null);
const menu = ref<HTMLDivElement | null>(null);
let press: number | undefined;

const items = () => [...(menu.value?.querySelectorAll<HTMLButtonElement>('[role^="menuitem"]') ?? [])]
  .filter((el) => !el.disabled && el.getAttribute("aria-disabled") !== "true");
const move = (to: number) => { const all = items(); if (all.length) all[(to + all.length) % all.length].focus(); };
const close = () => { menu.value?.hidePopover?.(); area.value?.focus({ preventScroll: true }); };
provide(MenuKey, { close });

function openAt(x: number, y: number) {
  const el = menu.value;
  if (!el?.showPopover) return;
  if (el.matches(":popover-open")) el.hidePopover();
  el.showPopover();
  const w = el.offsetWidth, h = el.offsetHeight, vw = document.documentElement.clientWidth, vh = window.innerHeight, m = 8;
  if (area.value && getComputedStyle(area.value).direction === "rtl") x -= w;
  el.style.left = `${Math.max(m, Math.min(x, vw - w - m))}px`;
  el.style.top = `${Math.max(m, Math.min(y, vh - h - m))}px`;
  move(0);
}
function openAtCorner(el: HTMLElement) {
  const r = el.getBoundingClientRect();
  openAt(r.left + 8, r.top + 8);
}

function onToggle(e: Event) {
  const open = (e as ToggleEvent).newState === "open";
  emit("update:open", open);
  if (!open && menu.value?.contains(document.activeElement)) area.value?.focus({ preventScroll: true });
}

function onContextmenu(e: MouseEvent) {
  if (e.defaultPrevented || (e.shiftKey && e.button === 2)) return;
  e.preventDefault();
  if (!e.clientX && !e.clientY) openAtCorner(e.currentTarget as HTMLElement); else openAt(e.clientX, e.clientY);
}
function onAreaKeydown(e: KeyboardEvent) {
  // Not every browser turns Shift+F10 or the Menu key into a contextmenu event.
  if (e.defaultPrevented || e.target !== e.currentTarget || !((e.key === "F10" && e.shiftKey) || e.key === "ContextMenu")) return;
  e.preventDefault();
  openAtCorner(e.currentTarget as HTMLElement);
}
function onPointerdown(e: PointerEvent) {
  if (e.pointerType !== "touch") return;
  const { clientX, clientY } = e;
  press = window.setTimeout(() => openAt(clientX, clientY), 550);
}
const cancelPress = () => clearTimeout(press);
function onPointermove(e: PointerEvent) {
  if (e.movementX ** 2 + e.movementY ** 2 > 25) clearTimeout(press);
}

const typed = { text: "", at: 0 };
function onMenuKeydown(e: KeyboardEvent) {
  const all = items(), at = all.indexOf(document.activeElement as HTMLButtonElement);
  if (e.key === "ArrowDown") { e.preventDefault(); move(at + 1); }
  else if (e.key === "ArrowUp") { e.preventDefault(); move(at < 0 ? -1 : at - 1); }
  else if (e.key === "Home") { e.preventDefault(); move(0); }
  else if (e.key === "End") { e.preventDefault(); move(-1); }
  else if (e.key === "Tab") { e.preventDefault(); close(); }
  else if (e.key.length === 1 && e.key !== " " && !e.ctrlKey && !e.metaKey && !e.altKey) {
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
</script>

<template>
  <div
    v-bind="attrs"
    ref="area"
    :tabindex="attrs.tabindex ?? 0"
    class="vin-context-menu"
    @contextmenu="onContextmenu"
    @keydown="onAreaKeydown"
    @pointerdown="onPointerdown"
    @pointerup="cancelPress"
    @pointercancel="cancelPress"
    @pointermove="onPointermove"
  >
    <slot />
  </div>
  <div
    ref="menu"
    :id="id"
    popover="auto"
    role="menu"
    :aria-label="label"
    class="vin-menu"
    @toggle="onToggle"
    @keydown="onMenuKeydown"
    @pointermove="onMenuPointermove"
  >
    <slot name="content" />
  </div>
</template>
