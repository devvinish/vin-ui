import * as React from "react";

/*
 * VinUI · Select (React). API: spec/select.json.
 * A custom select (WAI-ARIA select-only combobox). Focus stays on the button; the list opens in
 * the top layer, so parents with overflow: hidden never clip it.
 * Keys: ↑ ↓ Home End PageUp PageDown, Enter/Space to choose, Esc to close, type to jump.
 */

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

export type SelectOption = string | { value: string; label: string; disabled?: boolean };
const norm = (o: SelectOption) => (typeof o === "string" ? { value: o, label: o, disabled: false } : { disabled: false, ...o });

export type SelectProps = {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Visible label. Without it, pass an aria-label. */
  label?: React.ReactNode;
  "aria-label"?: string;
  placeholder?: string;
  hint?: React.ReactNode;
  /** Error message. Also marks the select invalid. */
  error?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  /** Form field name: adds a hidden input with the value. */
  name?: string;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
};

export function Select({
  options, value, defaultValue, onValueChange, label, placeholder = "Select…", hint, error,
  size = "md", disabled, name, id, className, style, ...aria
}: SelectProps) {
  const items = options.map(norm);
  const auto = React.useId();
  const base = id ?? `vin-${auto.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const ids = { label: `${base}-label`, list: `${base}-list`, hint: `${base}-hint`, error: `${base}-error` };
  const [inner, setInner] = React.useState(defaultValue);
  const current = value ?? inner;
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(-1);
  const trigger = React.useRef<HTMLButtonElement>(null);
  const list = React.useRef<HTMLDivElement>(null);
  const typed = React.useRef({ text: "", at: 0 });
  const enabled = items.map((o, i) => (o.disabled ? -1 : i)).filter((i) => i >= 0);
  const chosen = items.find((o) => o.value === current);

  const choose = (i: number) => {
    const o = items[i];
    if (!o || o.disabled) return;
    if (value === undefined) setInner(o.value);
    onValueChange?.(o.value);
  };
  const openList = (which?: "first" | "last") => {
    if (disabled) return;
    const sel = items.findIndex((o) => o.value === current);
    setActive(which === "first" ? enabled[0] : which === "last" ? enabled[enabled.length - 1] : sel >= 0 && !items[sel].disabled ? sel : enabled[0]);
    setOpen(true);
  };
  const close = () => { setOpen(false); setActive(-1); };

  // Show the popover, place it under (or above) the button, and close on outside press.
  React.useLayoutEffect(() => {
    const el = list.current, btn = trigger.current;
    if (!open || !el || !btn) return;
    el.showPopover?.();
    const place = () => {
      const r = btn.getBoundingClientRect();
      el.style.minWidth = `${r.width}px`;
      el.style.left = `${r.left}px`;
      const below = window.innerHeight - r.bottom, h = el.offsetHeight;
      el.style.top = `${below < h + 8 && r.top > below ? r.top - h - 4 : r.bottom + 4}px`;
    };
    place();
    const outside = (e: PointerEvent) => { if (!btn.contains(e.target as Node) && !el.contains(e.target as Node)) close(); };
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

  React.useEffect(() => {
    if (open && active >= 0) list.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const move = (step: number) => {
    const pos = enabled.indexOf(active);
    setActive(enabled[Math.min(enabled.length - 1, Math.max(0, pos + step))]);
  };
  const typeahead = (ch: string) => {
    const now = Date.now();
    const t = typed.current;
    t.text = now - t.at > 600 ? ch : t.text + ch;
    t.at = now;
    const from = open ? active : items.findIndex((o) => o.value === current);
    const start = enabled.indexOf(from) + (t.text.length === 1 ? 1 : 0);
    const order = [...enabled.slice(start), ...enabled.slice(0, start)];
    const hit = order.find((i) => items[i].label.toLowerCase().startsWith(t.text.toLowerCase()));
    if (hit === undefined) return;
    if (open) setActive(hit); else choose(hit);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const k = e.key;
    const printable = k.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey;
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(k)) { e.preventDefault(); openList(); }
      else if (k === "Home") { e.preventDefault(); openList("first"); }
      else if (k === "End") { e.preventDefault(); openList("last"); }
      else if (printable) typeahead(k);
      return;
    }
    if (k === "ArrowDown") { e.preventDefault(); if (!e.altKey) move(1); }
    else if (k === "ArrowUp") { e.preventDefault(); if (e.altKey) { choose(active); close(); } else move(-1); }
    else if (k === "Home") { e.preventDefault(); setActive(enabled[0]); }
    else if (k === "End") { e.preventDefault(); setActive(enabled[enabled.length - 1]); }
    else if (k === "PageDown") { e.preventDefault(); move(10); }
    else if (k === "PageUp") { e.preventDefault(); move(-10); }
    else if (k === "Enter" || k === " ") { e.preventDefault(); choose(active); close(); }
    else if (k === "Escape") { e.preventDefault(); close(); }
    else if (k === "Tab") { choose(active); close(); }
    else if (printable) typeahead(k);
  };

  if (process.env.NODE_ENV !== "production" && !label && !aria["aria-label"]) {
    console.warn("VinUI Select: pass a label or an aria-label.");
  }
  const optionId = (i: number) => `${base}-opt-${i}`;
  const control = (
    <div className={cx("vin-select", !label && className)} style={label ? undefined : style}>
      <button
        ref={trigger}
        type="button"
        id={base}
        role="combobox"
        className={cx("vin-input", "vin-select__trigger", size !== "md" && `vin-input--${size}`)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={ids.list}
        aria-labelledby={label ? ids.label : undefined}
        aria-label={label ? undefined : aria["aria-label"]}
        aria-invalid={error ? true : undefined}
        aria-describedby={cx(!!error && ids.error, !!hint && ids.hint) || undefined}
        aria-activedescendant={open && active >= 0 ? optionId(active) : undefined}
        disabled={disabled}
        onClick={() => (open ? close() : openList())}
        onKeyDown={onKeyDown}
        onBlur={() => setTimeout(() => { if (document.activeElement !== trigger.current) close(); }, 0)}
      >
        {chosen ? <span className="vin-select__value">{chosen.label}</span> : <span className="vin-select__value" data-placeholder="">{placeholder}</span>}
      </button>
      <div
        ref={list}
        className="vin-select__content"
        role="listbox"
        id={ids.list}
        popover="manual"
        tabIndex={-1}
        aria-labelledby={label ? ids.label : undefined}
        aria-label={label ? undefined : aria["aria-label"]}
        onMouseDown={(e) => e.preventDefault()}
      >
        {items.map((o, i) => (
          <div
            key={o.value}
            id={optionId(i)}
            className="vin-select__item"
            role="option"
            aria-selected={o.value === current}
            aria-disabled={o.disabled || undefined}
            data-value={o.value}
            data-active={open && i === active ? "" : undefined}
            onPointerMove={() => { if (!o.disabled && i !== active) setActive(i); }}
            onClick={() => { if (o.disabled) return; choose(i); close(); trigger.current?.focus(); }}
          >
            {o.label}
          </div>
        ))}
      </div>
      {name && <input type="hidden" name={name} value={current ?? ""} />}
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
