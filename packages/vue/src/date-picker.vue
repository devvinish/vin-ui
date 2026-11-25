<script lang="ts">
/*
 * VinUI · Date Picker (Vue). API: spec/date-picker.json.
 * A button showing the date; it opens a Calendar in the browser's popover (Esc and a click outside close it).
 * Dates are "YYYY-MM-DD" strings; a range is { from, to }.
 *   <DatePicker v-model="due" label="Due date" name="due" />
 *   <DatePicker mode="range" v-model="trip" label="Trip dates" />
 * With a label, `class` and `style` go on the wrapper.
 */
import { computed, onBeforeUnmount, ref, useAttrs, useId, type FunctionalComponent } from "vue";
import Calendar, { type DateRange } from "./calendar.vue";

/** Dev-only warnings, without needing Node's `process` (Vite and the browser don't have it). */
const isDev = () => (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV !== "production";
const cx = (...c: unknown[]) => c.filter((x) => typeof x === "string" && x).join(" ");
const utc = (s: string) => { const [y, m, d] = s.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d)); };

/** "Nov 14, 2026", or "Nov 9 – Nov 15, 2026" for a range. */
export function formatDate(value: string | DateRange, locale = "en-US") {
  const full = new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
  if (typeof value === "string") return full.format(utc(value));
  if (!value.to) return full.format(utc(value.from));
  const sameYear = value.from.slice(0, 4) === value.to.slice(0, 4);
  const first = sameYear ? new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", timeZone: "UTC" }) : full;
  return `${first.format(utc(value.from))} – ${full.format(utc(value.to))}`;
}

function place(el: HTMLElement, anchor: HTMLElement) {
  const r = anchor.getBoundingClientRect(), w = el.offsetWidth, h = el.offsetHeight;
  const vw = document.documentElement.clientWidth, vh = window.innerHeight, m = 8, gap = 6;
  const below = r.bottom + gap + h <= vh - m || r.top - gap - h < m;
  const rtl = getComputedStyle(anchor).direction === "rtl";
  const x = rtl ? r.right - w : r.left;
  el.style.left = `${Math.max(m, Math.min(x, vw - w - m))}px`;
  el.style.top = `${Math.max(m, Math.min(below ? r.bottom + gap : r.top - gap - h, vh - h - m))}px`;
  el.setAttribute("data-placed", below ? "bottom" : "top");
}

/** Renders its children as they are (used when there's no field wrapper). */
const Pass: FunctionalComponent = (_, { slots }) => slots.default?.();
</script>

<script setup lang="ts">
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<{
  /** "single" (default) or "range". */
  mode?: "single" | "range";
  /** The chosen date, or { from, to } in range mode (v-model). */
  modelValue?: string | DateRange | null;
  /** Chosen at first, when you don't use v-model. */
  defaultValue?: string | DateRange | null;
  /** Visible label. Or use the #label slot. Without either, pass an aria-label. */
  label?: string;
  placeholder?: string;
  hint?: string;
  /** Error message. Also marks the field invalid. */
  error?: string;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  /** Form field name: adds a hidden input ("YYYY-MM-DD", or "from/to" for a range). */
  name?: string;
  min?: string;
  max?: string;
  isDateDisabled?: (date: string) => boolean;
  weekStartsOn?: 0 | 1;
  locale?: string;
  id?: string;
}>(), { mode: "single", modelValue: undefined, placeholder: "Pick a date", size: "md", locale: "en-US" });

const emit = defineEmits<{ "update:modelValue": [value: string | DateRange] }>();
const slots = defineSlots<{ label?(): unknown; hint?(): unknown; error?(): unknown }>();
const attrs = useAttrs() as Record<string, any>;

const base = props.id ?? "vin-" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
const ids = { label: `${base}-label`, pop: `${base}-pop`, hint: `${base}-hint`, error: `${base}-error` };
const inner = ref(props.defaultValue ?? null);
const value = computed(() => (props.modelValue !== undefined ? props.modelValue : inner.value));
// While a range is half chosen, the calendar shows it but the field keeps the last full range.
const draft = ref<DateRange | null>(null);
const trigger = ref<HTMLButtonElement | null>(null);
const pop = ref<HTMLDivElement | null>(null);
const open = ref(false);

const hasLabel = computed(() => !!(props.label || slots.label));
const hasHint = computed(() => !!(props.hint || slots.hint));
const hasError = computed(() => !!(props.error || slots.error));
const shown = computed(() => {
  const v = value.value;
  return v && (typeof v === "string" || v.to) ? formatDate(v, props.locale) : null;
});
const raw = computed(() => {
  const v = value.value;
  return !v ? "" : typeof v === "string" ? v : v.to ? `${v.from}/${v.to}` : "";
});
const calendarValue = computed(() => (props.mode === "range" ? draft.value ?? value.value : value.value));
if (isDev() && !hasLabel.value && !attrs["aria-label"]) console.warn("VinUI DatePicker: pass a label or an aria-label.");

const reposition = () => { if (pop.value && trigger.value) place(pop.value, trigger.value); };
const unlisten = () => { window.removeEventListener("scroll", reposition, true); window.removeEventListener("resize", reposition); };
onBeforeUnmount(unlisten);
function onToggle(e: Event) {
  const now = (e as ToggleEvent).newState === "open";
  open.value = now;
  if (now) {
    reposition();
    window.addEventListener("scroll", reposition, true); window.addEventListener("resize", reposition);
    pop.value?.querySelector<HTMLButtonElement>('.vin-calendar__day[tabindex="0"]')?.focus();
  } else {
    draft.value = null;
    unlisten();
  }
}

const done = () => { pop.value?.hidePopover?.(); trigger.value?.focus(); };
function onChange(v: string | DateRange) {
  if (props.mode === "range" && typeof v !== "string" && !v.to) { draft.value = v; return; }
  draft.value = null;
  inner.value = v;
  emit("update:modelValue", v);
  done();
}
const wrapAttrs = computed(() => (hasLabel.value ? { class: ["vin-field", attrs.class], style: attrs.style } : {}));
</script>

<template>
  <component :is="hasLabel ? 'div' : Pass" v-bind="wrapAttrs">
    <span v-if="hasLabel" class="vin-label" :id="ids.label"><slot name="label">{{ label }}</slot></span>
    <div :class="['vin-date-picker', !hasLabel && attrs.class]" :style="hasLabel ? undefined : attrs.style">
      <button
        ref="trigger"
        type="button"
        :id="base"
        :class="cx('vin-input', 'vin-date-picker__trigger', size !== 'md' && `vin-input--${size}`)"
        :popovertarget="ids.pop"
        aria-haspopup="dialog"
        :aria-expanded="open"
        :aria-labelledby="hasLabel ? `${ids.label} ${base}` : undefined"
        :aria-label="hasLabel ? undefined : attrs['aria-label']"
        :aria-invalid="hasError ? true : undefined"
        :aria-describedby="cx(hasError && ids.error, hasHint && ids.hint) || undefined"
        :disabled="disabled"
      >
        <svg class="vin-date-picker__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="3" y="4.5" width="18" height="16.5" rx="2.5" /><path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
        </svg>
        <span v-if="shown" class="vin-date-picker__value">{{ shown }}</span>
        <span v-else class="vin-date-picker__value" data-placeholder="">{{ placeholder }}</span>
      </button>
      <div
        ref="pop"
        class="vin-popover vin-date-picker__content"
        :id="ids.pop"
        popover="auto"
        role="dialog"
        :aria-label="label ? `Choose ${label.toLowerCase()}` : 'Choose a date'"
        @toggle="onToggle"
      >
        <Calendar
          :mode="mode"
          :model-value="calendarValue"
          :min="min"
          :max="max"
          :is-date-disabled="isDateDisabled"
          :week-starts-on="weekStartsOn"
          :locale="locale"
          @update:model-value="onChange"
        />
      </div>
      <input v-if="name" type="hidden" :name="name" :value="raw" />
    </div>
    <p v-if="hasLabel && hasError" class="vin-error" :id="ids.error"><slot name="error">{{ error }}</slot></p>
    <p v-if="hasLabel && hasHint" class="vin-hint" :id="ids.hint"><slot name="hint">{{ hint }}</slot></p>
  </component>
</template>
