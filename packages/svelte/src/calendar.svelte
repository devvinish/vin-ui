<!--
  VinUI · Calendar (Svelte). API: spec/calendar.json.
  A month grid for picking a date or a range (WAI-ARIA date grid). Dates are "YYYY-MM-DD"
  strings, so time zones never shift a day.
    <Calendar bind:value />                      "2026-11-14"
    <Calendar mode="range" bind:value />         { from: "2026-11-09", to: "2026-11-15" }
  Keys: ← → ↑ ↓ by day and week, Home/End start and end of the week, PageUp/PageDown by month
  (with Shift, by year), Enter or Space to choose. bind:value and bind:month work.
-->
<script lang="ts" module>
  /* ---------- dates as YYYY-MM-DD, worked out in UTC ---------- */
  const pad = (n: number) => String(n).padStart(2, "0");
  const toIso = (d: Date) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
  const fromIso = (s: string) => {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d || 1));
  };
  const addDays = (s: string, n: number) => {
    const d = fromIso(s);
    d.setUTCDate(d.getUTCDate() + n);
    return toIso(d);
  };
  const addMonths = (s: string, n: number) => {
    const d = fromIso(s),
      day = d.getUTCDate();
    const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1));
    const last = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth() + 1, 0)).getUTCDate();
    t.setUTCDate(Math.min(day, last));
    return toIso(t);
  };
  const monthOf = (s: string) => s.slice(0, 7);
  const localToday = () => {
    const n = new Date();
    return `${n.getFullYear()}-${pad(n.getMonth() + 1)}-${pad(n.getDate())}`;
  };

  /** The 42 days (6 weeks) shown for a month. */
  export function monthDays(month: string, weekStartsOn: 0 | 1 = 1) {
    const first = fromIso(`${month}-01`);
    const start = addDays(toIso(first), -((first.getUTCDay() - weekStartsOn + 7) % 7));
    return Array.from({ length: 42 }, (_, i) => addDays(start, i));
  }

  export type DateRange = { from: string; to?: string };

  export type CalendarProps = {
    /** "single" (default) picks one date; "range" picks a first and last date. */
    mode?: "single" | "range";
    /** "YYYY-MM-DD" in single mode, { from, to } in range mode. */
    value?: string | DateRange | null;
    /** Gets a string in single mode and a DateRange in range mode. */
    onValueChange?: (value: any) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
    /** Month shown, "YYYY-MM". */
    month?: string;
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
    /** Called when a day is chosen with the keyboard or mouse (after the value changes). */
    onDayClick?: (date: string) => void;
    class?: string;
    style?: string;
  };
</script>

<script lang="ts">
  import { tick } from "svelte";

  let {
    mode = "single",
    value = $bindable(null),
    onValueChange,
    month = $bindable(),
    onMonthChange,
    min,
    max,
    isDateDisabled,
    weekStartsOn = 1,
    locale = "en-US",
    labels,
    onDayClick,
    class: className,
    style,
  }: CalendarProps = $props();

  const uid = $props.id();
  const titleId = `vin-cal-${uid}-title`;

  const single = $derived(mode === "single" ? ((value as string | null | undefined) ?? null) : null);
  const range = $derived(mode === "range" ? ((value as DateRange | null | undefined) ?? null) : null);
  const anchor = $derived(single ?? range?.from ?? null);

  // Today is only known in the browser, so the server HTML never depends on the clock's day.
  let today = $state<string | null>(null);
  $effect(() => {
    today = localToday();
  });

  const startMonth = () => month ?? (anchor ? monthOf(anchor) : monthOf(localToday()));
  month = startMonth();
  const shown = $derived(month ?? monthOf(localToday()));
  function setMonth(m: string) {
    month = m;
    onMonthChange?.(m);
  }

  let focusDate = $state<string | null>(null);
  let grid = $state<HTMLTableElement>();

  const disabled = (d: string) => (min !== undefined && d < min) || (max !== undefined && d > max) || !!isDateDisabled?.(d);
  const days = $derived(monthDays(shown, weekStartsOn));
  const inMonth = (d: string) => monthOf(d) === shown;
  // The day that takes Tab: the focused one, else the chosen one, else today, else the 1st.
  const tabbable = $derived([focusDate, anchor, today, `${shown}-01`].find((d) => d && inMonth(d)) ?? `${shown}-01`);

  const fmt = $derived({
    title: new Intl.DateTimeFormat(locale, { month: "long", year: "numeric", timeZone: "UTC" }),
    day: new Intl.DateTimeFormat(locale, { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }),
    short: new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" }),
    long: new Intl.DateTimeFormat(locale, { weekday: "long", timeZone: "UTC" }),
  });

  function choose(d: string) {
    if (disabled(d)) return;
    if (mode === "single") {
      value = d;
      onValueChange?.(d);
    } else {
      const r = range;
      const next: DateRange = !r || r.to || !r.from ? { from: d } : d < r.from ? { from: d, to: r.from } : { from: r.from, to: d };
      value = next;
      onValueChange?.(next);
    }
    if (!inMonth(d)) setMonth(monthOf(d));
    focusDate = d;
    onDayClick?.(d);
  }
  async function moveTo(d: string) {
    focusDate = d;
    if (!inMonth(d)) setMonth(monthOf(d));
    await tick();
    grid?.querySelector<HTMLButtonElement>(`[data-date="${tabbable}"]`)?.focus();
  }

  function onkeydown(e: KeyboardEvent & { currentTarget: EventTarget & HTMLTableElement }) {
    const from = (e.target as HTMLElement).closest<HTMLElement>("[data-date]")?.dataset.date;
    if (!from) return;
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    const dow = (fromIso(from).getUTCDay() - weekStartsOn + 7) % 7;
    const to = (
      {
        ArrowRight: addDays(from, rtl ? -1 : 1),
        ArrowLeft: addDays(from, rtl ? 1 : -1),
        ArrowDown: addDays(from, 7),
        ArrowUp: addDays(from, -7),
        Home: addDays(from, -dow),
        End: addDays(from, 6 - dow),
        PageDown: addMonths(from, e.shiftKey ? 12 : 1),
        PageUp: addMonths(from, e.shiftKey ? -12 : -1),
      } as Record<string, string>
    )[e.key];
    if (!to) return;
    e.preventDefault();
    moveTo(to);
  }

  const rangeOf = (d: string): "start" | "middle" | "end" | undefined => {
    if (!range?.from || !range.to || range.from === range.to) return undefined;
    return d === range.from ? "start" : d === range.to ? "end" : d > range.from && d < range.to ? "middle" : undefined;
  };
  const isSelected = (d: string) =>
    mode === "single" ? d === single : !!range && (d === range.from || d === range.to || (!!range.to && d > range.from && d < range.to));

  // 2024-01-07 was a Sunday.
  const weekday = (i: number) => toIso(new Date(Date.UTC(2024, 0, 7 + ((i + weekStartsOn) % 7))));
</script>

{#snippet chevron(d: string)}
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path {d} /></svg>
{/snippet}

<div class={["vin-calendar", className].filter(Boolean).join(" ")} {style}>
  <div class="vin-calendar__header">
    <button
      type="button"
      class="vin-btn vin-btn--ghost vin-btn--icon vin-btn--sm vin-calendar__nav"
      aria-label={labels?.previous ?? "Previous month"}
      onclick={() => setMonth(addMonths(`${shown}-01`, -1).slice(0, 7))}
    >
      {@render chevron("m15 18-6-6 6-6")}
    </button>
    <p class="vin-calendar__title" id={titleId} aria-live="polite">{fmt.title.format(fromIso(`${shown}-01`))}</p>
    <button
      type="button"
      class="vin-btn vin-btn--ghost vin-btn--icon vin-btn--sm vin-calendar__nav"
      aria-label={labels?.next ?? "Next month"}
      onclick={() => setMonth(addMonths(`${shown}-01`, 1).slice(0, 7))}
    >
      {@render chevron("m9 18 6-6-6-6")}
    </button>
  </div>
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions (arrow keys move between the day buttons inside the grid) -->
  <table bind:this={grid} class="vin-calendar__grid" role="grid" aria-labelledby={titleId} {onkeydown}>
    <thead>
      <tr>
        {#each { length: 7 } as _, i (i)}
          <th scope="col" abbr={fmt.long.format(fromIso(weekday(i)))}>{fmt.short.format(fromIso(weekday(i)))}</th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each { length: 6 } as _, w (w)}
        <tr>
          {#each days.slice(w * 7, w * 7 + 7) as d (d)}
            <td aria-selected={isSelected(d)} data-range={rangeOf(d)}>
              <button
                type="button"
                class="vin-calendar__day"
                tabindex={d === tabbable ? 0 : -1}
                data-date={d}
                data-outside={inMonth(d) ? undefined : ""}
                aria-label={fmt.day.format(fromIso(d))}
                aria-disabled={disabled(d) || undefined}
                aria-current={d === today ? "date" : undefined}
                onclick={() => choose(d)}
                onfocus={() => {
                  if (d !== focusDate && inMonth(d)) focusDate = d;
                }}
              >
                {Number(d.slice(8))}
              </button>
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>
