<script lang="ts">
/*
 * VinUI · Textarea (Vue). API: spec/textarea.json.
 * Multi-line text with label, hint, error, a character count (from maxlength) and optional auto-grow.
 *   <Textarea v-model="bio" label="Bio" :maxlength="160" />
 */
import { computed, nextTick, ref, useAttrs, useId, watch, onMounted } from "vue";

const cx = (...c: unknown[]) => c.filter((x) => typeof x === "string" && x).join(" ");
const canFieldSize = () => typeof CSS !== "undefined" && !!CSS.supports?.("field-sizing", "content");
</script>

<script setup lang="ts">
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<{
  /** Visible label. Or use the #label slot. Without either, pass an aria-label. */
  label?: string;
  hint?: string;
  /** Error message. Also marks the textarea invalid. */
  error?: string;
  /** Grow with the content instead of scrolling (up to 260px, then it scrolls). */
  autoResize?: boolean;
  /** Show "12 / 280" under the field. On by default when maxlength is set. */
  showCount?: boolean;
  maxlength?: number | string;
  id?: string;
  /** The text (v-model). */
  modelValue?: string;
  /** The starting text, when you don't use v-model. */
  defaultValue?: string;
}>(), { showCount: undefined, modelValue: undefined });

const emit = defineEmits<{ "update:modelValue": [value: string] }>();
const slots = defineSlots<{ label?(): unknown; hint?(): unknown; error?(): unknown }>();
const attrs = useAttrs() as Record<string, any>;

const auto = "vin-" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
const taId = computed(() => props.id ?? auto);
const el = ref<HTMLTextAreaElement | null>(null);
defineExpose({ el });

const inner = ref(props.defaultValue ?? "");
const current = computed(() => props.modelValue ?? inner.value);
const max = computed(() => (props.maxlength === undefined ? undefined : Number(props.maxlength)));
const counted = computed(() => (props.showCount ?? max.value !== undefined) && max.value !== undefined);
const hasLabel = computed(() => !!(props.label || slots.label));
const hasHint = computed(() => !!(props.hint || slots.hint));
const hasError = computed(() => !!(props.error || slots.error));
const cls = computed(() => cx("vin-input", "vin-textarea", props.autoResize && "vin-textarea--auto"));

function grow() {
  const t = el.value;
  if (!props.autoResize || !t || canFieldSize()) return;
  t.style.height = "auto";
  const cs = getComputedStyle(t);
  t.style.height = `${t.scrollHeight + parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth)}px`;
}
onMounted(grow);
watch(current, () => nextTick(grow));

const onInput = (e: Event) => {
  const v = (e.target as HTMLTextAreaElement).value;
  inner.value = v;
  emit("update:modelValue", v);
};

function areaAttrs() {
  const { class: _c, style: _s, ...rest } = attrs;
  if (!hasLabel.value) return { ...rest, id: props.id };
  return {
    ...rest,
    id: taId.value,
    "aria-invalid": hasError.value ? true : rest["aria-invalid"],
    "aria-describedby": cx(rest["aria-describedby"], hasError.value && `${taId.value}-error`, hasHint.value && `${taId.value}-hint`, counted.value && `${taId.value}-count`) || undefined,
  };
}
</script>

<template>
  <textarea
    v-if="!hasLabel"
    ref="el"
    v-bind="areaAttrs()"
    :maxlength="maxlength"
    :class="[cls, attrs.class]"
    :style="attrs.style"
    :value="current"
    @input="onInput"
  />
  <div v-else :class="['vin-field', attrs.class]" :style="attrs.style">
    <label class="vin-label" :for="taId"><slot name="label">{{ label }}</slot></label>
    <textarea ref="el" v-bind="areaAttrs()" :maxlength="maxlength" :class="cls" :value="current" @input="onInput" />
    <p v-if="hasError" class="vin-error" :id="`${taId}-error`"><slot name="error">{{ error }}</slot></p>
    <div v-if="hasHint || counted" class="vin-textarea__foot">
      <p v-if="hasHint" class="vin-hint" :id="`${taId}-hint`"><slot name="hint">{{ hint }}</slot></p>
      <p v-if="counted" class="vin-textarea__count" :id="`${taId}-count`" :data-over="current.length >= max! ? '' : undefined">{{ current.length }} / {{ max }}</p>
    </div>
  </div>
</template>
