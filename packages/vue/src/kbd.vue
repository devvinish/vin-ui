<script lang="ts">
/*
 * VinUI · Kbd (Vue). API: spec/kbd.json.
 * <Kbd>K</Kbd> is one key; <KbdGroup> holds the keys of a shortcut.
 *   import Kbd, { KbdGroup } from "@/components/vin/kbd.vue";
 */
import { defineComponent, h } from "vue";

export const KbdGroup = defineComponent({
  name: "KbdGroup",
  setup: (_, { slots }) => () => h("kbd", { class: "vin-kbd-group" }, slots.default?.()),
});
</script>

<script setup lang="ts"></script>

<template>
  <kbd class="vin-kbd"><slot /></kbd>
</template>
