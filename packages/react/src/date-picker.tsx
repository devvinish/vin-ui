"use client";

import * as React from "react";
import { Calendar, type DateRange } from "./calendar";

/** The popover attribute. A plain attribute so React 18 passes it through too (React 19 knows the prop). */
const popover = (mode: "auto" | "manual") => ({ popover: mode }) as unknown as React.HTMLAttributes<HTMLElement>;

/** The button's popovertarget: React 19 calls the prop popoverTarget, React 18 only passes the plain attribute. */
const popoverTarget = (id: string) => (React.version.startsWith("18") ? { popovertarget: id } : { popoverTarget: id }) as unknown as React.ButtonHTMLAttributes<HTMLButtonElement>;

/** Dev-only warnings, without needing Node's `process` (Vite and the browser don't have it). */
const isDev = () => (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV !== "production";

/*
 * VinUI · Date Picker (React). API: spec/date-picker.json.
 * A button showing the date; it opens a Calendar in the browser's popover (Esc and a click outside close it).
 * Dates are "YYYY-MM-DD" strings; a range is { from, to }.
 */

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");
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

type Common = {
  /** Visible label. Without it, pass an aria-label. */
  label?: React.ReactNode;
  "aria-label"?: string;
  placeholder?: string;
  hint?: React.ReactNode;
  /** Error message. Also marks the field invalid. */
  error?: React.ReactNode;
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
  className?: string;
  style?: React.CSSProperties;
};
export type DatePickerProps = Common & (
  | { mode?: "single"; value?: string | null; defaultValue?: string | null; onValueChange?: (value: string) => void }
  | { mode: "range"; value?: DateRange | null; defaultValue?: DateRange | null; onValueChange?: (value: DateRange) => void }
);

export function DatePicker(props: DatePickerProps) {
  const {
    mode = "single", label, placeholder = "Pick a date", hint, error, size = "md", disabled, name,
    min, max, isDateDisabled, weekStartsOn, locale = "en-US", id, className, style,
  } = props;
  const auto = React.useId();
  const base = id ?? `vin-${auto.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const ids = { label: `${base}-label`, pop: `${base}-pop`, hint: `${base}-hint`, error: `${base}-error` };
  const [inner, setInner] = React.useState(props.defaultValue ?? null);
  const value = props.value !== undefined ? props.value : inner;
  // While a range is half chosen, the calendar shows it but the field keeps the last full range.
  const [draft, setDraft] = React.useState<DateRange | null>(null);
  const trigger = React.useRef<HTMLButtonElement>(null);
  const pop = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const el = pop.current, btn = trigger.current;
    if (!el || !btn) return;
    const reposition = () => place(el, btn);
    const onToggle = (e: Event) => {
      const now = (e as ToggleEvent).newState === "open";
      setOpen(now);
      if (now) {
        reposition();
        window.addEventListener("scroll", reposition, true); window.addEventListener("resize", reposition);
        el.querySelector<HTMLButtonElement>('.vin-calendar__day[tabindex="0"]')?.focus();
      } else {
        setDraft(null);
        window.removeEventListener("scroll", reposition, true); window.removeEventListener("resize", reposition);
      }
    };
    el.addEventListener("toggle", onToggle);
    return () => { el.removeEventListener("toggle", onToggle); window.removeEventListener("scroll", reposition, true); window.removeEventListener("resize", reposition); };
  }, []);

  const done = () => { pop.current?.hidePopover?.(); trigger.current?.focus(); };
  const shown = value && (typeof value === "string" || value.to) ? formatDate(value, locale) : null;
  const raw = !value ? "" : typeof value === "string" ? value : value.to ? `${value.from}/${value.to}` : "";
  if (isDev() && !label && !props["aria-label"]) console.warn("VinUI DatePicker: pass a label or an aria-label.");

  const calendarProps = { min, max, isDateDisabled, weekStartsOn, locale };
  const control = (
    <div className={cx("vin-date-picker", !label && className)} style={label ? undefined : style}>
      <button
        ref={trigger}
        type="button"
        id={base}
        className={cx("vin-input", "vin-date-picker__trigger", size !== "md" && `vin-input--${size}`)}
        {...popoverTarget(ids.pop)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-labelledby={label ? `${ids.label} ${base}` : undefined}
        aria-label={label ? undefined : props["aria-label"]}
        aria-invalid={error ? true : undefined}
        aria-describedby={cx(!!error && ids.error, !!hint && ids.hint) || undefined}
        disabled={disabled}
      >
        <svg className="vin-date-picker__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="4.5" width="18" height="16.5" rx="2.5" /><path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
        </svg>
        {shown ? <span className="vin-date-picker__value">{shown}</span> : <span className="vin-date-picker__value" data-placeholder="">{placeholder}</span>}
      </button>
      <div ref={pop} className="vin-popover vin-date-picker__content" id={ids.pop} {...popover("auto")} role="dialog" aria-label={typeof label === "string" ? `Choose ${label.toLowerCase()}` : "Choose a date"}>
        {mode === "range" ? (
          <Calendar
            mode="range"
            {...calendarProps}
            value={draft ?? (value as DateRange | null)}
            onValueChange={(v) => {
              if (!v.to) { setDraft(v); return; }
              setDraft(null);
              if (props.value === undefined) setInner(v);
              (props.onValueChange as ((v: DateRange) => void) | undefined)?.(v);
              done();
            }}
          />
        ) : (
          <Calendar
            {...calendarProps}
            value={value as string | null}
            onValueChange={(v) => {
              if (props.value === undefined) setInner(v);
              (props.onValueChange as ((v: string) => void) | undefined)?.(v);
              done();
            }}
          />
        )}
      </div>
      {name && <input type="hidden" name={name} value={raw} />}
    </div>
  );
  if (!label) return control;
  return (
    <div className={cx("vin-field", className)} style={style}>
      <span className="vin-label" id={ids.label}>{label}</span>
      {control}
      {error && <p className="vin-error" id={ids.error}>{error}</p>}
      {hint && <p className="vin-hint" id={ids.hint}>{hint}</p>}
    </div>
  );
}
