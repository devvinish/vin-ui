<script lang="ts">
/*
 * VinUI · Chart (Vue). API: spec/chart.json.
 *   <Chart type="bar" label="Visitors by month" :data="rows" index="month"
 *          :series="[{ key: 'desktop', label: 'Desktop' }, { key: 'mobile', label: 'Mobile' }]" />
 * Inline SVG, no dependencies. Colours come from the theme (--vin-chart-1…5, derived from the accent).
 * Screen readers get the label and a visually hidden data table. Hover, or focus and use the arrow
 * keys, to see the values of one category in a tooltip.
 */
import { computed, ref } from "vue";

/** Dev-only warnings, without needing Node's `process` (Vite and the browser don't have it). */
const isDev = () => (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV !== "production";
const r2 = (n: number) => Math.round(n * 100) / 100;

export type ChartType = "bar" | "line" | "area";
export type ChartSeries = {
  /** The field in each data row. */
  key: string;
  /** Name shown in the legend, tooltip and table. Default: the key. */
  label?: string;
  /** Any CSS colour. Default: the next theme colour (--vin-chart-1…5). */
  color?: string;
};
export type ChartRow = Record<string, string | number | null | undefined>;

const W = 600;
const defaultFormat = (v: number) => v.toLocaleString("en-US");
const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });
const defaultTick = (v: number) => compact.format(v);

/** Round numbers for the y axis: about four steps of 1, 2, 2.5 or 5 × 10ⁿ, always including zero. */
export function niceTicks(values: number[], count = 4): number[] {
  let lo = Math.min(0, ...values), hi = Math.max(0, ...values);
  if (hi === lo) hi = lo + 1;
  const raw = (hi - lo) / count, p = 10 ** Math.floor(Math.log10(raw)), f = raw / p;
  const step = (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p;
  lo = Math.floor(lo / step + 1e-9) * step;
  hi = Math.ceil(hi / step - 1e-9) * step;
  const out: number[] = [];
  for (let v = lo; v <= hi + step / 2; v += step) out.push(r2(v) === 0 ? 0 : Number(v.toPrecision(12)));
  return out;
}

const num = (row: ChartRow, key: string) => {
  const v = row[key];
  return typeof v === "number" && Number.isFinite(v) ? v : null;
};
const path = (pts: [number, number][]) => pts.map(([px, py], i) => `${i ? "L" : "M"}${px} ${py}`).join("");
</script>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  type?: ChartType;
  /** What the chart shows. Names the picture and captions the data table. */
  label: string;
  data: ChartRow[];
  /** The field that names each category (the x axis). */
  index: string;
  series: ChartSeries[];
  /** Formats values in the tooltip and table. Default: 12,400. */
  format?: (value: number) => string;
  /** Formats the y-axis ticks. Default: compact (12K). */
  tickFormat?: (value: number) => string;
  /** Column heading for the categories in the data table. Default: the index field. */
  indexLabel?: string;
  /** Width / height of the plot. Default 2.4. */
  aspectRatio?: number;
  /** Show the legend. Default: when there's more than one series. */
  legend?: boolean;
}>(), { type: "bar", format: defaultFormat, tickFormat: defaultTick, aspectRatio: 2.4, legend: undefined });

if (isDev() && !props.label) console.warn("VinUI Chart: pass a label that says what the chart shows.");

const active = ref<number | null>(null);
const n = computed(() => props.data.length);
const H = computed(() => r2(W / props.aspectRatio));
const ticks = computed(() => {
  const values = props.data.flatMap((row) => props.series.map((s) => num(row, s.key)).filter((v): v is number => v != null));
  return niceTicks(values.length ? values : [0, 1]);
});
const y = (v: number) => {
  const t = ticks.value, lo = t[0], hi = t[t.length - 1];
  return r2(H.value - ((v - lo) / (hi - lo)) * H.value);
};
const band = computed(() => W / Math.max(n.value, 1));
const xc = (i: number) => r2((i + 0.5) * band.value);
const base = computed(() => {
  const t = ticks.value;
  return y(Math.min(Math.max(0, t[0]), t[t.length - 1]));
});
const color = (s: ChartSeries, i: number) => s.color ?? `var(--vin-chart-${(i % 5) + 1})`;
const name = (s: ChartSeries) => s.label ?? s.key;
const axisWidth = computed(() => Math.max(...ticks.value.map((t) => props.tickFormat(t).length)) + 1);
const showLegend = computed(() => props.legend ?? props.series.length > 1);
const typeName = computed(() => ({ bar: "bar", line: "line", area: "area" })[props.type]);

// Bars: one group per category, one bar per series.
const bars = computed(() => {
  const k = props.series.length;
  const inner = band.value * (k === 1 ? 0.56 : 0.72);
  const gap = k > 1 ? Math.min(4, inner * 0.08) : 0;
  return { inner, gap, w: (inner - gap * (k - 1)) / k };
});
const plotted = computed(() => props.series.map((s, si) => {
  const pts = props.data.map((row, i) => [i, num(row, s.key)] as const).filter((p): p is readonly [number, number] => p[1] != null);
  const xy = pts.map(([i, v]) => [xc(i), y(v)] as [number, number]);
  const b = bars.value, bw = band.value;
  return {
    s, si, xy,
    bars: pts.map(([i, v]) => ({ i, x: r2(i * bw + (bw - b.inner) / 2 + si * (b.w + b.gap)), y: r2(Math.min(y(v), base.value)), h: r2(Math.abs(y(v) - base.value)) })),
    points: pts.map(([i], j) => ({ i, cx: xy[j][0], cy: xy[j][1] })),
  };
}));
const grid = computed(() => ticks.value.filter((t) => y(t) !== base.value).map((t) => `M0 ${y(t)}H${W}`).join(""));
const area = (xy: [number, number][]) => `${path(xy)}L${xy[xy.length - 1][0]} ${base.value}L${xy[0][0]} ${base.value}Z`;
const on = (i: number) => (active.value === i ? "" : undefined);
const cell = (row: ChartRow, key: string) => { const v = num(row, key); return v == null ? "–" : props.format(v); };
const tipStyle = computed(() => {
  const a = active.value!, count = n.value;
  return a < count / 2 ? { left: `calc(${r2(((a + 1) / count) * 100)}% + 8px)` } : { right: `calc(${r2((1 - a / count) * 100)}% + 8px)` };
});

const move = (to: number) => { active.value = Math.max(0, Math.min(n.value - 1, to)); };
function onKeydown(e: KeyboardEvent) {
  const rtl = getComputedStyle(e.currentTarget as Element).direction === "rtl";
  const at = active.value ?? -1;
  const keys: Record<string, () => void> = {
    ArrowRight: () => move(rtl ? at - 1 : at + 1), ArrowLeft: () => move(rtl ? at + 1 : at - 1),
    ArrowDown: () => move(at + 1), ArrowUp: () => move(at - 1),
    Home: () => move(0), End: () => move(n.value - 1), Escape: () => { active.value = null; },
  };
  if (keys[e.key]) { e.preventDefault(); keys[e.key](); }
}
function onPointermove(e: PointerEvent) {
  const hit = (e.target as Element).closest?.("[data-i]");
  if (hit) active.value = Number(hit.getAttribute("data-i"));
}
</script>

<template>
  <div :class="['vin-chart', `vin-chart--${type}`]" :style="{ '--vin-chart-axis': `${axisWidth}ch` }">
    <div v-if="showLegend" class="vin-chart__legend" aria-hidden="true">
      <span v-for="(s, si) in series" :key="s.key" class="vin-chart__key">
        <span class="vin-chart__swatch" :style="{ '--vin-series': color(s, si) }" />
        {{ name(s) }}
      </span>
    </div>
    <div class="vin-chart__body">
      <div class="vin-chart__y" aria-hidden="true">
        <span v-for="t in ticks" :key="t" class="vin-chart__tick" :style="{ top: `${r2((y(t) / H) * 100)}%` }">{{ tickFormat(t) }}</span>
      </div>
      <div class="vin-chart__plot">
        <svg
          class="vin-chart__svg"
          :viewBox="`0 0 ${W} ${H}`"
          role="img"
          :aria-label="`${label} (${typeName} chart)`"
          tabindex="0"
          :data-active="active != null ? '' : undefined"
          @pointermove="onPointermove"
          @pointerleave="active = null"
          @focus="active = active ?? 0"
          @blur="active = null"
          @keydown="onKeydown"
        >
          <path class="vin-chart__grid" :d="grid" />
          <rect v-for="(_, i) in data" :key="i" class="vin-chart__hit" :data-i="i" :data-active="on(i)" :x="r2(i * band)" y="0" :width="r2(band)" :height="H" />
          <g v-for="p in plotted" :key="p.s.key" class="vin-chart__series" :style="{ '--vin-series': color(p.s, p.si) }">
            <template v-if="type === 'bar'">
              <rect v-for="b in p.bars" :key="b.i" class="vin-chart__bar" :data-i="b.i" :data-active="on(b.i)" :x="b.x" :y="b.y" :width="r2(bars.w)" :height="b.h" />
            </template>
            <path v-if="type === 'area' && p.xy.length > 1" class="vin-chart__area" :d="area(p.xy)" />
            <path v-if="type !== 'bar'" class="vin-chart__line" :d="path(p.xy)" />
            <template v-if="type !== 'bar'">
              <circle v-for="c in p.points" :key="c.i" class="vin-chart__point" :data-i="c.i" :data-active="on(c.i)" :cx="c.cx" :cy="c.cy" r="3.5" />
            </template>
          </g>
          <path class="vin-chart__axis" :d="`M0 ${base}H${W}`" />
        </svg>
        <div v-if="active != null && data[active]" class="vin-chart__tooltip" aria-hidden="true" :style="tipStyle">
          <p class="vin-chart__tooltip-title">{{ String(data[active][index] ?? "") }}</p>
          <div v-for="(s, si) in series" :key="s.key" class="vin-chart__tooltip-row">
            <span class="vin-chart__swatch" :style="{ '--vin-series': color(s, si) }" />
            {{ name(s) }}
            <span class="vin-chart__value">{{ cell(data[active], s.key) }}</span>
          </div>
        </div>
      </div>
      <div class="vin-chart__x" aria-hidden="true">
        <span v-for="(row, i) in data" :key="i" class="vin-chart__tick" :style="{ left: `${r2(((i + 0.5) / data.length) * 100)}%` }">{{ String(row[index] ?? "") }}</span>
      </div>
    </div>
    <table class="vin-chart__table">
      <caption>{{ label }}</caption>
      <thead>
        <tr>
          <th scope="col">{{ indexLabel ?? index }}</th>
          <th v-for="s in series" :key="s.key" scope="col">{{ name(s) }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, i) in data" :key="i">
          <th scope="row">{{ String(row[index] ?? "") }}</th>
          <td v-for="s in series" :key="s.key">{{ cell(row, s.key) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
