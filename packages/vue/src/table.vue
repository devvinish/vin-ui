<script lang="ts">
/*
 * VinUI · Table (Vue). API: spec/table.json.
 * Write the thead / tbody / tfoot yourself; Table adds the scrolling frame and the caption.
 * Mark number cells with class="vin-table__num". `style` goes on the frame, other attributes on the table.
 */
import { computed, useAttrs } from "vue";
</script>

<script setup lang="ts">
defineOptions({ inheritAttrs: false });

const props = defineProps<{
  /** Says what the table shows. Shown under the table. Or use the #caption slot. */
  caption?: string;
  /** Name for the scrolling frame. Default: the caption. */
  label?: string;
  striped?: boolean;
}>();
const slots = defineSlots<{ default?(): unknown; caption?(): unknown }>();
const attrs = useAttrs() as Record<string, any>;
const name = computed(() => props.label ?? props.caption);

function tableAttrs() {
  const { style: _s, ...rest } = attrs;
  return rest;
}
</script>

<template>
  <div class="vin-table-wrap" role="region" :aria-label="name" tabindex="0" :style="attrs.style">
    <table v-bind="tableAttrs()" :class="['vin-table', striped && 'vin-table--striped']">
      <caption v-if="caption != null || slots.caption" class="vin-table__caption"><slot name="caption">{{ caption }}</slot></caption>
      <slot />
    </table>
  </div>
</template>
