"use client";

import * as React from "react";

/*
 * VinUI · Tabs (React). API: spec/tabs.json.
 * WAI-ARIA tabs: arrow keys move between tabs, Home/End jump, panels are linked by id.
 */

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

type Ctx = { value: string; select: (v: string) => void; base: string };
const TabsContext = React.createContext<Ctx | null>(null);
const useTabs = (part: string) => {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error(`VinUI: <${part}> must be inside <Tabs>.`);
  return ctx;
};
const safe = (v: string) => v.replace(/[^a-zA-Z0-9_-]/g, "-");

export type TabsProps = Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> & {
  /** The open tab, when you control it. */
  value?: string;
  /** The tab open at first. */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** "segmented" (default) or "line" (underline). */
  variant?: "segmented" | "line";
};

export function Tabs({ value, defaultValue = "", onValueChange, variant = "segmented", className, ...rest }: TabsProps) {
  const [inner, setInner] = React.useState(defaultValue);
  const current = value ?? inner;
  const auto = React.useId();
  const ctx = React.useMemo<Ctx>(
    () => ({ value: current, base: `vin-${auto.replace(/[^a-zA-Z0-9_-]/g, "")}`, select: (v) => { if (value === undefined) setInner(v); onValueChange?.(v); } }),
    [current, auto, value, onValueChange],
  );
  return (
    <TabsContext.Provider value={ctx}>
      <div {...rest} className={cx("vin-tabs", variant === "line" && "vin-tabs--line", className)} />
    </TabsContext.Provider>
  );
}

export type TabListProps = React.HTMLAttributes<HTMLDivElement>;

/** The row of tabs. Give it an aria-label that names the group. */
export function TabList({ className, onKeyDown, ...rest }: TabListProps) {
  const onKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    const tabs = [...e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)')];
    const i = tabs.indexOf(document.activeElement as HTMLButtonElement);
    if (i < 0) return;
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    const step = e.key === "ArrowRight" ? (rtl ? -1 : 1) : e.key === "ArrowLeft" ? (rtl ? 1 : -1) : 0;
    const target = step ? tabs[(i + step + tabs.length) % tabs.length] : e.key === "Home" ? tabs[0] : e.key === "End" ? tabs[tabs.length - 1] : null;
    if (target) { e.preventDefault(); target.focus(); target.click(); }
  };
  return <div {...rest} role="tablist" className={cx("vin-tabs__list", className)} onKeyDown={onKey} />;
}

export type TabProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value"> & { value: string };

export function Tab({ value, className, onClick, ...rest }: TabProps) {
  const ctx = useTabs("Tab");
  const on = ctx.value === value;
  return (
    <button
      {...rest}
      type="button"
      role="tab"
      id={`${ctx.base}-tab-${safe(value)}`}
      aria-selected={on}
      aria-controls={`${ctx.base}-panel-${safe(value)}`}
      tabIndex={on ? 0 : -1}
      className={cx("vin-tabs__tab", className)}
      onClick={(e) => { onClick?.(e); if (!e.defaultPrevented) ctx.select(value); }}
    />
  );
}

export type TabPanelProps = React.HTMLAttributes<HTMLDivElement> & { value: string };

export function TabPanel({ value, className, ...rest }: TabPanelProps) {
  const ctx = useTabs("TabPanel");
  return (
    <div
      {...rest}
      role="tabpanel"
      id={`${ctx.base}-panel-${safe(value)}`}
      aria-labelledby={`${ctx.base}-tab-${safe(value)}`}
      tabIndex={0}
      hidden={ctx.value !== value}
      className={cx("vin-tabs__panel", className)}
    />
  );
}
