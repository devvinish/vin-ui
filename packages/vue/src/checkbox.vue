<script lang="ts">
/*
 * VinUI · Checkbox (Vue). API: spec/checkbox.json.
 * A real <input type="checkbox">. With `label`, it renders the label and description for you.
 *   <Checkbox v-model="agreed" label="Accept the terms" />
 */
import { computed, ref, useAttrs, useId, watchEffect } from "vue";

/** Dev-only warnings, without needing Node's `process` (Vite and the browser don't have it). */
const isDev = () => (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV !== "production";
const cx = (...c: unknown[]) => c.filter((x) => typeof x === "string" && x).join(" ");
</script>

<script setup lang="ts">
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<{
  /** Visible label, linked to the checkbox. Or use the #label slot. Without either, pass an aria-label. */
  label?: string;
  /** Smaller text under the label, read out with the checkbox. Or use the #description slot. */
  description?: string;
  /** Show the "some selected" dash. */
  indeterminate?: boolean;
  /** Put the checkbox after the text, full width. Default: "start". */
  controlPosition?: "start" | "end";
  id?: string;
  /** Checked state (v-model). */
  modelValue?: boolean;
  /** Checked at first, when you don't use v-model. */
  defaultChecked?: boolean;
}>(), { controlPosition: "start", modelValue: undefined });

const emit = defineEmits<{ "update:modelValue": [checked: boolean] }>();
const slots = defineSlots<{ label?(): unknown; description?(): unknown }>();
const attrs = useAttrs() as Record<string, any>;

const el = ref<HTMLInputElement | null>(null);
watchEffect(() => { if (el.value) el.value.indeterminate = props.indeterminate; }, { flush: "post" });
defineExpose({ el });

const auto = "vin-" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
const inputId = computed(() => props.id ?? auto);
const hasLabel = computed(() => !!(props.label || slots.label));
const hasDesc = computed(() => !!(props.description || slots.description));

const inner = ref(props.defaultChecked);
const checked = computed(() => props.modelValue ?? inner.value);
const onChange = (e: Event) => {
  const v = (e.target as HTMLInputElement).checked;
  inner.value = v;
  emit("update:modelValue", v);
};

if (isDev() && !hasLabel.value && !attrs["aria-label"] && !attrs["aria-labelledby"]) {
  console.warn("VinUI Checkbox: pass a label or an aria-label.");
}

function inputAttrs() {
  const { class: _c, style: _s, ...rest } = attrs;
  if (!hasLabel.value) return { ...rest, id: props.id };
  return { ...rest, id: inputId.value, "aria-describedby": cx(rest["aria-describedby"], hasDesc.value && `${inputId.value}-desc`) || undefined };
}
</script>

<template>
  <input
    v-if="!hasLabel"
    ref="el"
    v-bind="inputAttrs()"
    type="checkbox"
    :class="['vin-checkbox', attrs.class]"
    :style="attrs.style"
    :checked="checked"
    @change="onChange"
  />
  <div v-else :class="['vin-choice', controlPosition === 'end' && 'vin-choice--end', attrs.class]" :style="attrs.style">
    <input ref="el" v-bind="inputAttrs()" type="checkbox" class="vin-checkbox" :checked="checked" @change="onChange" />
    <div class="vin-choice__body">
      <label class="vin-choice__label" :for="inputId"><slot name="label">{{ label }}</slot></label>
      <p v-if="hasDesc" class="vin-choice__desc" :id="`${inputId}-desc`"><slot name="description">{{ description }}</slot></p>
    </div>
  </div>
</template>
