<script lang="ts">
/*
 * VinUI · Spinner (Vue). API: spec/spinner.json.
 * On its own: role="status" with a label. Next to text that says what's loading: decorative (hidden).
 *   import Spinner, { Loading } from "@/components/vin/spinner.vue";
 */
import { defineComponent, h, type PropType } from "vue";

const cx = (...c: unknown[]) => c.filter((x) => typeof x === "string" && x).join(" ");
type Size = "sm" | "md" | "lg";
type Variant = "current" | "primary";

const spinnerClass = (size: Size, variant: Variant) =>
  cx("vin-spinner", size !== "md" && `vin-spinner--${size}`, variant === "primary" && "vin-spinner--primary");

/** A spinner with a message. Screen readers announce the message. */
export const Loading = defineComponent({
  name: "Loading",
  props: {
    size: { type: String as PropType<Size>, default: "md" },
    variant: { type: String as PropType<Variant>, default: "current" },
  },
  setup: (props, { slots }) => () =>
    h("div", { role: "status", class: "vin-loading" }, [
      h("span", { "aria-hidden": "true", class: spinnerClass(props.size, props.variant) }),
      slots.default?.(),
    ]),
});
</script>

<script setup lang="ts">
withDefaults(defineProps<{
  size?: Size;
  /** "primary" uses the accent colour; the default takes the text colour. */
  variant?: Variant;
  /** What screen readers hear. Default: "Loading". */
  label?: string;
  /** Hide it from screen readers, when text next to it already says it. */
  decorative?: boolean;
}>(), { size: "md", variant: "current", label: "Loading" });
</script>

<template>
  <span v-if="decorative" aria-hidden="true" :class="spinnerClass(size, variant)" />
  <span v-else role="status" :aria-label="label" :class="spinnerClass(size, variant)" />
</template>
