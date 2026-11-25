"use client";

import * as React from "react";

/*
 * VinUI · Toggle Group (React). API: spec/toggle-group.json.
 * type="single": one choice (a radio group of toggles). type="multiple": any number pressed.
 * One Tab stop for the whole group; arrow keys move between items.
 */

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

type Ctx = { single: boolean; isOn: (v: string) => boolean; toggle: (v: string) => void; focusValue: string | undefined; size?: "sm" | "md" | "lg" | "icon" };
const GroupContext = React.createContext<Ctx | null>(null);

type Base = Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> & {
  variant?: "default" | "outline";
  /** Size for every item. */
  size?: "sm" | "md" | "lg" | "icon";
  /** Name the group with aria-label. */
  "aria-label"?: string;
};
export type ToggleGroupProps =
  | (Base & { type: "single"; value?: string; defaultValue?: string; onValueChange?: (value: string) => void })
  | (Base & { type: "multiple"; value?: string[]; defaultValue?: string[]; onValueChange?: (value: string[]) => void });

export function ToggleGroup(props: ToggleGroupProps) {
  const { type, value, defaultValue, onValueChange, variant = "default", size, className, onKeyDown, children, ...rest } = props as Base & {
    type: "single" | "multiple"; value?: string | string[]; defaultValue?: string | string[]; onValueChange?: (v: never) => void;
  };
  const single = type === "single";
  const toList = (v: string | string[] | undefined) => (v === undefined || v === "" ? [] : Array.isArray(v) ? v : [v]);
  const [inner, setInner] = React.useState<string[]>(toList(defaultValue));
  const current = value !== undefined ? toList(value) : inner;
  const [focusValue, setFocusValue] = React.useState<string>();

  const toggle = (v: string) => {
    const next = single ? [v] : current.includes(v) ? current.filter((x) => x !== v) : [...current, v];
    if (value === undefined) setInner(next);
    setFocusValue(v);
    (onValueChange as ((x: string | string[]) => void) | undefined)?.(single ? next[0] ?? "" : next);
  };
  const ctx: Ctx = { single, isOn: (v) => current.includes(v), toggle, focusValue: focusValue ?? current[0], size };

  const onKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    const items = [...e.currentTarget.querySelectorAll<HTMLButtonElement>(".vin-toggle:not(:disabled)")];
    const i = items.indexOf(document.activeElement as HTMLButtonElement);
    if (i < 0) return;
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    const step = ({ ArrowRight: rtl ? -1 : 1, ArrowDown: 1, ArrowLeft: rtl ? 1 : -1, ArrowUp: -1 } as Record<string, number>)[e.key];
    const target = step ? items[(i + step + items.length) % items.length] : e.key === "Home" ? items[0] : e.key === "End" ? items[items.length - 1] : null;
    if (!target) return;
    e.preventDefault();
    target.focus();
    const v = target.dataset.value!;
    if (single) toggle(v); else setFocusValue(v);
  };

  return (
    <GroupContext.Provider value={ctx}>
      <div
        {...rest}
        role={single ? "radiogroup" : "group"}
        className={cx("vin-toggle-group", variant === "outline" && "vin-toggle-group--outline", className)}
        onKeyDown={onKey}
      >
        <RovingFallback>{children}</RovingFallback>
      </div>
    </GroupContext.Provider>
  );
}

/* If nothing is on and nothing has been focused yet, the first item is the Tab stop. */
const FirstContext = React.createContext<string | undefined>(undefined);
function RovingFallback({ children }: { children: React.ReactNode }) {
  let first: string | undefined;
  React.Children.forEach(children, (c) => {
    if (first === undefined && React.isValidElement<ToggleGroupItemProps>(c) && !c.props.disabled) first = c.props.value;
  });
  return <FirstContext.Provider value={first}>{children}</FirstContext.Provider>;
}

export type ToggleGroupItemProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value" | "type"> & { value: string };

export function ToggleGroupItem({ value, className, onClick, ...rest }: ToggleGroupItemProps) {
  const ctx = React.useContext(GroupContext);
  const first = React.useContext(FirstContext);
  if (!ctx) throw new Error("VinUI: <ToggleGroupItem> must be inside <ToggleGroup>.");
  const on = ctx.isOn(value);
  const stop = (ctx.focusValue ?? first) === value;
  return (
    <button
      {...rest}
      type="button"
      data-value={value}
      role={ctx.single ? "radio" : undefined}
      aria-checked={ctx.single ? on : undefined}
      aria-pressed={ctx.single ? undefined : on}
      tabIndex={stop ? 0 : -1}
      className={cx("vin-toggle", ctx.size && ctx.size !== "md" && `vin-toggle--${ctx.size}`, className)}
      onClick={(e) => { onClick?.(e); if (!e.defaultPrevented) ctx.toggle(value); }}
    />
  );
}
