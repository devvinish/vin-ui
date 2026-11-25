<script lang="ts">
/*
 * VinUI · Radio Group (Vue). API: spec/radio-group.json.
 * Native radios in a fieldset: arrow keys, forms and screen readers work with no extra code.
 *   <RadioGroup v-model="plan" label="Plan" :options="['Free', 'Pro']" />
 */
import { computed, ref, useAttrs, useId } from "vue";

const cx = (...c: unknown[]) => c.filter((x) => typeof x === "string" && x).join(" ");

export type RadioOption = string | { value: string; label: string; description?: string; disabled?: boolean };
const norm = (o: RadioOption) => (typeof o === "string" ? { value: o, label: o, description: undefined, disabled: false } : o);
</script>

<script setup lang="ts">
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<{
  /** The group's name, shown as the legend. Or use the #label slot. */
  label?: string;
  options: RadioOption[];
  /** The chosen value (v-model). */
  modelValue?: string;
  /** Chosen at first, when you don't use v-model. */
  defaultValue?: string;
  /** Form field name. Generated if you leave it out. */
  name?: string;
  orientation?: "vertical" | "horizontal";
  /** "cards" draws each option as a bordered card. */
  variant?: "default" | "cards";
  /** Error message. Also marks the radios invalid. */
  error?: string;
  disabled?: boolean;
}>(), { modelValue: undefined, orientation: "vertical", variant: "default" });

const emit = defineEmits<{ "update:modelValue": [value: string] }>();
const slots = defineSlots<{ label?(): unknown; error?(): unknown }>();
const attrs = useAttrs();

const base = "vin-" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
const groupName = computed(() => props.name ?? base);
const hasError = computed(() => !!(props.error || slots.error));
const items = computed(() => props.options.map(norm));
const inner = ref(props.defaultValue);
const current = computed(() => props.modelValue ?? inner.value);
const choose = (v: string) => { inner.value = v; emit("update:modelValue", v); };
const describedBy = () => cx(attrs["aria-describedby"], hasError.value && `${base}-error`) || undefined;
</script>

<template>
  <fieldset
    v-bind="attrs"
    :disabled="disabled"
    :aria-describedby="describedBy()"
    :class="['vin-radio-group', orientation === 'horizontal' && 'vin-radio-group--horizontal', variant === 'cards' && 'vin-radio-group--cards']"
  >
    <legend class="vin-radio-group__legend"><slot name="label">{{ label }}</slot></legend>
    <div v-for="(o, i) in items" :key="o.value" class="vin-choice">
      <input
        type="radio"
        class="vin-radio"
        :id="`${base}-${i}`"
        :name="groupName"
        :value="o.value"
        :checked="current === o.value"
        :disabled="o.disabled"
        :aria-invalid="hasError ? true : undefined"
        :aria-describedby="o.description ? `${base}-${i}-desc` : undefined"
        @change="choose(o.value)"
      />
      <div class="vin-choice__body">
        <label class="vin-choice__label" :for="`${base}-${i}`">{{ o.label }}</label>
        <p v-if="o.description" class="vin-choice__desc" :id="`${base}-${i}-desc`">{{ o.description }}</p>
      </div>
    </div>
    <p v-if="hasError" class="vin-error" :id="`${base}-error`"><slot name="error">{{ error }}</slot></p>
  </fieldset>
</template>
