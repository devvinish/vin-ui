"use client";

import * as React from "react";

/** The popover attribute. A plain attribute so React 18 passes it through too (React 19 knows the prop). */
const popover = (mode: "auto" | "manual") => ({ popover: mode }) as unknown as React.HTMLAttributes<HTMLElement>;

/** Dev-only warnings, without needing Node's `process` (Vite and the browser don't have it). */
const isDev = () => (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV !== "production";

/*
 * VinUI · Combobox (React). API: spec/combobox.json.
 * A text field that filters a list (WAI-ARIA combobox with list autocomplete). Focus stays in the
 * input; the list opens in the top layer. Options use Select's classes, so they look the same.
 */

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");
const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export type ComboboxOption = string | { value: string; label: string; disabled?: boolean; group?: string };
type Item = { value: string; label: string; disabled: boolean; group?: string };
const norm = (o: ComboboxOption): Item => (typeof o === "string" ? { value: o, label: o, disabled: false } : { disabled: false, ...o });
const defaultFilter = (o: Item, q: string) => fold(o.label).includes(fold(q.trim()));

export type ComboboxProps = {
  options: ComboboxOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Visible label. Without it, pass an aria-label. */
  label?: React.ReactNode;
  "aria-label"?: string;
  placeholder?: string;
  /** Shown when nothing matches. */
  emptyText?: React.ReactNode;
  /** Your own matching. The default matches any part of the label, ignoring case and accents. */
  filter?: (option: Item, query: string) => boolean;
  hint?: React.ReactNode;
  /** Error message. Also marks the field invalid. */
  error?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  /** Form field name: adds a hidden input with the value. */
  name?: string;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
};

export function Combobox({
  options, value, defaultValue, onValueChange, label, placeholder = "Search…", emptyText = "No results.",
  filter = defaultFilter, hint, error, size = "md", disabled, name, id, className, style, ...aria
}: ComboboxProps) {
  const items = options.map(norm);
  const auto = React.useId();
  const base = id ?? `vin-${auto.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const ids = { list: `${base}-list`, hint: `${base}-hint`, error: `${base}-error` };
  const [inner, setInner] = React.useState(defaultValue);
  const current = value ?? inner;
  const chosen = items.find((o) => o.value === current);
  const [text, setText] = React.useState(chosen?.label ?? "");
  const [query, setQuery] = React.useState<string | null>(null); // null: not filtering, show everything
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(-1);
  const input = React.useRef<HTMLInputElement>(null);
  const panel = React.useRef<HTMLDivElement>(null);

  // Keep the text in step with a value changed from outside.
  React.useEffect(() => { if (query === null) setText(chosen?.label ?? ""); }, [chosen?.label]); // eslint-disable-line react-hooks/exhaustive-deps

  const shown = items.map((o, i) => (query === null || filter(o, query) ? i : -1)).filter((i) => i >= 0);
  const enabled = shown.filter((i) => !items[i].disabled);

  const choose = (i: number) => {
    const o = items[i];
    if (!o || o.disabled) return;
    if (value === undefined) setInner(o.value);
    onValueChange?.(o.value);
    setText(o.label);
    setQuery(null);
  };
  const restore = () => { setText(chosen?.label ?? ""); setQuery(null); };
  const close = () => { setOpen(false); setActive(-1); };
  const openList = (which?: "first" | "last" | "none", list = enabled) => {
    if (disabled) return;
    const sel = items.findIndex((o) => o.value === current);
    setActive(which === "first" ? list[0] ?? -1 : which === "last" ? list[list.length - 1] ?? -1 : which === "none" ? -1 : list.includes(sel) ? sel : list[0] ?? -1);
    setOpen(true);
  };

  React.useLayoutEffect(() => {
    const el = panel.current, field = input.current;
    if (!open || !el || !field) return;
    el.showPopover?.();
    const place = () => {
      const r = field.getBoundingClientRect();
      el.style.minWidth = `${r.width}px`;
      el.style.left = `${r.left}px`;
      const below = window.innerHeight - r.bottom, h = el.offsetHeight;
      el.style.top = `${below < h + 8 && r.top > below ? r.top - h - 4 : r.bottom + 4}px`;
    };
    place();
    const outside = (e: PointerEvent) => {
      if (!field.contains(e.target as Node) && !el.contains(e.target as Node)) { close(); restoreRef.current(); }
    };
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    document.addEventListener("pointerdown", outside, true);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
      document.removeEventListener("pointerdown", outside, true);
      if (el.matches(":popover-open")) el.hidePopover?.();
    };
  }, [open]);
  const restoreRef = React.useRef(restore);
  restoreRef.current = restore;

  React.useEffect(() => {
    if (open && active >= 0) document.getElementById(optionId(active))?.scrollIntoView({ block: "nearest" });
  }, [open, active]); // eslint-disable-line react-hooks/exhaustive-deps

  const move = (step: number) => {
    const pos = enabled.indexOf(active);
    setActive(pos < 0 ? enabled[step > 0 ? 0 : enabled.length - 1] ?? -1 : enabled[Math.min(enabled.length - 1, Math.max(0, pos + step))]);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const k = e.key;
    if (k === "ArrowDown" || k === "ArrowUp") {
      e.preventDefault();
      if (!open) {
        const list = query === null ? items.map((o, i) => (o.disabled ? -1 : i)).filter((i) => i >= 0) : enabled;
        openList(e.altKey ? "none" : k === "ArrowUp" ? "last" : undefined, list);
      } else if (!e.altKey) move(k === "ArrowDown" ? 1 : -1);
      return;
    }
    if (!open) {
      if (k === "Escape" && text) {
        e.preventDefault();
        if (value === undefined) setInner(undefined);
        onValueChange?.("");
        setText(""); setQuery(null);
      }
      return;
    }
    if (k === "PageDown" || k === "PageUp") { e.preventDefault(); move(k === "PageDown" ? 10 : -10); }
    else if (k === "Enter") { e.preventDefault(); if (active >= 0) choose(active); close(); }
    else if (k === "Escape") { e.preventDefault(); close(); restore(); }
    else if (k === "Tab") { if (active >= 0 && query !== null) choose(active); close(); }
  };

  if (isDev() && !label && !aria["aria-label"]) console.warn("VinUI Combobox: pass a label or an aria-label.");

  const optionId = (i: number) => `${base}-opt-${i}`;
  const renderOption = (i: number) => {
    const o = items[i];
    return (
      <div
        key={o.value}
        id={optionId(i)}
        className="vin-select__item"
        role="option"
        aria-selected={o.value === current}
        aria-disabled={o.disabled || undefined}
        data-value={o.value}
        data-active={open && i === active ? "" : undefined}
        hidden={!shown.includes(i) || undefined}
        onPointerMove={() => { if (!o.disabled && i !== active) setActive(i); }}
        onClick={() => { if (o.disabled) return; choose(i); close(); input.current?.focus(); }}
      >
        {o.label}
      </div>
    );
  };
  // Options in order; consecutive options with the same group go under one heading.
  const blocks: { group?: string; idx: number[] }[] = [];
  items.forEach((o, i) => {
    const last = blocks[blocks.length - 1];
    if (last && last.group === o.group) last.idx.push(i);
    else blocks.push({ group: o.group, idx: [i] });
  });

  const control = (
    <div className={cx("vin-combobox", !label && className)} style={label ? undefined : style}>
      <input
        ref={input}
        id={base}
        className={cx("vin-input", "vin-combobox__input", size !== "md" && `vin-input--${size}`)}
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={ids.list}
        aria-label={label ? undefined : aria["aria-label"]}
        aria-invalid={error ? true : undefined}
        aria-describedby={cx(!!error && ids.error, !!hint && ids.hint) || undefined}
        aria-activedescendant={open && active >= 0 ? optionId(active) : undefined}
        autoComplete="off"
        placeholder={placeholder}
        value={text}
        disabled={disabled}
        onChange={(e) => {
          const q = e.target.value;
          setText(q); setQuery(q);
          const list = items.map((o, i) => (!o.disabled && filter(o, q) ? i : -1)).filter((i) => i >= 0);
          openList("first", list);
        }}
        onClick={() => (open ? close() : openList())}
        onKeyDown={onKeyDown}
        onBlur={() => setTimeout(() => { if (document.activeElement !== input.current) { close(); restoreRef.current(); } }, 0)}
      />
      <div ref={panel} className="vin-select__content vin-combobox__content" {...popover("manual")} onMouseDown={(e) => e.preventDefault()}>
        <div id={ids.list} role="listbox" aria-label={typeof label === "string" ? label : aria["aria-label"]}>
          {blocks.map((b, n) =>
            b.group === undefined ? b.idx.map(renderOption) : (
              <div key={`g-${n}`} className="vin-combobox__group" role="group" aria-labelledby={`${base}-g${n}`} hidden={!b.idx.some((i) => shown.includes(i)) || undefined}>
                <div className="vin-combobox__label" id={`${base}-g${n}`} role="presentation">{b.group}</div>
                {b.idx.map(renderOption)}
              </div>
            ),
          )}
        </div>
        <p className="vin-combobox__empty" role="status" hidden={shown.length > 0 || undefined}>{emptyText}</p>
      </div>
      {name && <input type="hidden" name={name} value={current ?? ""} />}
    </div>
  );
  if (!label) return control;
  return (
    <div className={cx("vin-field", className)} style={style}>
      <label className="vin-label" htmlFor={base}>{label}</label>
      {control}
      {error && <p className="vin-error" id={ids.error}>{error}</p>}
      {hint && <p className="vin-hint" id={ids.hint}>{hint}</p>}
    </div>
  );
}
