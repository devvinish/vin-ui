<script lang="ts">
/*
 * VinUI · Drawer (Vue). API: spec/drawer.json. Needs sheet.vue and dialog.vue next to it.
 * A bottom Sheet with a handle: drag the handle strip or the header down to close it.
 * It takes every Dialog prop, slot and event (except side).
 *   import Drawer, { DrawerClose } from "@/components/vin/drawer.vue";
 *   <Drawer title="Daily goal"><template #trigger><Button>Set goal</Button></template>…</Drawer>
 */
import Sheet, { SheetClose } from "./sheet.vue";

/** Makes its child button close the drawer it's in. */
export const DrawerClose = SheetClose;
</script>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  /** Esc, a click outside and dragging down close it. Default true. */
  dismissible?: boolean;
}>(), { dismissible: true });

const drag = { on: false, y: 0, dy: 0, t: 0 };

function onPointerdown(e: PointerEvent) {
  const el = e.currentTarget as HTMLDialogElement, t = e.target as HTMLElement;
  if (e.button !== 0 || !el.open) return;
  const top = e.clientY - el.getBoundingClientRect().top;
  if (!t.closest(".vin-dialog__header") && top > 28) return; // only the handle strip and the header
  if (t.closest("button, a, input, textarea, select")) return;
  Object.assign(drag, { on: true, y: e.clientY, dy: 0, t: Date.now() });
  el.setPointerCapture?.(e.pointerId);
  el.style.transition = "none";
}
function onPointermove(e: PointerEvent) {
  if (!drag.on) return;
  drag.dy = Math.max(0, e.clientY - drag.y);
  (e.currentTarget as HTMLElement).style.transform = `translateY(${drag.dy}px)`;
}
function end(e: PointerEvent) {
  const el = e.currentTarget as HTMLDialogElement;
  if (!drag.on) return;
  drag.on = false;
  const fast = drag.dy > 40 && drag.dy / Math.max(1, Date.now() - drag.t) > 0.6;
  el.style.transition = "";
  el.style.transform = "";
  if (props.dismissible && (drag.dy > Math.min(140, el.offsetHeight * 0.35) || fast)) el.close();
}
</script>

<template>
  <Sheet
    side="bottom"
    class="vin-drawer"
    :dismissible="dismissible"
    @pointerdown="onPointerdown"
    @pointermove="onPointermove"
    @pointerup="end"
    @pointercancel="end"
  >
    <template v-for="(_, name) in $slots" #[name]><slot :name="name" /></template>
  </Sheet>
</template>
