<script lang="ts">
/*
 * VinUI · Slider (Vue). API: spec/slider.json.
 * Pass a number for one value (a native range input), or [from, to] for a range:
 * two role="slider" thumbs (WAI-ARIA multi-thumb slider) on one track.
 *   <Slider v-model="volume" label="Volume" show-value />
 *   <Slider v-model="price" :default-value="[200, 700]" label="Price" :max="1000" />
 * With a label, `class` and `style` go on the wrapper; other attributes go on the input.
 */
import { computed, ref, useAttrs, useId } from "vue";

type Val = number | [number, number];
</script>

<script setup lang="ts">
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<{
  /** The value (v-model): a number, or [from, to] for a range. */
  modelValue?: Val;
  /** The starting value, when you don't use v-model. */
  defaultValue?: Val;
  min?: number;
  max?: number;
  step?: number;
  /** Visible label. Or use the #label slot. Without either, pass an aria-label (for a range: thumbLabels). */
  label?: string;
  /** Show the current value next to the label. */
  showValue?: boolean;
  /** Format the shown value (and the range thumbs' aria-valuetext), e.g. (v) => `₹${v}`. */
  formatValue?: (v: number) => string;
  /** Range only: names for the two thumbs. Default: "Minimum", "Maximum". */
  thumbLabels?: [string, string];
  /** Form field name. A range submits name-min and name-max. */
  name?: string;
  id?: string;
  disabled?: boolean;
}>(), { modelValue: undefined, min: 0, max: 100, step: 1, formatValue: String, thumbLabels: () => ["Minimum", "Maximum"] });

const emit = defineEmits<{ "update:modelValue": [value: Val] }>();
const slots = defineSlots<{ label?(): unknown }>();
const attrs = useAttrs() as Record<string, any>;

const base = props.id ?? "vin-" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
const labelId = `${base}-label`;
const inner = ref<Val>(props.defaultValue ?? props.min);
const current = computed<Val>(() => props.modelValue ?? inner.value);
const range = computed(() => Array.isArray(current.value));
const pair = computed(() => current.value as [number, number]);
const single = computed(() => current.value as number);
const hasLabel = computed(() => !!(props.label || slots.label));
const frac = (v: number) => (v - props.min) / (props.max - props.min);
const shown = computed(() => (range.value ? `${props.formatValue(pair.value[0])} – ${props.formatValue(pair.value[1])}` : props.formatValue(single.value)));
const set = (v: Val) => { inner.value = v; emit("update:modelValue", v); };

function inputAttrs() {
  const { class: _c, style: _s, ...rest } = attrs;
  return rest;
}

/* ---- Range: two thumbs on one track ---- */
const track = ref<HTMLDivElement | null>(null);
let latest: [number, number] = [0, 0];
const rtl = () => !!track.value && getComputedStyle(track.value).direction === "rtl";

function setThumb(i: 0 | 1, raw: number) {
  const [a, b] = latest;
  const { min, max, step } = props;
  let v = Math.round((raw - min) / step) * step + min;
  v = Math.min(i === 0 ? b : max, Math.max(i === 0 ? min : a, v));
  if (v === latest[i]) return;
  const next: [number, number] = i === 0 ? [v, b] : [a, v];
  latest = next;
  set(next);
}
function valueAt(x: number) {
  const el = track.value!;
  const r = el.getBoundingClientRect();
  const size = (el.querySelector(".vin-range__thumb") as HTMLElement).offsetWidth;
  let f = (x - r.left - size / 2) / (r.width - size);
  if (rtl()) f = 1 - f;
  return props.min + Math.min(1, Math.max(0, f)) * (props.max - props.min);
}
function onThumbKeydown(i: 0 | 1, e: KeyboardEvent) {
  latest = pair.value;
  const { min, max, step } = props;
  const dir = rtl() ? -1 : 1;
  const big = Math.max(step, (max - min) / 10);
  const d = ({ ArrowRight: step * dir, ArrowLeft: -step * dir, ArrowUp: step, ArrowDown: -step, PageUp: big, PageDown: -big } as Record<string, number>)[e.key];
  const v = latest[i];
  if (d !== undefined) { e.preventDefault(); setThumb(i, v + d); }
  else if (e.key === "Home") { e.preventDefault(); setThumb(i, min); }
  else if (e.key === "End") { e.preventDefault(); setThumb(i, max); }
}
function onTrackPointerdown(e: PointerEvent) {
  if (props.disabled) return;
  latest = pair.value;
  const el = e.currentTarget as HTMLElement;
  const thumbs = [...el.querySelectorAll<HTMLElement>(".vin-range__thumb")];
  const hit = thumbs.indexOf(e.target as HTMLElement);
  const v = valueAt(e.clientX);
  const [a, b] = latest;
  const i = (hit >= 0 ? hit : a === b ? (v < a ? 0 : 1) : Math.abs(v - a) <= Math.abs(v - b) ? 0 : 1) as 0 | 1;
  e.preventDefault();
  thumbs[i].focus();
  if (hit < 0) setThumb(i, v);
  el.setPointerCapture?.(e.pointerId);
  const move = (ev: PointerEvent) => setThumb(i, valueAt(ev.clientX));
  const up = () => { el.removeEventListener("pointermove", move); el.removeEventListener("pointerup", up); el.removeEventListener("pointercancel", up); };
  el.addEventListener("pointermove", move);
  el.addEventListener("pointerup", up);
  el.addEventListener("pointercancel", up);
}
</script>

<template>
  <div
    v-if="hasLabel"
    :class="['vin-field', attrs.class]"
    :style="attrs.style"
    :role="range ? 'group' : undefined"
    :aria-labelledby="range ? labelId : undefined"
  >
    <div class="vin-slider__head">
      <span v-if="range" class="vin-label" :id="labelId"><slot name="label">{{ label }}</slot></span>
      <label v-else class="vin-label" :id="labelId" :for="base"><slot name="label">{{ label }}</slot></label>
      <output v-if="showValue" class="vin-slider__value" :for="range ? `${base}-from ${base}-to` : base">{{ shown }}</output>
    </div>
    <template v-if="range">
      <div
        ref="track"
        class="vin-range"
        :style="{ '--vin-from': String(frac(pair[0])), '--vin-to': String(frac(pair[1])) }"
        :aria-disabled="disabled || undefined"
        @pointerdown="onTrackPointerdown"
      >
        <span
          v-for="i in ([0, 1] as const)"
          :key="i"
          :id="`${base}-${i === 0 ? 'from' : 'to'}`"
          class="vin-range__thumb"
          role="slider"
          :tabindex="disabled ? -1 : 0"
          :aria-label="thumbLabels[i]"
          :aria-valuemin="i === 0 ? min : pair[0]"
          :aria-valuemax="i === 0 ? pair[1] : max"
          :aria-valuenow="pair[i]"
          :aria-valuetext="formatValue(pair[i])"
          :aria-disabled="disabled || undefined"
          @keydown="onThumbKeydown(i, $event)"
        />
        <input v-if="name" type="hidden" :name="`${name}-min`" :value="pair[0]" />
        <input v-if="name" type="hidden" :name="`${name}-max`" :value="pair[1]" />
      </div>
    </template>
    <input
      v-else
      v-bind="inputAttrs()"
      type="range"
      :id="base"
      :name="name"
      class="vin-slider"
      :style="{ '--vin-fill': `${frac(single) * 100}%` }"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
      :value="single"
      @input="set(+($event.target as HTMLInputElement).value)"
    />
  </div>
  <div
    v-else-if="range"
    ref="track"
    :class="['vin-range', attrs.class]"
    :style="[attrs.style, { '--vin-from': String(frac(pair[0])), '--vin-to': String(frac(pair[1])) }]"
    :aria-disabled="disabled || undefined"
    @pointerdown="onTrackPointerdown"
  >
    <span
      v-for="i in ([0, 1] as const)"
      :key="i"
      :id="`${base}-${i === 0 ? 'from' : 'to'}`"
      class="vin-range__thumb"
      role="slider"
      :tabindex="disabled ? -1 : 0"
      :aria-label="thumbLabels[i]"
      :aria-valuemin="i === 0 ? min : pair[0]"
      :aria-valuemax="i === 0 ? pair[1] : max"
      :aria-valuenow="pair[i]"
      :aria-valuetext="formatValue(pair[i])"
      :aria-disabled="disabled || undefined"
      @keydown="onThumbKeydown(i, $event)"
    />
    <input v-if="name" type="hidden" :name="`${name}-min`" :value="pair[0]" />
    <input v-if="name" type="hidden" :name="`${name}-max`" :value="pair[1]" />
  </div>
  <input
    v-else
    v-bind="inputAttrs()"
    type="range"
    :id="base"
    :name="name"
    :class="['vin-slider', attrs.class]"
    :style="[attrs.style, { '--vin-fill': `${frac(single) * 100}%` }]"
    :min="min"
    :max="max"
    :step="step"
    :disabled="disabled"
    :value="single"
    @input="set(+($event.target as HTMLInputElement).value)"
  />
</template>
