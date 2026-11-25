<script lang="ts">
/*
 * VinUI · Item (Vue). API: spec/item.json.
 * A row: media, title and description, actions. Pass href to make the whole row a link.
 *   import Item, { ItemGroup } from "@/components/vin/item.vue";
 */
import { Comment, Fragment, cloneVNode, defineComponent, h, type VNode } from "vue";

/** Element and component nodes from a slot, with fragments (v-for) opened up. */
function flatten(nodes: VNode[]): VNode[] {
  return nodes.flatMap((n) => (n.type === Fragment && Array.isArray(n.children) ? flatten(n.children as VNode[]) : n.type === Comment ? [] : [n]));
}

/** A bordered list of items. Each child becomes a list item for screen readers. */
export const ItemGroup = defineComponent({
  name: "ItemGroup",
  setup: (_, { slots }) => () =>
    h(
      "div",
      { role: "list", class: "vin-item-group" },
      flatten(slots.default?.() ?? []).map((n) => (typeof n.type === "symbol" || n.props?.role ? n : cloneVNode(n, { role: "listitem" }))),
    ),
});
</script>

<script setup lang="ts">
withDefaults(defineProps<{
  variant?: "default" | "outline" | "muted";
  /** Or use the #title slot. */
  title?: string;
  /** Or use the #description slot. */
  description?: string;
  /** Makes the whole row a link. Don't put buttons in actions then. */
  href?: string;
}>(), { variant: "default" });

const slots = defineSlots<{ default?(): unknown; media?(): unknown; title?(): unknown; description?(): unknown; actions?(): unknown }>();
</script>

<template>
  <component :is="href ? 'a' : 'div'" :href="href" :class="['vin-item', variant !== 'default' && `vin-item--${variant}`]">
    <div v-if="slots.media" class="vin-item__media"><slot name="media" /></div>
    <div class="vin-item__content">
      <p v-if="title != null || slots.title" class="vin-item__title"><slot name="title">{{ title }}</slot></p>
      <p v-if="description != null || slots.description" class="vin-item__description"><slot name="description">{{ description }}</slot></p>
      <slot />
    </div>
    <div v-if="slots.actions" class="vin-item__actions"><slot name="actions" /></div>
  </component>
</template>
