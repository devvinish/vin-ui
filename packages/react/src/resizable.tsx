"use client";

import * as React from "react";

/*
 * VinUI · Resizable (React). API: spec/resizable.json.
 * <ResizableGroup> holds <ResizablePanel>s with a <ResizableHandle> between each pair.
 * Handles follow the WAI-ARIA window splitter pattern: arrows move them, Home/End go to the
 * smallest/largest size, Enter collapses the panel before the handle and restores it.
 */

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");
const STEP = 5;

type GroupCtx = {
  vertical: boolean;
  sizes: number[];
  mins: number[];
  ids: string[];
  set: (i: number, v: number) => void;
  group: React.RefObject<HTMLDivElement | null>;
};
const Ctx = React.createContext<GroupCtx | null>(null);
const Index = React.createContext(0);

export type ResizableGroupProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Panels side by side (horizontal) or stacked (vertical). */
  orientation?: "horizontal" | "vertical";
  /** Called with every panel's size, in percent, after a change. */
  onLayout?: (sizes: number[]) => void;
};

export type ResizablePanelProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Starting size, in percent of the group. Panels without one share what is left. */
  defaultSize?: number;
  /** The smallest it can get, in percent. Default 10. */
  minSize?: number;
};

export type ResizableHandleProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
  /** What it resizes, for screen readers. Default "Resize". */
  label?: string;
  /** Draw a small grip in the middle of the line. */
  withGrip?: boolean;
};

export function ResizableGroup({ orientation = "horizontal", onLayout, className, children, ...rest }: ResizableGroupProps) {
  const base = `vin-${React.useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const items = React.Children.toArray(children).filter(React.isValidElement) as React.ReactElement<Record<string, unknown>>[];
  const panels = items.filter((c) => c.type === ResizablePanel) as React.ReactElement<ResizablePanelProps>[];
  const mins = panels.map((p) => p.props.minSize ?? 10);
  const ids = panels.map((p, i) => p.props.id ?? `${base}-panel-${i}`);

  const [sizes, setSizes] = React.useState(() => {
    const given = panels.map((p) => p.props.defaultSize);
    const known = given.reduce<number>((a, s) => a + (s ?? 0), 0);
    const missing = given.filter((s) => s === undefined).length;
    return given.map((s) => s ?? Math.max(0, 100 - known) / missing);
  });
  const latest = React.useRef(sizes);
  latest.current = sizes;
  const group = React.useRef<HTMLDivElement>(null);

  const set = (i: number, v: number) => {
    const now = latest.current;
    const pair = now[i] + now[i + 1];
    const next = Math.min(pair - mins[i + 1], Math.max(mins[i], Math.round(v)));
    if (next === now[i]) return;
    const out = now.slice();
    out[i] = next;
    out[i + 1] = pair - next;
    latest.current = out;
    setSizes(out);
    onLayout?.(out);
  };

  let p = 0;
  let h = 0;
  const wrapped = items.map((child, k) => {
    if (child.type === ResizablePanel) return <Index.Provider key={child.key ?? k} value={p++}>{child}</Index.Provider>;
    if (child.type === ResizableHandle) return <Index.Provider key={child.key ?? k} value={h++}>{child}</Index.Provider>;
    return child;
  });

  return (
    <Ctx.Provider value={{ vertical: orientation === "vertical", sizes, mins, ids, set, group }}>
      <div ref={group} {...rest} className={cx("vin-resizable", orientation === "vertical" && "vin-resizable--vertical", className)}>
        {wrapped}
      </div>
    </Ctx.Provider>
  );
}

export function ResizablePanel({ defaultSize: _d, minSize: _m, className, style, children, ...rest }: ResizablePanelProps) {
  const ctx = React.useContext(Ctx);
  const i = React.useContext(Index);
  if (!ctx) throw new Error("VinUI: <ResizablePanel> must be inside <ResizableGroup>");
  return (
    <div {...rest} id={ctx.ids[i]} className={cx("vin-resizable__panel", className)} style={{ ...style, ["--vin-size" as string]: String(ctx.sizes[i]) }}>
      {children}
    </div>
  );
}

export function ResizableHandle({ label = "Resize", withGrip, className, onKeyDown, onPointerDown, ...rest }: ResizableHandleProps) {
  const ctx = React.useContext(Ctx);
  const i = React.useContext(Index);
  const saved = React.useRef<number | null>(null);
  const [dragging, setDragging] = React.useState(false);
  if (!ctx) throw new Error("VinUI: <ResizableHandle> must be inside <ResizableGroup>");
  const { vertical, sizes, mins, ids, set, group } = ctx;
  const ok = sizes[i + 1] !== undefined;
  const rtl = () => !vertical && !!group.current && getComputedStyle(group.current).direction === "rtl";

  const keyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented || !ok) return;
    const back = rtl() ? STEP : -STEP;
    const d = vertical ? ({ ArrowUp: -STEP, ArrowDown: STEP } as Record<string, number>)[e.key] : ({ ArrowLeft: back, ArrowRight: -back } as Record<string, number>)[e.key];
    if (d) set(i, sizes[i] + d);
    else if (e.key === "Home") set(i, mins[i]);
    else if (e.key === "End") set(i, Infinity);
    else if (e.key === "Enter") {
      // Collapse the panel before the handle to its minimum; Enter again restores it.
      if (sizes[i] > mins[i]) { saved.current = sizes[i]; set(i, mins[i]); }
      else if (saved.current != null) { set(i, saved.current); saved.current = null; }
    } else return;
    e.preventDefault();
  };

  const pointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    onPointerDown?.(e);
    if (e.defaultPrevented || e.button !== 0 || !ok || !group.current) return;
    e.preventDefault();
    const h = e.currentTarget;
    const g = group.current;
    h.focus();
    const start = vertical ? e.clientY : e.clientX;
    const from = sizes[i];
    const dir = rtl() ? -1 : 1;
    let free = vertical ? g.clientHeight : g.clientWidth;
    for (const x of Array.from(g.children)) if (x.classList.contains("vin-resizable__handle")) free -= vertical ? (x as HTMLElement).offsetHeight : (x as HTMLElement).offsetWidth;
    h.setPointerCapture(e.pointerId);
    setDragging(true);
    g.setAttribute("data-dragging", "");
    const move = (ev: PointerEvent) => set(i, from + ((dir * ((vertical ? ev.clientY : ev.clientX) - start)) / Math.max(1, free)) * 100);
    const up = () => {
      setDragging(false);
      g.removeAttribute("data-dragging");
      h.removeEventListener("pointermove", move);
      h.removeEventListener("pointerup", up);
      h.removeEventListener("pointercancel", up);
    };
    h.addEventListener("pointermove", move);
    h.addEventListener("pointerup", up);
    h.addEventListener("pointercancel", up);
  };

  return (
    <div
      role="separator"
      tabIndex={0}
      aria-label={label}
      aria-controls={ids[i]}
      aria-orientation={vertical ? "horizontal" : "vertical"}
      aria-valuenow={ok ? Math.round(sizes[i]) : undefined}
      aria-valuemin={ok ? mins[i] : undefined}
      aria-valuemax={ok ? Math.round(sizes[i] + sizes[i + 1] - mins[i + 1]) : undefined}
      data-dragging={dragging ? "" : undefined}
      {...rest}
      className={cx("vin-resizable__handle", withGrip && "vin-resizable__handle--grip", className)}
      onKeyDown={keyDown}
      onPointerDown={pointerDown}
    />
  );
}
