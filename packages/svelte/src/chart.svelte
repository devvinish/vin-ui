<!--
  VinUI · Chart (Svelte). API: spec/chart.json.
    <Chart type="bar" label="Visitors by month" data={rows} index="month"
           series={[{ key: "desktop", label: "Desktop" }, { key: "mobile", label: "Mobile" }]} />
  Inline SVG, no dependencies. Colours come from the theme (--vin-chart-1…5, derived from the accent).
  Screen readers get the label and a visually hidden data table. Hover, or focus and use the arrow
  keys, to see the values of one category in a tooltip.
-->
<script lang="ts" module>
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

  const r2 = (n: number) => Math.round(n * 100) / 100;
  const W = 600;
  const defaultFormat = (v: number) => v.toLocaleString("en-US");
  const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });
  const defaultTick = (v: number) => compact.format(v);

  /** Round numbers for the y axis: about four steps of 1, 2, 2.5 or 5 × 10ⁿ, always including zero. */
  export function niceTicks(values: number[], count = 4): number[] {
    let lo = Math.min(0, ...values),
      hi = Math.max(0, ...values);
    if (hi === lo) hi = lo + 1;
    const raw = (hi - lo) / count,
      p = 10 ** Math.floor(Math.log10(raw)),
      f = raw / p;
    const step = (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p;
    lo = Math.floor(lo / step + 1e-9) * step;
    hi = Math.ceil(hi / step - 1e-9) * step;
    const out: number[] = [];
    for (let v = lo; v <= hi + step / 2; v += step) out.push(r2(v) === 0 ? 0 : Number(v.toPrecision(12)));
    return out;
  }
</script>

<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  type Props = Omit<HTMLAttributes<HTMLDivElement>, "class" | "children" | "style"> & {
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
    class?: string;
    style?: string;
  };
  let {
    type = "bar",
    label,
    data,
    index,
    series,
    format = defaultFormat,
    tickFormat = defaultTick,
    indexLabel,
    aspectRatio = 2.4,
    legend,
    class: className,
    style,
    ...rest
  }: Props = $props();

  let active = $state<number | null>(null);

  const isDev = () => (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV !== "production";
  const warnIfUnnamed = () => {
    if (isDev() && !label) console.warn("VinUI Chart: pass a label that says what the chart shows.");
  };
  warnIfUnnamed();

  const num = (row: ChartRow, key: string) => {
    const v = row[key];
    return typeof v === "number" && Number.isFinite(v) ? v : null;
  };
  const n = $derived(data.length);
  const H = $derived(r2(W / aspectRatio));
  const values = $derived(data.flatMap((row) => series.map((s) => num(row, s.key)).filter((v): v is number => v != null)));
  const ticks = $derived(niceTicks(values.length ? values : [0, 1]));
  const lo = $derived(ticks[0]);
  const hi = $derived(ticks[ticks.length - 1]);
  const y = (v: number) => r2(H - ((v - lo) / (hi - lo)) * H);
  const band = $derived(W / Math.max(n, 1));
  const xc = (i: number) => r2((i + 0.5) * band);
  const base = $derived(y(Math.min(Math.max(0, lo), hi)));
  const color = (s: ChartSeries, i: number) => s.color ?? `var(--vin-chart-${(i % 5) + 1})`;
  const name = (s: ChartSeries) => s.label ?? s.key;
  const axisWidth = $derived(Math.max(...ticks.map((t) => tickFormat(t).length)) + 1);
  const showLegend = $derived(legend ?? series.length > 1);
  const typeName = $derived({ bar: "Bar", line: "Line", area: "Area" }[type]);

  // Bars: one group per category, one bar per series.
  const k = $derived(series.length);
  const inner = $derived(band * (k === 1 ? 0.56 : 0.72));
  const gap = $derived(k > 1 ? Math.min(4, inner * 0.08) : 0);
  const barW = $derived((inner - gap * (k - 1)) / k);

  const plotted = $derived(
    series.map((s, si) => {
      const pts = data.map((row, i) => [i, num(row, s.key)] as const).filter((p): p is readonly [number, number] => p[1] != null);
      const xy = pts.map(([i, v]) => [xc(i), y(v)] as [number, number]);
      return { s, si, pts, xy };
    }),
  );

  const move = (to: number) => (active = Math.max(0, Math.min(n - 1, to)));
  function onkeydown(e: KeyboardEvent & { currentTarget: EventTarget & SVGSVGElement }) {
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    const at = active ?? -1;
    const keys: Record<string, () => void> = {
      ArrowRight: () => move(rtl ? at - 1 : at + 1),
      ArrowLeft: () => move(rtl ? at + 1 : at - 1),
      ArrowDown: () => move(at + 1),
      ArrowUp: () => move(at - 1),
      Home: () => move(0),
      End: () => move(n - 1),
      Escape: () => (active = null),
    };
    if (keys[e.key]) {
      e.preventDefault();
      keys[e.key]();
    }
  }
  function onpointermove(e: PointerEvent) {
    const hit = (e.target as Element).closest?.("[data-i]");
    if (hit) active = Number(hit.getAttribute("data-i"));
  }
  const on = (i: number) => (active === i ? "" : undefined);
  const line = (pts: [number, number][]) => pts.map(([px, py], i) => `${i ? "L" : "M"}${px} ${py}`).join("");
  const cellText = (row: ChartRow, key: string) => {
    const v = num(row, key);
    return v == null ? "–" : format(v);
  };
</script>

<div {...rest} class={["vin-chart", `vin-chart--${type}`, className].filter(Boolean).join(" ")} style={`--vin-chart-axis: ${axisWidth}ch${style ? `; ${style}` : ""}`}>
  {#if showLegend}
    <div class="vin-chart__legend" aria-hidden="true">
      {#each series as s, si (s.key)}
        <span class="vin-chart__key"><span class="vin-chart__swatch" style={`--vin-series: ${color(s, si)}`}></span>{name(s)}</span>
      {/each}
    </div>
  {/if}
  <div class="vin-chart__body">
    <div class="vin-chart__y" aria-hidden="true">
      {#each ticks as t (t)}
        <span class="vin-chart__tick" style={`top: ${r2((y(t) / H) * 100)}%`}>{tickFormat(t)}</span>
      {/each}
    </div>
    <div class="vin-chart__plot">
      <!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions (focus the chart, then the arrow keys show each category's values) -->
      <svg
        class="vin-chart__svg"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`${label} (${typeName.toLowerCase()} chart)`}
        tabindex="0"
        data-active={active != null ? "" : undefined}
        {onpointermove}
        onpointerleave={() => (active = null)}
        onfocus={() => (active = active ?? 0)}
        onblur={() => (active = null)}
        {onkeydown}
      >
        <path
          class="vin-chart__grid"
          d={ticks
            .filter((t) => y(t) !== base)
            .map((t) => `M0 ${y(t)}H${W}`)
            .join("")}
        />
        {#each data as _, i (i)}
          <rect class="vin-chart__hit" data-i={i} data-active={on(i)} x={r2(i * band)} y={0} width={r2(band)} height={H} />
        {/each}
        {#each plotted as { s, si, pts, xy } (s.key)}
          <g class="vin-chart__series" style={`--vin-series: ${color(s, si)}`}>
            {#if type === "bar"}
              {#each pts as [i, v] (i)}
                <rect
                  class="vin-chart__bar"
                  data-i={i}
                  data-active={on(i)}
                  x={r2(i * band + (band - inner) / 2 + si * (barW + gap))}
                  y={r2(Math.min(y(v), base))}
                  width={r2(barW)}
                  height={r2(Math.abs(y(v) - base))}
                />
              {/each}
            {/if}
            {#if type === "area" && xy.length > 1}
              <path class="vin-chart__area" d={`${line(xy)}L${xy[xy.length - 1][0]} ${base}L${xy[0][0]} ${base}Z`} />
            {/if}
            {#if type !== "bar"}
              <path class="vin-chart__line" d={line(xy)} />
              {#each pts as [i], j (i)}
                <circle class="vin-chart__point" data-i={i} data-active={on(i)} cx={xy[j][0]} cy={xy[j][1]} r={3.5} />
              {/each}
            {/if}
          </g>
        {/each}
        <path class="vin-chart__axis" d={`M0 ${base}H${W}`} />
      </svg>
      {#if active != null && data[active]}
        {@const row = data[active]}
        <div
          class="vin-chart__tooltip"
          aria-hidden="true"
          style={active < n / 2 ? `left: calc(${r2(((active + 1) / n) * 100)}% + 8px)` : `right: calc(${r2((1 - active / n) * 100)}% + 8px)`}
        >
          <p class="vin-chart__tooltip-title">{String(row[index] ?? "")}</p>
          {#each series as s, si (s.key)}
            <div class="vin-chart__tooltip-row">
              <span class="vin-chart__swatch" style={`--vin-series: ${color(s, si)}`}></span>{name(s)}<span class="vin-chart__value">{cellText(row, s.key)}</span>
            </div>
          {/each}
        </div>
      {/if}
    </div>
    <div class="vin-chart__x" aria-hidden="true">
      {#each data as row, i (i)}
        <span class="vin-chart__tick" style={`left: ${r2(((i + 0.5) / n) * 100)}%`}>{String(row[index] ?? "")}</span>
      {/each}
    </div>
  </div>
  <table class="vin-chart__table">
    <caption>{label}</caption>
    <thead>
      <tr>
        <th scope="col">{indexLabel ?? index}</th>
        {#each series as s (s.key)}<th scope="col">{name(s)}</th>{/each}
      </tr>
    </thead>
    <tbody>
      {#each data as row, i (i)}
        <tr>
          <th scope="row">{String(row[index] ?? "")}</th>
          {#each series as s (s.key)}<td>{cellText(row, s.key)}</td>{/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>
