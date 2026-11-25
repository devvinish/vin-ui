<script lang="ts">
/*
 * VinUI · Switch (Vue). API: spec/switch.json.
 * A real checkbox with role="switch": works in forms, no extra state needed.
 *   <Switch v-model="wifi" label="Wi-Fi" />
 */
import { computed, ref, useAttrs, useId } from "vue";

/** Dev-only warnings, without needing Node's `process` (Vite and the browser don't have it). */
const isDev = () => (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV !== "production";
const cx = (...c: unknown[]) => c.filter((x) => typeof x === "string" && x).join(" ");
</script>

<script setup lang="ts">
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<{
  /** Visible label, linked to the switch. Or use the #label slot. Without either, pass an aria-label. */
  label?: string;
  /** Smaller text under the label, read out with the switch. Or use the #description slot. */
  description?: string;
  size?: "sm" | "md";
  /** Put the switch after the text, full width (settings rows). Default: "start". */
  controlPosition?: "start" | "end";
  id?: string;
  /** On or off (v-model). */
  modelValue?: boolean;
  /** On at first, when you don't use v-model. */
  defaultChecked?: boolean;
}>(), { size: "md", controlPosition: "start", modelValue: undefined });

const emit = defineEmits<{ "update:modelValue": [checked: boolean] }>();
const slots = defineSlots<{ label?(): unknown; description?(): unknown }>();
const attrs = useAttrs() as Record<string, any>;

const auto = "vin-" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
const inputId = computed(() => props.id ?? auto);
const hasLabel = computed(() => !!(props.label || slots.label));
const hasDesc = computed(() => !!(props.description || slots.description));
const cls = computed(() => cx("vin-switch", props.size === "sm" && "vin-switch--sm"));

const inner = ref(props.defaultChecked);
const checked = computed(() => props.modelValue ?? inner.value);
const onChange = (e: Event) => {
  const v = (e.target as HTMLInputElement).checked;
  inner.value = v;
  emit("update:modelValue", v);
};

if (isDev() && !hasLabel.value && !attrs["aria-label"] && !attrs["aria-labelledby"]) {
  console.warn("VinUI Switch: pass a label or an aria-label.");
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
    v-bind="inputAttrs()"
    type="checkbox"
    role="switch"
    :class="[cls, attrs.class]"
    :style="attrs.style"
    :checked="checked"
    @change="onChange"
  />
  <div v-else :class="['vin-choice', controlPosition === 'end' && 'vin-choice--end', attrs.class]" :style="attrs.style">
    <input v-bind="inputAttrs()" type="checkbox" role="switch" :class="cls" :checked="checked" @change="onChange" />
    <div class="vin-choice__body">
      <label class="vin-choice__label" :for="inputId"><slot name="label">{{ label }}</slot></label>
      <p v-if="hasDesc" class="vin-choice__desc" :id="`${inputId}-desc`"><slot name="description">{{ description }}</slot></p>
    </div>
  </div>
</template>
