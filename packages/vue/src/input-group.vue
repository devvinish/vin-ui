<script lang="ts">
/*
 * VinUI · Input Group (Vue). API: spec/input-group.json.
 * An input with text, icons or buttons attached. With `label`, it renders the field for you.
 *   <InputGroup v-model="site" label="Website" start="https://" />
 *   <InputGroup aria-label="Search"><template #start><svg … /></template></InputGroup>
 * With a label, `class` and `style` go on the wrapper; other attributes go on the input.
 */
import { computed, ref, useAttrs, useId } from "vue";

const cx = (...c: unknown[]) => c.filter((x) => typeof x === "string" && x).join(" ");
</script>

<script setup lang="ts">
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<{
  /** Shown before the input. Or use the #start slot for an icon or a small Button. */
  start?: string;
  /** Shown after the input. Or use the #end slot. */
  end?: string;
  size?: "sm" | "md" | "lg";
  label?: string;
  hint?: string;
  /** Error message. Also marks the input invalid. */
  error?: string;
  id?: string;
  /** The text (v-model). */
  modelValue?: string;
  /** The starting text, when you don't use v-model. */
  defaultValue?: string;
}>(), { size: "md", modelValue: undefined });

const emit = defineEmits<{ "update:modelValue": [value: string] }>();
const slots = defineSlots<{ start?(): unknown; end?(): unknown; label?(): unknown; hint?(): unknown; error?(): unknown }>();
const attrs = useAttrs() as Record<string, any>;

const auto = "vin-" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
const inputId = computed(() => props.id ?? auto);
const hasLabel = computed(() => !!(props.label || slots.label));
const hasHint = computed(() => !!(props.hint || slots.hint));
const hasError = computed(() => !!(props.error || slots.error));
const hasStart = computed(() => props.start !== undefined || !!slots.start);
const hasEnd = computed(() => props.end !== undefined || !!slots.end);

const inner = ref(props.defaultValue ?? "");
const current = computed(() => props.modelValue ?? inner.value);
const onInput = (e: Event) => {
  const v = (e.target as HTMLInputElement).value;
  inner.value = v;
  emit("update:modelValue", v);
};

// Clicking the padding or an addon's text focuses the input (not when clicking a button).
function onPointerDown(e: PointerEvent) {
  if (!(e.target as HTMLElement).closest("button, a, input")) {
    e.preventDefault();
    document.getElementById(inputId.value)?.focus();
  }
}

function inputAttrs() {
  const { class: _c, style: _s, ...rest } = attrs;
  return {
    ...rest,
    id: inputId.value,
    "aria-invalid": hasError.value ? true : rest["aria-invalid"],
    "aria-describedby": cx(rest["aria-describedby"], hasError.value && `${inputId.value}-error`, hasHint.value && `${inputId.value}-hint`) || undefined,
  };
}
const groupClass = computed(() => cx("vin-input", "vin-input-group", props.size !== "md" && `vin-input--${props.size}`));
</script>

<template>
  <div v-if="!hasLabel" :class="[groupClass, attrs.class]" :style="attrs.style" @pointerdown="onPointerDown">
    <span v-if="hasStart" class="vin-input-group__addon"><slot name="start">{{ start }}</slot></span>
    <input v-bind="inputAttrs()" class="vin-input-group__input" :value="current" @input="onInput" />
    <span v-if="hasEnd" class="vin-input-group__addon"><slot name="end">{{ end }}</slot></span>
  </div>
  <div v-else :class="['vin-field', attrs.class]" :style="attrs.style">
    <label class="vin-label" :for="inputId"><slot name="label">{{ label }}</slot></label>
    <div :class="groupClass" @pointerdown="onPointerDown">
      <span v-if="hasStart" class="vin-input-group__addon"><slot name="start">{{ start }}</slot></span>
      <input v-bind="inputAttrs()" class="vin-input-group__input" :value="current" @input="onInput" />
      <span v-if="hasEnd" class="vin-input-group__addon"><slot name="end">{{ end }}</slot></span>
    </div>
    <p v-if="hasError" class="vin-error" :id="`${inputId}-error`"><slot name="error">{{ error }}</slot></p>
    <p v-if="hasHint" class="vin-hint" :id="`${inputId}-hint`"><slot name="hint">{{ hint }}</slot></p>
  </div>
</template>
