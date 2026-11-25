<script lang="ts">
/*
 * VinUI · Native Select (Vue). API: spec/native-select.json.
 * The browser's own <select>, drawn like an Input. With `label`, it renders the field for you.
 *   <NativeSelect v-model="country" label="Country"><option>India</option></NativeSelect>
 */
import { computed, useAttrs, useId } from "vue";

const cx = (...c: unknown[]) => c.filter((x) => typeof x === "string" && x).join(" ");
</script>

<script setup lang="ts">
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<{
  size?: "sm" | "md" | "lg";
  /** Visible label. Or use the #label slot. Without either, pass an aria-label. */
  label?: string;
  hint?: string;
  /** Error message. Also marks the select invalid. */
  error?: string;
  id?: string;
  /** The chosen value (v-model). */
  modelValue?: string;
}>(), { size: "md", modelValue: undefined });

const emit = defineEmits<{ "update:modelValue": [value: string] }>();
const slots = defineSlots<{ default?(): unknown; label?(): unknown; hint?(): unknown; error?(): unknown }>();
const attrs = useAttrs() as Record<string, any>;

const auto = "vin-" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
const selectId = computed(() => props.id ?? auto);
const hasLabel = computed(() => !!(props.label || slots.label));
const hasHint = computed(() => !!(props.hint || slots.hint));
const hasError = computed(() => !!(props.error || slots.error));
const cls = computed(() => cx("vin-input", "vin-native-select", props.size !== "md" && `vin-input--${props.size}`));

const onChange = (e: Event) => emit("update:modelValue", (e.target as HTMLSelectElement).value);

function selectAttrs() {
  const { class: _c, style: _s, ...rest } = attrs;
  const value = props.modelValue !== undefined ? { value: props.modelValue } : {};
  if (!hasLabel.value) return { ...rest, ...value, id: props.id };
  return {
    ...rest,
    ...value,
    id: selectId.value,
    "aria-invalid": hasError.value ? true : rest["aria-invalid"],
    "aria-describedby": cx(rest["aria-describedby"], hasError.value && `${selectId.value}-error`, hasHint.value && `${selectId.value}-hint`) || undefined,
  };
}
</script>

<template>
  <select v-if="!hasLabel" v-bind="selectAttrs()" :class="[cls, attrs.class]" :style="attrs.style" @change="onChange"><slot /></select>
  <div v-else :class="['vin-field', attrs.class]" :style="attrs.style">
    <label class="vin-label" :for="selectId"><slot name="label">{{ label }}</slot></label>
    <select v-bind="selectAttrs()" :class="cls" @change="onChange"><slot /></select>
    <p v-if="hasError" class="vin-error" :id="`${selectId}-error`"><slot name="error">{{ error }}</slot></p>
    <p v-if="hasHint" class="vin-hint" :id="`${selectId}-hint`"><slot name="hint">{{ hint }}</slot></p>
  </div>
</template>
