<!--
  VinUI · Date Picker (Svelte). API: spec/date-picker.json. Needs calendar.svelte next to it.
  A button showing the date; it opens a Calendar in the browser's popover (Esc and a click outside close it).
  Dates are "YYYY-MM-DD" strings; a range is { from, to }.
    <DatePicker label="Due date" bind:value name="due" />
  bind:value works.
-->
<script lang="ts" module>
  import type { DateRange } from "./calendar.svelte";

  const utc = (s: string) => {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d));
  };

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
    const r = anchor.getBoundingClientRect(),
      w = el.offsetWidth,
      h = el.offsetHeight;
    const vw = document.documentElement.clientWidth,
      vh = window.innerHeight,
      m = 8,
      gap = 6;
    const below = r.bottom + gap + h <= vh - m || r.top - gap - h < m;
    const rtl = getComputedStyle(anchor).direction === "rtl";
    const x = rtl ? r.right - w : r.left;
    el.style.left = `${Math.max(m, Math.min(x, vw - w - m))}px`;
    el.style.top = `${Math.max(m, Math.min(below ? r.bottom + gap : r.top - gap - h, vh - h - m))}px`;
    el.setAttribute("data-placed", below ? "bottom" : "top");
  }
</script>

<script lang="ts">
  import type { Snippet } from "svelte";
  import Calendar from "./calendar.svelte";

  type Props = {
    /** "single" (default) or "range". */
    mode?: "single" | "range";
    /** "YYYY-MM-DD" in single mode, { from, to } in range mode. */
    value?: string | DateRange | null;
    /** Gets a string in single mode and a full DateRange in range mode. */
    onValueChange?: (value: any) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
    /** Visible label. Without it, pass an aria-label. */
    label?: string | Snippet;
    "aria-label"?: string;
    placeholder?: string;
    hint?: string | Snippet;
    /** Error message. Also marks the field invalid. */
    error?: string | Snippet;
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
    class?: string;
    style?: string;
  };
  let {
    mode = "single",
    value = $bindable(null),
    onValueChange,
    label,
    "aria-label": ariaLabel,
    placeholder = "Pick a date",
    hint,
    error,
    size = "md",
    disabled = false,
    name,
    min,
    max,
    isDateDisabled,
    weekStartsOn,
    locale = "en-US",
    id,
    class: className,
    style,
  }: Props = $props();

  const uid = $props.id();
  const base = $derived(id ?? `vin-${uid}`);
  const ids = $derived({ label: `${base}-label`, pop: `${base}-pop`, hint: `${base}-hint`, error: `${base}-error` });
  // While a range is half chosen, the calendar shows it but the field keeps the last full range.
  let draft = $state<DateRange | null>(null);
  let trigger = $state<HTMLButtonElement>();
  let pop = $state<HTMLDivElement>();
  let open = $state(false);

  const isDev = () => (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV !== "production";
  const warnIfUnnamed = () => {
    if (isDev() && !label && !ariaLabel) console.warn("VinUI DatePicker: pass a label or an aria-label.");
  };
  warnIfUnnamed();

  $effect(() => {
    const el = pop,
      btn = trigger;
    if (!el || !btn) return;
    const reposition = () => place(el, btn);
    const stop = () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
    const onToggle = (e: Event) => {
      const now = (e as ToggleEvent).newState === "open";
      open = now;
      if (now) {
        reposition();
        window.addEventListener("scroll", reposition, true);
        window.addEventListener("resize", reposition);
        el.querySelector<HTMLButtonElement>('.vin-calendar__day[tabindex="0"]')?.focus();
      } else {
        draft = null;
        stop();
      }
    };
    el.addEventListener("toggle", onToggle);
    return () => {
      el.removeEventListener("toggle", onToggle);
      stop();
    };
  });

  const done = () => {
    pop?.hidePopover?.();
    trigger?.focus();
  };
  const shown = $derived(value && (typeof value === "string" || value.to) ? formatDate(value, locale) : null);
  const raw = $derived(!value ? "" : typeof value === "string" ? value : value.to ? `${value.from}/${value.to}` : "");

  function onCalendarChange(v: string | DateRange) {
    if (typeof v !== "string" && !v.to) {
      draft = v;
      return;
    }
    draft = null;
    value = v;
    onValueChange?.(v);
    done();
  }
</script>

{#snippet text(v: string | Snippet)}{#if typeof v === "function"}{@render v()}{:else}{v}{/if}{/snippet}

{#snippet control()}
  <div class={["vin-date-picker", !label && className].filter(Boolean).join(" ")} style={label ? undefined : style}>
    <!-- svelte-ignore a11y_role_supports_aria_props_implicit (the button stands in for a date field, so an error marks it invalid) -->
    <button
      bind:this={trigger}
      type="button"
      id={base}
      class={["vin-input", "vin-date-picker__trigger", size !== "md" && `vin-input--${size}`].filter(Boolean).join(" ")}
      popovertarget={ids.pop}
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-labelledby={label ? `${ids.label} ${base}` : undefined}
      aria-label={label ? undefined : ariaLabel}
      aria-invalid={error ? true : undefined}
      aria-describedby={[error && ids.error, hint && ids.hint].filter(Boolean).join(" ") || undefined}
      {disabled}
    >
      <svg class="vin-date-picker__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="3" y="4.5" width="18" height="16.5" rx="2.5" /><path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
      </svg>
      {#if shown}<span class="vin-date-picker__value">{shown}</span>{:else}<span class="vin-date-picker__value" data-placeholder="">{placeholder}</span>{/if}
    </button>
    <div
      bind:this={pop}
      class="vin-popover vin-date-picker__content"
      id={ids.pop}
      popover="auto"
      role="dialog"
      aria-label={typeof label === "string" ? `Choose ${label.toLowerCase()}` : "Choose a date"}
    >
      <Calendar
        {mode}
        value={mode === "range" ? (draft ?? value) : value}
        onValueChange={onCalendarChange}
        {min}
        {max}
        {isDateDisabled}
        {weekStartsOn}
        {locale}
      />
    </div>
    {#if name}<input type="hidden" {name} value={raw} />{/if}
  </div>
{/snippet}

{#if !label}
  {@render control()}
{:else}
  <div class={["vin-field", className].filter(Boolean).join(" ")} {style}>
    <span class="vin-label" id={ids.label}>{@render text(label)}</span>
    {@render control()}
    {#if error}<p class="vin-error" id={ids.error}>{@render text(error)}</p>{/if}
    {#if hint}<p class="vin-hint" id={ids.hint}>{@render text(hint)}</p>{/if}
  </div>
{/if}
