<script lang="ts">
/*
 * VinUI · Progress (Vue). API: spec/progress.json.
 * Leave out `value` while the amount is unknown: the bar slides and has no aria-valuenow.
 * With a label, `class` and `style` go on the wrapper; other attributes go on the bar.
 */
import { computed, useAttrs, useId } from "vue";

const cx = (...c: unknown[]) => c.filter((x) => typeof x === "string" && x).join(" ");
</script>

<script setup lang="ts">
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<{
  /** 0 to max. Leave it out for an indeterminate bar. */
  value?: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "success";
  /** Shown above the bar and used as its name. Or use the #label slot. Without either, pass an aria-label. */
  label?: string;
  /** Show the percentage next to the label. */
  showValue?: boolean;
}>(), { max: 100, size: "md", variant: "default" });

const slots = defineSlots<{ label?(): unknown }>();
const attrs = useAttrs() as Record<string, any>;
const labelId = "vin-" + useId().replace(/[^a-zA-Z0-9_-]/g, "") + "-label";
const hasLabel = computed(() => !!(props.label || slots.label));
const known = computed(() => props.value != null);
const pct = computed(() => (known.value ? Math.round((Math.min(props.max, Math.max(0, props.value!)) / props.max) * 100) : 0));
const barClass = computed(() =>
  cx("vin-progress", props.size !== "md" && `vin-progress--${props.size}`, props.variant === "success" && "vin-progress--success", !known.value && "vin-progress--indeterminate"),
);
const fill = computed(() => (known.value ? { "--vin-value": `${pct.value}%` } : {}));

function barAttrs() {
  const { class: _c, style: _s, ...rest } = attrs;
  return rest;
}
</script>

<template>
  <div
    v-if="!hasLabel"
    role="progressbar"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-valuenow="known ? pct : undefined"
    v-bind="barAttrs()"
    :class="[barClass, attrs.class]"
    :style="[attrs.style, fill]"
  />
  <div v-else :class="['vin-field', attrs.class]" :style="attrs.style">
    <div class="vin-progress__head">
      <span class="vin-label" :id="labelId"><slot name="label">{{ label }}</slot></span>
      <span v-if="showValue && known" class="vin-progress__value">{{ pct }}%</span>
    </div>
    <div
      role="progressbar"
      :aria-labelledby="labelId"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-valuenow="known ? pct : undefined"
      v-bind="barAttrs()"
      :class="barClass"
      :style="fill"
    />
  </div>
</template>
