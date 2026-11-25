"use client";

import * as React from "react";

/*
 * VinUI · Slider (React). API: spec/slider.json.
 * Pass a number for one value (a native range input), or [from, to] for a range:
 * two role="slider" thumbs (WAI-ARIA multi-thumb slider) on one track.
 */

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

type Val = number | [number, number];
export type SliderProps<V extends Val = Val> = Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "onChange" | "type" | "min" | "max" | "step" | "name"> & {
  value?: V;
  defaultValue?: V;
  onValueChange?: (value: V) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Visible label. Without it, pass an aria-label (for a range: thumbLabels). */
  label?: React.ReactNode;
  /** Show the current value next to the label. */
  showValue?: boolean;
  /** Format the shown value (and the range thumbs' aria-valuetext), e.g. (v) => `₹${v}`. */
  formatValue?: (v: number) => string;
  /** Range only: names for the two thumbs. Default: "Minimum", "Maximum". */
  thumbLabels?: [string, string];
  /** Form field name. A range submits name-min and name-max. */
  name?: string;
};

export function Slider<V extends Val>({
  value, defaultValue, onValueChange, min = 0, max = 100, step = 1, label, showValue = false,
  formatValue = String, thumbLabels = ["Minimum", "Maximum"], name, id, className, style, disabled, ...rest
}: SliderProps<V>) {
  const auto = React.useId();
  const base = id ?? `vin-${auto.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const [inner, setInner] = React.useState<Val>(defaultValue ?? min);
  const current = (value ?? inner) as Val;
  const set = (v: Val) => { if (value === undefined) setInner(v); onValueChange?.(v as V); };
  const frac = (v: number) => (v - min) / (max - min);
  const labelId = `${base}-label`;
  const range = Array.isArray(current);

  let control: React.ReactNode;
  let shown: string;
  if (range) {
    shown = `${formatValue(current[0])} – ${formatValue(current[1])}`;
    control = (
      <RangeTrack
        base={base} values={current} min={min} max={max} step={step} disabled={disabled} name={name}
        labels={thumbLabels} format={formatValue} onChange={set}
        className={cx("vin-range", !label && className)}
        style={{ ...(label ? {} : style), ["--vin-from" as string]: String(frac(current[0])), ["--vin-to" as string]: String(frac(current[1])) }}
      />
    );
  } else {
    shown = formatValue(current);
    control = (
      <input
        {...rest}
        type="range"
        id={base}
        name={name}
        className={cx("vin-slider", !label && className)}
        style={{ ...(label ? {} : style), ["--vin-fill" as string]: `${frac(current) * 100}%` }}
        min={min} max={max} step={step} disabled={disabled}
        value={current}
        onChange={(e) => set(+e.target.value)}
      />
    );
  }
  if (!label) return control;
  return (
    <div className={cx("vin-field", className)} style={style} role={range ? "group" : undefined} aria-labelledby={range ? labelId : undefined}>
      <div className="vin-slider__head">
        {range ? <span className="vin-label" id={labelId}>{label}</span> : <label className="vin-label" id={labelId} htmlFor={base}>{label}</label>}
        {showValue && <output className="vin-slider__value" htmlFor={range ? `${base}-from ${base}-to` : base}>{shown}</output>}
      </div>
      {control}
    </div>
  );
}

type TrackProps = {
  base: string; values: [number, number]; min: number; max: number; step: number; disabled?: boolean; name?: string;
  labels: [string, string]; format: (v: number) => string; onChange: (v: [number, number]) => void;
  className: string; style: React.CSSProperties;
};

function RangeTrack({ base, values, min, max, step, disabled, name, labels, format, onChange, className, style }: TrackProps) {
  const track = React.useRef<HTMLDivElement>(null);
  const latest = React.useRef(values);
  latest.current = values;
  const rtl = () => !!track.current && getComputedStyle(track.current).direction === "rtl";

  const setThumb = (i: 0 | 1, raw: number) => {
    const [a, b] = latest.current;
    let v = Math.round((raw - min) / step) * step + min;
    v = Math.min(i === 0 ? b : max, Math.max(i === 0 ? min : a, v));
    if (v === latest.current[i]) return;
    const next: [number, number] = i === 0 ? [v, b] : [a, v];
    latest.current = next;
    onChange(next);
  };
  const valueAt = (x: number) => {
    const el = track.current!;
    const r = el.getBoundingClientRect();
    const size = (el.querySelector(".vin-range__thumb") as HTMLElement).offsetWidth;
    let f = (x - r.left - size / 2) / (r.width - size);
    if (rtl()) f = 1 - f;
    return min + Math.min(1, Math.max(0, f)) * (max - min);
  };
  const onKeyDown = (i: 0 | 1) => (e: React.KeyboardEvent) => {
    const dir = rtl() ? -1 : 1;
    const big = Math.max(step, (max - min) / 10);
    const d = ({ ArrowRight: step * dir, ArrowLeft: -step * dir, ArrowUp: step, ArrowDown: -step, PageUp: big, PageDown: -big } as Record<string, number>)[e.key];
    const v = latest.current[i];
    if (d !== undefined) { e.preventDefault(); setThumb(i, v + d); }
    else if (e.key === "Home") { e.preventDefault(); setThumb(i, min); }
    else if (e.key === "End") { e.preventDefault(); setThumb(i, max); }
  };
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    const el = e.currentTarget;
    const thumbs = [...el.querySelectorAll<HTMLElement>(".vin-range__thumb")];
    const hit = thumbs.indexOf(e.target as HTMLElement);
    const v = valueAt(e.clientX);
    const [a, b] = latest.current;
    const i = (hit >= 0 ? hit : a === b ? (v < a ? 0 : 1) : Math.abs(v - a) <= Math.abs(v - b) ? 0 : 1) as 0 | 1;
    e.preventDefault();
    thumbs[i].focus();
    if (hit < 0) setThumb(i, v);
    el.setPointerCapture(e.pointerId);
    const move = (ev: PointerEvent) => setThumb(i, valueAt(ev.clientX));
    const up = () => { el.removeEventListener("pointermove", move); el.removeEventListener("pointerup", up); el.removeEventListener("pointercancel", up); };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
  };

  const [a, b] = values;
  return (
    <div ref={track} className={className} style={style} aria-disabled={disabled || undefined} onPointerDown={onPointerDown}>
      {([0, 1] as const).map((i) => (
        <span
          key={i}
          id={`${base}-${i === 0 ? "from" : "to"}`}
          className="vin-range__thumb"
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-label={labels[i]}
          aria-valuemin={i === 0 ? min : a}
          aria-valuemax={i === 0 ? b : max}
          aria-valuenow={values[i]}
          aria-valuetext={format(values[i])}
          aria-disabled={disabled || undefined}
          onKeyDown={onKeyDown(i)}
        />
      ))}
      {name && <input type="hidden" name={`${name}-min`} value={a} />}
      {name && <input type="hidden" name={`${name}-max`} value={b} />}
    </div>
  );
}
