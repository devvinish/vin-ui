<script setup lang="ts">
/*
 * VinUI · Input (Vue): Field (this file's default export), Input and Label.
 * For a full Textarea (count, auto-grow), see textarea.vue.
 * API: spec/input.json. Field wires up the label, hint and error for you.
 *   <Field v-model="email" label="Email" type="email" hint="We'll never share it." />
 * `class` and `style` go on the wrapper; every other attribute goes to the input.
 */

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<{
  /** Visible label, linked to the input. Or use the #label slot. */
  label?: string;
  /** Help text under the input. Or use the #hint slot. */
  hint?: string;
  /** Error message. Also marks the input invalid. Or use the #error slot. */
  error?: string;
  /** Render a textarea instead of an input. */
  multiline?: boolean;
  rows?: number | string;
  size?: InputSize;
  id?: string;
  modelValue?: string | number;
  /** The starting value, when you don't use v-model. */
  defaultValue?: string | number;
}>(), { size: "md", modelValue: undefined, defaultValue: undefined });

const emit = defineEmits<{ "update:modelValue": [value: string] }>();
const slots = defineSlots<{ label?(): unknown; hint?(): unknown; error?(): unknown }>();
const attrs = useAttrs() as Record<string, any>;

const auto = "vin-" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
const inputId = computed(() => props.id ?? auto);
const hasHint = computed(() => !!(props.hint || slots.hint));
const hasError = computed(() => !!(props.error || slots.error));

const inner = ref(props.defaultValue ?? "");
const current = computed(() => props.modelValue ?? inner.value);
const onInput = (e: Event) => {
  const v = (e.target as HTMLInputElement).value;
  inner.value = v;
  emit("update:modelValue", v);
};

function controlAttrs() {
  const { class: _c, style: _s, ...rest } = attrs;
  const describedBy = cx(rest["aria-describedby"] as string, hasError.value && `${inputId.value}-error`, hasHint.value && `${inputId.value}-hint`);
  return {
    ...rest,
    id: inputId.value,
    value: current.value,
    "aria-describedby": describedBy || undefined,
    "aria-invalid": hasError.value ? true : rest["aria-invalid"],
    onInput,
  };
}
</script>

<script lang="ts">
import { computed, defineComponent, h, ref, useAttrs, useId, type PropType } from "vue";

/** Dev-only warnings, without needing Node's `process` (Vite and the browser don't have it). */
const isDev = () => (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV !== "production";
const cx = (...c: (string | false | undefined | null)[]) => c.filter(Boolean).join(" ");

export type InputSize = "sm" | "md" | "lg";

/** The class list for an input. */
export function inputClasses({ size = "md", className }: { size?: InputSize; className?: string } = {}): string {
  return cx("vin-input", size !== "md" && `vin-input--${size}`, className);
}

/** A plain input. Name it with an id and a matching <Label for>, or an aria-label. */
export const Input = defineComponent({
  name: "Input",
  props: {
    /** Height and text size, matching the Button sizes. Default: "md". */
    size: { type: String as PropType<InputSize>, default: "md" },
    modelValue: { type: [String, Number], default: undefined },
    /** The starting value, when you don't use v-model. */
    defaultValue: { type: [String, Number], default: undefined },
  },
  emits: { "update:modelValue": (_value: string) => true },
  setup(props, { attrs, emit }) {
    if (isDev() && !attrs.id && !attrs["aria-label"] && !attrs["aria-labelledby"]) {
      console.warn("VinUI Input: give it an id with a matching <Label for>, an aria-label, or use <Field label>.");
    }
    const inner = ref(props.defaultValue ?? "");
    return () =>
      h("input", {
        class: inputClasses({ size: props.size }),
        value: props.modelValue ?? inner.value,
        onInput: (e: Event) => {
          const v = (e.target as HTMLInputElement).value;
          inner.value = v;
          emit("update:modelValue", v);
        },
      });
  },
});

export const Label = defineComponent({
  name: "Label",
  setup: (_, { slots }) => () => h("label", { class: "vin-label" }, slots.default?.()),
});
</script>

<template>
  <div :class="['vin-field', attrs.class]" :style="attrs.style as any">
    <label class="vin-label" :for="inputId"><slot name="label">{{ label }}</slot></label>
    <textarea v-if="multiline" v-bind="controlAttrs()" :rows="rows" class="vin-input" />
    <input v-else v-bind="controlAttrs()" :class="inputClasses({ size })" />
    <p v-if="hasError" class="vin-error" :id="`${inputId}-error`"><slot name="error">{{ error }}</slot></p>
    <p v-if="hasHint" class="vin-hint" :id="`${inputId}-hint`"><slot name="hint">{{ hint }}</slot></p>
  </div>
</template>
