"use client";

import * as React from "react";

/** Dev-only warnings, without needing Node's `process` (Vite and the browser don't have it). */
const isDev = () => (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV !== "production";

/*
 * VinUI · Chart (React). API: spec/chart.json.
 * <Chart type="bar" label="Visitors by month" data={rows} index="month"
 *        series={[{ key: "desktop", label: "Desktop" }, { key: "mobile", label: "Mobile" }]} />
 * Inline SVG, no dependencies. Colours come from the theme (--vin-chart-1…5, derived from the accent).
 * Screen readers get the label and a visually hidden data table. Hover, or focus and use the arrow
 * keys, to see the values of one category in a tooltip.
 */

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");
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

export type ChartProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
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
};

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

export function Chart({
  type = "bar", label, data, index, series, format = defaultFormat, tickFormat = defaultTick, indexLabel,
  aspectRatio = 2.4, legend, className, style, ...rest
}: ChartProps) {
  const [active, setActive] = React.useState<number | null>(null);
  if (isDev() && !label) console.warn("VinUI Chart: pass a label that says what the chart shows.");

  const n = data.length;
  const H = r2(W / aspectRatio);
  const num = (row: ChartRow, key: string) => {
    const v = row[key];
    return typeof v === "number" && Number.isFinite(v) ? v : null;
  };
  const values = data.flatMap((row) => series.map((s) => num(row, s.key)).filter((v): v is number => v != null));
  const ticks = niceTicks(values.length ? values : [0, 1]);
  const lo = ticks[0], hi = ticks[ticks.length - 1];
  const y = (v: number) => r2(H - ((v - lo) / (hi - lo)) * H);
  const band = W / Math.max(n, 1);
  const xc = (i: number) => r2((i + 0.5) * band);
  const base = y(Math.min(Math.max(0, lo), hi));
  const color = (s: ChartSeries, i: number) => s.color ?? `var(--vin-chart-${(i % 5) + 1})`;
  const name = (s: ChartSeries) => s.label ?? s.key;
  const axisWidth = Math.max(...ticks.map((t) => tickFormat(t).length)) + 1;
  const showLegend = legend ?? series.length > 1;
  const typeName = { bar: "Bar", line: "Line", area: "Area" }[type];

  // Bars: one group per category, one bar per series.
  const k = series.length;
  const inner = band * (k === 1 ? 0.56 : 0.72);
  const gap = k > 1 ? Math.min(4, inner * 0.08) : 0;
  const barW = (inner - gap * (k - 1)) / k;

  const move = (to: number) => setActive(Math.max(0, Math.min(n - 1, to)));
  const onKeyDown = (e: React.KeyboardEvent) => {
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
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

  const line = (pts: [number, number][]) => pts.map(([px, py], i) => `${i ? "L" : "M"}${px} ${py}`).join("");

  return (
    <div
      {...rest}
      className={cx("vin-chart", `vin-chart--${type}`, className)}
      style={{ ["--vin-chart-axis" as string]: `${axisWidth}ch`, ...style }}
    >
      {showLegend && (
        <div className="vin-chart__legend" aria-hidden="true">
          {series.map((s, si) => (
            <span key={s.key} className="vin-chart__key">
              <span className="vin-chart__swatch" style={{ ["--vin-series" as string]: color(s, si) }} />
              {name(s)}
            </span>
          ))}
        </div>
      )}
      <div className="vin-chart__body">
        <div className="vin-chart__y" aria-hidden="true">
          {ticks.map((t) => (
            <span key={t} className="vin-chart__tick" style={{ top: `${r2((y(t) / H) * 100)}%` }}>{tickFormat(t)}</span>
          ))}
        </div>
        <div className="vin-chart__plot">
          <svg
            className="vin-chart__svg"
            viewBox={`0 0 ${W} ${H}`}
            role="img"
            aria-label={`${label} (${typeName.toLowerCase()} chart)`}
            tabIndex={0}
            data-active={active != null ? "" : undefined}
            onPointerMove={onPointer}
            onPointerLeave={() => setActive(null)}
            onFocus={() => setActive((a) => a ?? 0)}
            onBlur={() => setActive(null)}
            onKeyDown={onKeyDown}
          >
            <path className="vin-chart__grid" d={ticks.filter((t) => y(t) !== base).map((t) => `M0 ${y(t)}H${W}`).join("")} />
            {data.map((_, i) => (
              <rect key={i} className="vin-chart__hit" data-i={i} data-active={on(i)} x={r2(i * band)} y={0} width={r2(band)} height={H} />
            ))}
            {series.map((s, si) => {
              const pts = data.map((row, i) => [i, num(row, s.key)] as const).filter((p): p is readonly [number, number] => p[1] != null);
              const xy = pts.map(([i, v]) => [xc(i), y(v)] as [number, number]);
              return (
                <g key={s.key} className="vin-chart__series" style={{ ["--vin-series" as string]: color(s, si) }}>
                  {type === "bar" && pts.map(([i, v]) => {
                    const top = Math.min(y(v), base), h = Math.abs(y(v) - base);
                    return <rect key={i} className="vin-chart__bar" data-i={i} data-active={on(i)} x={r2(i * band + (band - inner) / 2 + si * (barW + gap))} y={r2(top)} width={r2(barW)} height={r2(h)} />;
                  })}
                  {type === "area" && xy.length > 1 && (
                    <path className="vin-chart__area" d={`${line(xy)}L${xy[xy.length - 1][0]} ${base}L${xy[0][0]} ${base}Z`} />
                  )}
                  {type !== "bar" && <path className="vin-chart__line" d={line(xy)} />}
                  {type !== "bar" && pts.map(([i], j) => (
                    <circle key={i} className="vin-chart__point" data-i={i} data-active={on(i)} cx={xy[j][0]} cy={xy[j][1]} r={3.5} />
                  ))}
                </g>
              );
            })}
            <path className="vin-chart__axis" d={`M0 ${base}H${W}`} />
          </svg>
          {active != null && data[active] && (
            <div
              className="vin-chart__tooltip"
              aria-hidden="true"
              style={active < n / 2 ? { left: `calc(${r2(((active + 1) / n) * 100)}% + 8px)` } : { right: `calc(${r2((1 - active / n) * 100)}% + 8px)` }}
            >
              <p className="vin-chart__tooltip-title">{String(data[active][index] ?? "")}</p>
              {series.map((s, si) => {
                const v = num(data[active], s.key);
                return (
                  <div key={s.key} className="vin-chart__tooltip-row">
                    <span className="vin-chart__swatch" style={{ ["--vin-series" as string]: color(s, si) }} />
                    {name(s)}
                    <span className="vin-chart__value">{v == null ? "–" : format(v)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="vin-chart__x" aria-hidden="true">
          {data.map((row, i) => (
            <span key={i} className="vin-chart__tick" style={{ left: `${r2(((i + 0.5) / n) * 100)}%` }}>{String(row[index] ?? "")}</span>
          ))}
        </div>
      </div>
      <table className="vin-chart__table">
        <caption>{label}</caption>
        <thead>
          <tr>
            <th scope="col">{indexLabel ?? index}</th>
            {series.map((s) => <th key={s.key} scope="col">{name(s)}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              <th scope="row">{String(row[index] ?? "")}</th>
              {series.map((s) => {
                const v = num(row, s.key);
                return <td key={s.key}>{v == null ? "–" : format(v)}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
