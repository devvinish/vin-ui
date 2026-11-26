"use client";

import * as React from "react";

/** Dev-only warnings, without needing Node's `process` (Vite and the browser don't have it). */
const isDev = () => (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV !== "production";

/*
 * VinUI · Chart (React). API: spec/chart.json.
 * <Chart type="bar" label="Visitors by month" data={rows} index="month"
 *        series={[{ key: "desktop", label: "Desktop" }, { key: "mobile", label: "Mobile" }]} />
 * Bar, line, area (stacked or not, straight or smooth), pie and donut. Inline SVG, no dependencies.
 * Colours come from the theme (--vin-chart-1…5, derived from the accent).
 * Screen readers get the label and a visually hidden data table. Hover, or focus and use the arrow
 * keys, to see the values of one category in a tooltip.
 */

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");
const r2 = (n: number) => Math.round(n * 100) / 100;

export type ChartType = "bar" | "line" | "area" | "pie" | "donut";
export type ChartSeries = {
  /** The field in each data row. */
  key: string;
  /** Name shown in the legend, tooltip and table. Default: the key. */
  label?: string;
  /** Any CSS colour. Default: the next theme colour (--vin-chart-1…5). */
  color?: string;
};
export type ChartRow = Record<string, string | number | null | undefined>;

export type ChartProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
  type?: ChartType;
  /** What the chart shows. Names the picture and captions the data table. */
  label: string;
  data: ChartRow[];
  /** The field that names each category (the x axis, or each slice of a pie). */
  index: string;
  /** The fields to draw. Pie and donut draw the first one. */
  series: ChartSeries[];
  /** Bar and area: stack the series on top of each other. */
  stacked?: boolean;
  /** Line and area: "smooth" draws a gentle curve through the points. */
  curve?: "linear" | "smooth";
  /** Donut: the caption under the total in the middle, e.g. "Visitors". Without it the middle stays empty. */
  centerLabel?: string;
  /** Formats values in the tooltip and table. Default: 12,400. */
  format?: (value: number) => string;
  /** Formats the y-axis ticks. Default: compact (12K). */
  tickFormat?: (value: number) => string;
  /** Column heading for the categories in the data table. Default: the index field. */
  indexLabel?: string;
  /** Width / height of the plot. Default 2.4. */
  aspectRatio?: number;
  /** Show the legend. Default: when there's more than one series, and always for pie and donut. */
  legend?: boolean;
};

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

/* ───────── Geometry: the same in the React, Vue and Svelte versions ───────── */

type Pt = [number, number];
const W = 600, PIE = 200;
const num = (row: ChartRow, key: string) => {
  const v = row[key];
  return typeof v === "number" && Number.isFinite(v) ? v : null;
};

/** A path through the points: straight segments, or a monotone curve that never overshoots. */
function trace(pts: Pt[], smooth: boolean, start = "M"): string {
  if (!pts.length) return "";
  let d = `${start}${pts[0][0]} ${pts[0][1]}`;
  if (!smooth || pts.length < 3) return d + pts.slice(1).map(([x, y]) => `L${x} ${y}`).join("");
  const m = pts.slice(1).map(([x, y], i) => (y - pts[i][1]) / (x - pts[i][0]));
  const t = pts.map((_, i) => {
    if (i === 0) return m[0];
    if (i === pts.length - 1) return m[i - 1];
    const a = m[i - 1], b = m[i], h0 = pts[i][0] - pts[i - 1][0], h1 = pts[i + 1][0] - pts[i][0];
    return a * b <= 0 ? 0 : (3 * (h0 + h1)) / ((2 * h1 + h0) / a + (h1 + 2 * h0) / b);
  });
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], h = (x1 - x0) / 3;
    d += `C${r2(x0 + h)} ${r2(y0 + t[i - 1] * h)} ${r2(x1 - h)} ${r2(y1 - t[i] * h)} ${x1} ${y1}`;
  }
  return d;
}

type Options = {
  type: ChartType; data: ChartRow[]; index: string; series: ChartSeries[]; stacked: boolean; smooth: boolean;
  aspectRatio: number; legend?: boolean; format: (v: number) => string; tickFormat: (v: number) => string;
};

/** Everything the template draws, worked out once from the props. */
function layout(o: Options) {
  const { type, data, series } = o;
  const n = data.length;
  const pie = type === "pie" || type === "donut";
  const color = (s: ChartSeries, i: number) => s.color ?? `var(--vin-chart-${(i % 5) + 1})`;
  const name = (s: ChartSeries) => s.label ?? s.key;
  const keys = series.map((s, si) => ({ key: s.key, name: name(s), color: color(s, si) }));
  const stacked = o.stacked && (type === "bar" || type === "area");
  const typeName = `${stacked ? "stacked " : ""}${type} chart`;
  const cell = (row: ChartRow, key: string) => { const v = num(row, key); return v == null ? "–" : o.format(v); };

  if (pie) {
    const s = series[0];
    const key = s?.key ?? "";
    const vals = data.map((row) => Math.max(0, num(row, key) ?? 0));
    const total = vals.reduce((a, b) => a + b, 0);
    const c = PIE / 2, R = 96, ri = type === "donut" ? 60 : 0, pad = type === "donut" && vals.filter(Boolean).length > 1 ? 0.012 : 0;
    const at = (r: number, a: number) => `${r2(c + r * Math.cos(a))} ${r2(c + r * Math.sin(a))}`;
    let a0 = -Math.PI / 2;
    const slices = data.map((row, i) => {
      const sweep = total ? (vals[i] / total) * Math.PI * 2 : 0;
      const s0 = a0 + pad, s1 = a0 + sweep - pad, mid = a0 + sweep / 2;
      a0 += sweep;
      const big = s1 - s0 > Math.PI ? 1 : 0, rc = ri ? (R + ri) / 2 : R * 0.62;
      let d = "";
      if (sweep >= Math.PI * 2 - 1e-6) {
        d = `M${at(R, -Math.PI / 2)}A${R} ${R} 0 1 1 ${at(R, Math.PI / 2)}A${R} ${R} 0 1 1 ${at(R, -Math.PI / 2)}Z`;
        if (ri) d += `M${at(ri, -Math.PI / 2)}A${ri} ${ri} 0 1 0 ${at(ri, Math.PI / 2)}A${ri} ${ri} 0 1 0 ${at(ri, -Math.PI / 2)}Z`;
      } else if (sweep > 2 * pad) {
        d = ri
          ? `M${at(R, s0)}A${R} ${R} 0 ${big} 1 ${at(R, s1)}L${at(ri, s1)}A${ri} ${ri} 0 ${big} 0 ${at(ri, s0)}Z`
          : `M${c} ${c}L${at(R, s0)}A${R} ${R} 0 ${big} 1 ${at(R, s1)}Z`;
      }
      return {
        i, d, name: String(row[o.index] ?? ""), color: `var(--vin-chart-${(i % 5) + 1})`,
        x: r2(((c + rc * Math.cos(mid)) / PIE) * 100), y: r2(((c + rc * Math.sin(mid)) / PIE) * 100),
      };
    });
    return {
      pie, n, typeName, cell, keys, viewBox: `0 0 ${PIE} ${PIE}`, slices, total: o.format(total),
      legend: o.legend ?? true, legendItems: slices.map((sl) => ({ key: String(sl.i), name: sl.name, color: sl.color })),
      H: PIE, ticks: [] as { v: number; label: string; top: number }[], grid: "", axis: "", hits: [] as { i: number; x: number; w: number }[],
      drawn: [] as { key: string; color: string; bars: { i: number; x: number; y: number; w: number; h: number }[]; area: string; line: string; points: { i: number; cx: number; cy: number }[] }[],
      axisWidth: 0, xLabels: [] as { i: number; label: string; left: number }[],
      tip: (i: number) => ({ "--vin-tip-x": `${slices[i]?.x ?? 50}%`, "--vin-tip-y": `${slices[i]?.y ?? 50}%` }) as Record<string, string>,
      tipRows: (i: number) => [{ key, name: s ? name(s) : key, color: slices[i]?.color ?? "", value: cell(data[i], key) }],
    };
  }

  // Low and high end of every value: from zero, or from the series below it when stacked.
  const ends = series.map(() => data.map(() => null as null | [number, number]));
  data.forEach((row, i) => {
    let up = 0, down = 0;
    series.forEach((s, si) => {
      const v = num(row, s.key);
      if (!stacked) { if (v != null) ends[si][i] = [0, v]; return; }
      const val = v ?? 0;
      if (val >= 0) { ends[si][i] = [up, up + val]; up += val; } else { ends[si][i] = [down, down + val]; down += val; }
      if (v == null && type === "bar") ends[si][i] = null;
    });
  });
  const values = ends.flat().filter((e): e is [number, number] => e != null).flat();
  const ticks = niceTicks(values.length ? values : [0, 1]);
  const lo = ticks[0], hi = ticks[ticks.length - 1];
  const H = r2(W / o.aspectRatio);
  const y = (v: number) => r2(H - ((v - lo) / (hi - lo)) * H);
  const band = W / Math.max(n, 1);
  const xc = (i: number) => r2((i + 0.5) * band);
  const base = y(Math.min(Math.max(0, lo), hi));

  // Bars: side by side, or one stacked bar per category.
  const k = stacked ? 1 : series.length;
  const inner = band * (k === 1 ? 0.56 : 0.72);
  const gap = k > 1 ? Math.min(4, inner * 0.08) : 0;
  const barW = (inner - gap * (k - 1)) / k;

  const drawn = series.map((s, si) => {
    const pts = data.map((_, i) => [i, ends[si][i]] as const).filter((p): p is readonly [number, [number, number]] => p[1] != null);
    const top = pts.map(([i, e]) => [xc(i), y(e[1])] as Pt);
    const bottom = pts.map(([i, e]) => [xc(i), y(e[0])] as Pt);
    const area = type !== "area" || top.length < 2 ? ""
      : stacked ? `${trace(top, o.smooth)}${trace([...bottom].reverse(), o.smooth, "L")}Z`
      : `${trace(top, o.smooth)}L${top[top.length - 1][0]} ${base}L${top[0][0]} ${base}Z`;
    return {
      key: s.key, color: color(s, si), area,
      line: type === "bar" ? "" : trace(top, o.smooth),
      bars: type !== "bar" ? [] : pts.map(([i, e]) => {
        const a = y(e[0]), b = y(e[1]);
        return { i, x: r2(i * band + (band - inner) / 2 + (stacked ? 0 : si * (barW + gap))), y: r2(Math.min(a, b)), w: r2(barW), h: r2(Math.abs(b - a)) };
      }),
      points: type === "bar" ? [] : pts.map(([i], j) => ({ i, cx: top[j][0], cy: top[j][1] })),
    };
  });

  return {
    pie, n, typeName, cell, keys, viewBox: `0 0 ${W} ${H}`, slices: [] as { i: number; d: string; name: string; color: string; x: number; y: number }[], total: "",
    legend: o.legend ?? series.length > 1, legendItems: keys,
    H, ticks: ticks.map((v) => ({ v, label: o.tickFormat(v), top: r2((y(v) / H) * 100) })),
    grid: ticks.filter((t) => y(t) !== base).map((t) => `M0 ${y(t)}H${W}`).join(""),
    axis: `M0 ${base}H${W}`,
    hits: data.map((_, i) => ({ i, x: r2(i * band), w: r2(band) })),
    drawn, axisWidth: Math.max(...ticks.map((t) => o.tickFormat(t).length)) + 1,
    xLabels: data.map((row, i) => ({ i, label: String(row[o.index] ?? ""), left: r2(((i + 0.5) / Math.max(n, 1)) * 100) })),
    tip: (i: number): Record<string, string> => (i < n / 2 ? { left: `calc(${r2(((i + 1) / n) * 100)}% + 8px)` } : { right: `calc(${r2((1 - i / n) * 100)}% + 8px)` }),
    tipRows: (i: number) => keys.map((kk) => ({ ...kk, value: cell(data[i], kk.key) })),
  };
}

/* ───────── Component ───────── */

export function Chart({
  type = "bar", label, data, index, series, stacked = false, curve = "linear", centerLabel,
  format = defaultFormat, tickFormat = defaultTick, indexLabel, aspectRatio = 2.4, legend, className, style, ...rest
}: ChartProps) {
  const [active, setActive] = React.useState<number | null>(null);
  if (isDev() && !label) console.warn("VinUI Chart: pass a label that says what the chart shows.");

  const m = layout({ type, data, index, series, stacked, smooth: curve === "smooth", aspectRatio, legend, format, tickFormat });
  const n = m.n;
  const tableSeries = m.pie ? series.slice(0, 1) : series;

  const move = (to: number) => setActive(Math.max(0, Math.min(n - 1, to)));
  const onKeyDown = (e: React.KeyboardEvent) => {
    const rtl = !m.pie && getComputedStyle(e.currentTarget).direction === "rtl";
    const at = active ?? -1;
    const keys: Record<string, () => void> = {
      ArrowRight: () => move(rtl ? at - 1 : at + 1), ArrowLeft: () => move(rtl ? at + 1 : at - 1),
      ArrowDown: () => move(at + 1), ArrowUp: () => move(at - 1),
      Home: () => move(0), End: () => move(n - 1), Escape: () => setActive(null),
    };
    if (keys[e.key]) { e.preventDefault(); keys[e.key](); }
  };
  const onPointer = (e: React.PointerEvent) => {
    const hit = (e.target as Element).closest?.("[data-i]");
    if (hit) setActive(Number(hit.getAttribute("data-i")));
  };
  const on = (i: number) => (active === i ? "" : undefined);
  const sv = (color: string) => ({ ["--vin-series" as string]: color });

  return (
    <div
      {...rest}
      className={cx("vin-chart", `vin-chart--${type}`, className)}
      style={m.pie ? style : { ["--vin-chart-axis" as string]: `${m.axisWidth}ch`, ...style }}
    >
      {m.legend && (
        <div className="vin-chart__legend" aria-hidden="true">
          {m.legendItems.map((s) => (
            <span key={s.key} className="vin-chart__key"><span className="vin-chart__swatch" style={sv(s.color)} />{s.name}</span>
          ))}
        </div>
      )}
      <div className="vin-chart__body">
        {!m.pie && (
          <div className="vin-chart__y" aria-hidden="true">
            {m.ticks.map((t) => <span key={t.v} className="vin-chart__tick" style={{ top: `${t.top}%` }}>{t.label}</span>)}
          </div>
        )}
        <div className="vin-chart__plot">
          <svg
            className="vin-chart__svg"
            viewBox={m.viewBox}
            role="img"
            aria-label={`${label} (${m.typeName})`}
            tabIndex={0}
            data-active={active != null ? "" : undefined}
            onPointerMove={onPointer}
            onPointerLeave={() => setActive(null)}
            onFocus={() => setActive((a) => a ?? 0)}
            onBlur={() => setActive(null)}
            onKeyDown={onKeyDown}
          >
            {m.pie ? (
              m.slices.map((sl) => sl.d && <path key={sl.i} className="vin-chart__slice" data-i={sl.i} data-active={on(sl.i)} d={sl.d} style={sv(sl.color)} />)
            ) : (
              <>
                <path className="vin-chart__grid" d={m.grid} />
                {m.hits.map((h) => <rect key={h.i} className="vin-chart__hit" data-i={h.i} data-active={on(h.i)} x={h.x} y={0} width={h.w} height={m.H} />)}
                {m.drawn.map((s) => (
                  <g key={s.key} className="vin-chart__series" style={sv(s.color)}>
                    {s.bars.map((b) => <rect key={b.i} className="vin-chart__bar" data-i={b.i} data-active={on(b.i)} x={b.x} y={b.y} width={b.w} height={b.h} />)}
                    {s.area && <path className="vin-chart__area" d={s.area} />}
                    {s.line && <path className="vin-chart__line" d={s.line} />}
                    {s.points.map((p) => <circle key={p.i} className="vin-chart__point" data-i={p.i} data-active={on(p.i)} cx={p.cx} cy={p.cy} r={3.5} />)}
                  </g>
                ))}
                <path className="vin-chart__axis" d={m.axis} />
              </>
            )}
          </svg>
          {type === "donut" && centerLabel && (
            <div className="vin-chart__center" aria-hidden="true">
              <span className="vin-chart__center-value">{m.total}</span>
              <span className="vin-chart__center-label">{centerLabel}</span>
            </div>
          )}
          {active != null && data[active] && (
            <div className="vin-chart__tooltip" aria-hidden="true" style={m.tip(active)}>
              <p className="vin-chart__tooltip-title">{String(data[active][index] ?? "")}</p>
              {m.tipRows(active).map((r) => (
                <div key={r.key} className="vin-chart__tooltip-row">
                  <span className="vin-chart__swatch" style={sv(r.color)} />
                  {r.name}
                  <span className="vin-chart__value">{r.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {!m.pie && (
          <div className="vin-chart__x" aria-hidden="true">
            {m.xLabels.map((x) => <span key={x.i} className="vin-chart__tick" style={{ left: `${x.left}%` }}>{x.label}</span>)}
          </div>
        )}
      </div>
      <table className="vin-chart__table">
        <caption>{label}</caption>
        <thead>
          <tr>
            <th scope="col">{indexLabel ?? index}</th>
            {tableSeries.map((s) => <th key={s.key} scope="col">{s.label ?? s.key}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              <th scope="row">{String(row[index] ?? "")}</th>
              {tableSeries.map((s) => <td key={s.key}>{m.cell(row, s.key)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
