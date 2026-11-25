"use client";

import * as React from "react";

/*
 * VinUI · Calendar (React). API: spec/calendar.json.
 * A month grid for picking a date or a range (WAI-ARIA date grid). Dates are "YYYY-MM-DD"
 * strings, so time zones never shift a day.
 * Keys: ← → ↑ ↓ by day and week, Home/End start and end of the week, PageUp/PageDown by month
 * (with Shift, by year), Enter or Space to choose.
 */

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

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

type Common = {
  /** Month shown, "YYYY-MM" (controlled). */
  month?: string;
  defaultMonth?: string;
  onMonthChange?: (month: string) => void;
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
  className?: string;
  style?: React.CSSProperties;
  /** Called when a day is chosen with the keyboard or mouse (after the value changes). */
  onDayClick?: (date: string) => void;
};
export type CalendarProps = Common & (
  | { mode?: "single"; value?: string | null; defaultValue?: string | null; onValueChange?: (value: string) => void }
  | { mode: "range"; value?: DateRange | null; defaultValue?: DateRange | null; onValueChange?: (value: DateRange) => void }
);

export function Calendar(props: CalendarProps) {
  const {
    mode = "single", month, defaultMonth, onMonthChange, min, max, isDateDisabled, weekStartsOn = 1,
    locale = "en-US", labels, className, style, onDayClick,
  } = props;
  const auto = React.useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const titleId = `vin-cal-${auto}-title`;
  const [innerValue, setInnerValue] = React.useState(props.defaultValue ?? null);
  const value = props.value !== undefined ? props.value : innerValue;
  const single = mode === "single" ? (value as string | null) : null;
  const range = mode === "range" ? (value as DateRange | null) : null;
  const anchor = single ?? range?.from ?? null;

  const [today, setToday] = React.useState<string | null>(null);
  React.useEffect(() => setToday(localToday()), []); // only in the browser, so server HTML is stable

  const [innerMonth, setInnerMonth] = React.useState(defaultMonth ?? (anchor ? monthOf(anchor) : monthOf(localToday())));
  const shown = month ?? innerMonth;
  const setMonth = (m: string) => { if (month === undefined) setInnerMonth(m); onMonthChange?.(m); };

  const [focusDate, setFocusDate] = React.useState<string | null>(null);
  const grid = React.useRef<HTMLTableElement>(null);
  const wantFocus = React.useRef(false);

  const disabled = (d: string) => (min !== undefined && d < min) || (max !== undefined && d > max) || !!isDateDisabled?.(d);
  const days = monthDays(shown, weekStartsOn);
  const inMonth = (d: string) => monthOf(d) === shown;
  // The day that takes Tab: the focused one, else the chosen one, else today, else the 1st.
  const tabbable = [focusDate, anchor, today, `${shown}-01`].find((d) => d && inMonth(d)) ?? `${shown}-01`;

  React.useEffect(() => {
    if (!wantFocus.current) return;
    wantFocus.current = false;
    grid.current?.querySelector<HTMLButtonElement>(`[data-date="${tabbable}"]`)?.focus();
  });

  const fmt = React.useMemo(() => ({
    title: new Intl.DateTimeFormat(locale, { month: "long", year: "numeric", timeZone: "UTC" }),
    day: new Intl.DateTimeFormat(locale, { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }),
    short: new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" }),
    long: new Intl.DateTimeFormat(locale, { weekday: "long", timeZone: "UTC" }),
  }), [locale]);

  const choose = (d: string) => {
    if (disabled(d)) return;
    if (mode === "single") {
      if (props.value === undefined) setInnerValue(d);
      (props.onValueChange as ((v: string) => void) | undefined)?.(d);
    } else {
      const next: DateRange = !range || range.to || !range.from ? { from: d } : d < range.from ? { from: d, to: range.from } : { from: range.from, to: d };
      if (props.value === undefined) setInnerValue(next);
      (props.onValueChange as ((v: DateRange) => void) | undefined)?.(next);
    }
    if (!inMonth(d)) setMonth(monthOf(d));
    setFocusDate(d);
    onDayClick?.(d);
  };
  const moveTo = (d: string) => {
    setFocusDate(d);
    if (!inMonth(d)) setMonth(monthOf(d));
    wantFocus.current = true;
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTableElement>) => {
    const from = (e.target as HTMLElement).closest<HTMLElement>("[data-date]")?.dataset.date;
    if (!from) return;
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    const dow = (fromIso(from).getUTCDay() - weekStartsOn + 7) % 7;
    const to = ({
      ArrowRight: addDays(from, rtl ? -1 : 1), ArrowLeft: addDays(from, rtl ? 1 : -1),
      ArrowDown: addDays(from, 7), ArrowUp: addDays(from, -7),
      Home: addDays(from, -dow), End: addDays(from, 6 - dow),
      PageDown: addMonths(from, e.shiftKey ? 12 : 1), PageUp: addMonths(from, e.shiftKey ? -12 : -1),
    } as Record<string, string>)[e.key];
    if (!to) return;
    e.preventDefault();
    moveTo(to);
  };

  const rangeOf = (d: string): "start" | "middle" | "end" | undefined => {
    if (!range?.from || !range.to || range.from === range.to) return undefined;
    return d === range.from ? "start" : d === range.to ? "end" : d > range.from && d < range.to ? "middle" : undefined;
  };
  const isSelected = (d: string) => (mode === "single" ? d === single : !!range && (d === range.from || d === range.to || (!!range.to && d > range.from && d < range.to)));

  const weekday = (i: number) => toIso(new Date(Date.UTC(2024, 0, 7 + ((i + weekStartsOn) % 7)))); // 2024-01-07 was a Sunday
  const chevron = (d: string) => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
  );

  return (
    <div className={cx("vin-calendar", className)} style={style}>
      <div className="vin-calendar__header">
        <button type="button" className="vin-btn vin-btn--ghost vin-btn--icon vin-btn--sm vin-calendar__nav" aria-label={labels?.previous ?? "Previous month"} onClick={() => setMonth(addMonths(`${shown}-01`, -1).slice(0, 7))}>
          {chevron("m15 18-6-6 6-6")}
        </button>
        <p className="vin-calendar__title" id={titleId} aria-live="polite">{fmt.title.format(fromIso(`${shown}-01`))}</p>
        <button type="button" className="vin-btn vin-btn--ghost vin-btn--icon vin-btn--sm vin-calendar__nav" aria-label={labels?.next ?? "Next month"} onClick={() => setMonth(addMonths(`${shown}-01`, 1).slice(0, 7))}>
          {chevron("m9 18 6-6-6-6")}
        </button>
      </div>
      <table ref={grid} className="vin-calendar__grid" role="grid" aria-labelledby={titleId} onKeyDown={onKeyDown}>
        <thead>
          <tr>
            {Array.from({ length: 7 }, (_, i) => (
              <th key={i} scope="col" abbr={fmt.long.format(fromIso(weekday(i)))}>{fmt.short.format(fromIso(weekday(i)))}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 6 }, (_, w) => (
            <tr key={w}>
              {days.slice(w * 7, w * 7 + 7).map((d) => (
                <td key={d} aria-selected={isSelected(d)} data-range={rangeOf(d)}>
                  <button
                    type="button"
                    className="vin-calendar__day"
                    tabIndex={d === tabbable ? 0 : -1}
                    data-date={d}
                    data-outside={inMonth(d) ? undefined : ""}
                    aria-label={fmt.day.format(fromIso(d))}
                    aria-disabled={disabled(d) || undefined}
                    aria-current={d === today ? "date" : undefined}
                    onClick={() => choose(d)}
                    onFocus={() => { if (d !== focusDate && inMonth(d)) setFocusDate(d); }}
                  >
                    {Number(d.slice(8))}
                  </button>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
