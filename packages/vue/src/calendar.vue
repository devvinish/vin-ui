<script lang="ts">
/*
 * VinUI · Calendar (Vue). API: spec/calendar.json.
 * A month grid for picking a date or a range (WAI-ARIA date grid). Dates are "YYYY-MM-DD"
 * strings, so time zones never shift a day.
 * Keys: ← → ↑ ↓ by day and week, Home/End start and end of the week, PageUp/PageDown by month
 * (with Shift, by year), Enter or Space to choose.
 *   <Calendar v-model="due" />
 *   <Calendar mode="range" v-model="trip" />   (trip is { from, to? })
 */
import { computed, nextTick, onMounted, ref, useId } from "vue";

/* ---------- dates as YYYY-MM-DD, worked out in UTC ---------- */
const pad = (n: number) => String(n).padStart(2, "0");
const toIso = (d: Date) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
const fromIso = (s: string) => { const [y, m, d] = s.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d || 1)); };
const addDays = (s: string, n: number) => { const d = fromIso(s); d.setUTCDate(d.getUTCDate() + n); return toIso(d); };
const addMonths = (s: string, n: number) => {
  const d = fromIso(s), day = d.getUTCDate();
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1));
  const last = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth() + 1, 0)).getUTCDate();
  t.setUTCDate(Math.min(day, last));
  return toIso(t);
};
const monthOf = (s: string) => s.slice(0, 7);
const localToday = () => { const n = new Date(); return `${n.getFullYear()}-${pad(n.getMonth() + 1)}-${pad(n.getDate())}`; };

/** The 42 days (6 weeks) shown for a month. */
export function monthDays(month: string, weekStartsOn: 0 | 1 = 1) {
  const first = fromIso(`${month}-01`);
  const start = addDays(toIso(first), -((first.getUTCDay() - weekStartsOn + 7) % 7));
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

export type DateRange = { from: string; to?: string };
</script>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  /** "single" (default) or "range". */
  mode?: "single" | "range";
  /** The chosen date, or { from, to } in range mode (v-model). */
  modelValue?: string | DateRange | null;
  /** Chosen at first, when you don't use v-model. */
  defaultValue?: string | DateRange | null;
  /** Month shown, "YYYY-MM" (v-model:month). */
  month?: string;
  defaultMonth?: string;
  /** Earliest and latest dates that can be chosen. */
  min?: string;
  max?: string;
  /** Return true for dates that can't be chosen. */
  isDateDisabled?: (date: string) => boolean;
  /** 1 = Monday (default), 0 = Sunday. */
  weekStartsOn?: 0 | 1;
  /** Names of months and days. Default "en-US". */
  locale?: string;
  labels?: { previous?: string; next?: string };
}>(), { mode: "single", modelValue: undefined, weekStartsOn: 1, locale: "en-US" });

const emit = defineEmits<{
  "update:modelValue": [value: string | DateRange];
  "update:month": [month: string];
  /** A day was chosen with the keyboard or mouse (after the value changes). */
  "day-click": [date: string];
}>();

const titleId = `vin-cal-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}-title`;
const inner = ref(props.defaultValue ?? null);
const value = computed(() => (props.modelValue !== undefined ? props.modelValue : inner.value));
const single = computed(() => (props.mode === "single" ? (value.value as string | null) : null));
const range = computed(() => (props.mode === "range" ? (value.value as DateRange | null) : null));
const anchor = computed(() => single.value ?? range.value?.from ?? null);

// Only in the browser, so server HTML is stable.
const today = ref<string | null>(null);
onMounted(() => { today.value = localToday(); });

const innerMonth = ref(props.defaultMonth ?? (anchor.value ? monthOf(anchor.value) : monthOf(localToday())));
const shown = computed(() => props.month ?? innerMonth.value);
const setMonth = (m: string) => { innerMonth.value = m; emit("update:month", m); };

const focusDate = ref<string | null>(null);
const grid = ref<HTMLTableElement | null>(null);

const disabled = (d: string) =>
  (props.min !== undefined && d < props.min) || (props.max !== undefined && d > props.max) || !!props.isDateDisabled?.(d);
const days = computed(() => monthDays(shown.value, props.weekStartsOn));
const inMonth = (d: string) => monthOf(d) === shown.value;
// The day that takes Tab: the focused one, else the chosen one, else today, else the 1st.
const tabbable = computed(() => [focusDate.value, anchor.value, today.value, `${shown.value}-01`].find((d) => d && inMonth(d)) ?? `${shown.value}-01`);

const fmt = computed(() => ({
  title: new Intl.DateTimeFormat(props.locale, { month: "long", year: "numeric", timeZone: "UTC" }),
  day: new Intl.DateTimeFormat(props.locale, { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }),
  short: new Intl.DateTimeFormat(props.locale, { weekday: "short", timeZone: "UTC" }),
  long: new Intl.DateTimeFormat(props.locale, { weekday: "long", timeZone: "UTC" }),
}));

function choose(d: string) {
  if (disabled(d)) return;
  if (props.mode === "single") {
    inner.value = d;
    emit("update:modelValue", d);
  } else {
    const r = range.value;
    const next: DateRange = !r || r.to || !r.from ? { from: d } : d < r.from ? { from: d, to: r.from } : { from: r.from, to: d };
    inner.value = next;
    emit("update:modelValue", next);
  }
  if (!inMonth(d)) setMonth(monthOf(d));
  focusDate.value = d;
  emit("day-click", d);
}
async function moveTo(d: string) {
  focusDate.value = d;
  if (!inMonth(d)) setMonth(monthOf(d));
  await nextTick();
  grid.value?.querySelector<HTMLButtonElement>(`[data-date="${tabbable.value}"]`)?.focus();
}

function onKeyDown(e: KeyboardEvent) {
  const from = (e.target as HTMLElement).closest<HTMLElement>("[data-date]")?.dataset.date;
  if (!from) return;
  const rtl = getComputedStyle(e.currentTarget as HTMLElement).direction === "rtl";
  const dow = (fromIso(from).getUTCDay() - props.weekStartsOn + 7) % 7;
  const to = ({
    ArrowRight: addDays(from, rtl ? -1 : 1), ArrowLeft: addDays(from, rtl ? 1 : -1),
    ArrowDown: addDays(from, 7), ArrowUp: addDays(from, -7),
    Home: addDays(from, -dow), End: addDays(from, 6 - dow),
    PageDown: addMonths(from, e.shiftKey ? 12 : 1), PageUp: addMonths(from, e.shiftKey ? -12 : -1),
  } as Record<string, string>)[e.key];
  if (!to) return;
  e.preventDefault();
  moveTo(to);
}

const rangeOf = (d: string): "start" | "middle" | "end" | undefined => {
  const r = range.value;
  if (!r?.from || !r.to || r.from === r.to) return undefined;
  return d === r.from ? "start" : d === r.to ? "end" : d > r.from && d < r.to ? "middle" : undefined;
};
const isSelected = (d: string) => {
  const r = range.value;
  return props.mode === "single" ? d === single.value : !!r && (d === r.from || d === r.to || (!!r.to && d > r.from && d < r.to));
};
const weekday = (i: number) => fromIso(toIso(new Date(Date.UTC(2024, 0, 7 + ((i + props.weekStartsOn) % 7))))); // 2024-01-07 was a Sunday
const onFocus = (d: string) => { if (d !== focusDate.value && inMonth(d)) focusDate.value = d; };
const prev = () => setMonth(addMonths(`${shown.value}-01`, -1).slice(0, 7));
const next = () => setMonth(addMonths(`${shown.value}-01`, 1).slice(0, 7));
</script>

<template>
  <div class="vin-calendar">
    <div class="vin-calendar__header">
      <button type="button" class="vin-btn vin-btn--ghost vin-btn--icon vin-btn--sm vin-calendar__nav" :aria-label="labels?.previous ?? 'Previous month'" @click="prev">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
      </button>
      <p class="vin-calendar__title" :id="titleId" aria-live="polite">{{ fmt.title.format(fromIso(`${shown}-01`)) }}</p>
      <button type="button" class="vin-btn vin-btn--ghost vin-btn--icon vin-btn--sm vin-calendar__nav" :aria-label="labels?.next ?? 'Next month'" @click="next">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
      </button>
    </div>
    <table ref="grid" class="vin-calendar__grid" role="grid" :aria-labelledby="titleId" @keydown="onKeyDown">
      <thead>
        <tr>
          <th v-for="i in 7" :key="i" scope="col" :abbr="fmt.long.format(weekday(i - 1))">{{ fmt.short.format(weekday(i - 1)) }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="w in 6" :key="w">
          <td v-for="d in days.slice((w - 1) * 7, w * 7)" :key="d" :aria-selected="isSelected(d)" :data-range="rangeOf(d)">
            <button
              type="button"
              class="vin-calendar__day"
              :tabindex="d === tabbable ? 0 : -1"
              :data-date="d"
              :data-outside="inMonth(d) ? undefined : ''"
              :aria-label="fmt.day.format(fromIso(d))"
              :aria-disabled="disabled(d) || undefined"
              :aria-current="d === today ? 'date' : undefined"
              @click="choose(d)"
              @focus="onFocus(d)"
            >{{ Number(d.slice(8)) }}</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
