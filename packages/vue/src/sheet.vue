<script lang="ts">
/*
 * VinUI · Sheet (Vue). API: spec/sheet.json. Needs dialog.vue next to it.
 * A Dialog that slides in from an edge. It takes every Dialog prop, slot and event.
 *   import Sheet, { SheetClose } from "@/components/vin/sheet.vue";
 *   <Sheet side="left" title="VinUI"><template #trigger><Button>Menu</Button></template>…</Sheet>
 */
import Dialog, { DialogClose } from "./dialog.vue";

/** Makes its child button close the sheet it's in. */
export const SheetClose = DialogClose;
</script>

<script setup lang="ts">
withDefaults(defineProps<{
  /** The edge it comes from. Default "right". */
  side?: "right" | "left" | "top" | "bottom";
}>(), { side: "right" });
</script>

<template>
  <Dialog class="vin-sheet" :data-side="side === 'right' ? undefined : side">
    <template v-for="(_, name) in $slots" #[name]><slot :name="name" /></template>
  </Dialog>
</template>
