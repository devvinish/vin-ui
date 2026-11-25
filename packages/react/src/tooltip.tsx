"use client";

import * as React from "react";

/*
 * VinUI · Tooltip (React). API: spec/tooltip.json.
 * Wrap one trigger: <Tooltip content="Add to library"><Button>Save</Button></Tooltip>.
 * Hover (after `delay`) or keyboard focus shows it; Escape hides it. It sits in the top layer (popover).
 */

type Side = "top" | "right" | "bottom" | "left";

/** Place `el` next to `anchor`, flipping to the other side if there's no room, and keep it on screen. */
function place(el: HTMLElement, anchor: HTMLElement, side: Side, align: "start" | "center" | "end", gap: number) {
  const r = anchor.getBoundingClientRect(), w = el.offsetWidth, h = el.offsetHeight;
  const vw = document.documentElement.clientWidth, vh = window.innerHeight, m = 8;
  const opposite = { top: "bottom", bottom: "top", left: "right", right: "left" } as const;
  const fits = { top: r.top - gap - h >= m, bottom: r.bottom + gap + h <= vh - m, left: r.left - gap - w >= m, right: r.right + gap + w <= vw - m };
  if (!fits[side] && fits[opposite[side]]) side = opposite[side];
  if (getComputedStyle(anchor).direction === "rtl") align = align === "start" ? "end" : align === "end" ? "start" : align;
  let x: number, y: number;
  if (side === "top" || side === "bottom") {
    y = side === "top" ? r.top - gap - h : r.bottom + gap;
    x = align === "start" ? r.left : align === "end" ? r.right - w : r.left + (r.width - w) / 2;
  } else {
    x = side === "left" ? r.left - gap - w : r.right + gap;
    y = align === "start" ? r.top : align === "end" ? r.bottom - h : r.top + (r.height - h) / 2;
  }
  el.style.left = `${Math.max(m, Math.min(x, vw - w - m))}px`;
  el.style.top = `${Math.max(m, Math.min(y, vh - h - m))}px`;
  el.setAttribute("data-placed", side);
}

type TriggerProps = {
  "aria-describedby"?: string; "aria-labelledby"?: string; ref?: React.Ref<HTMLElement>;
  onPointerEnter?: React.PointerEventHandler; onPointerLeave?: React.PointerEventHandler; onPointerDown?: React.PointerEventHandler;
  onFocus?: React.FocusEventHandler; onBlur?: React.FocusEventHandler;
};

export type TooltipProps = {
  content: React.ReactNode;
  children: React.ReactElement<TriggerProps>;
  side?: Side;
  /** The tooltip is the trigger's name (icon buttons): aria-labelledby instead of aria-describedby. */
  label?: boolean;
  /** Milliseconds before it shows on hover. Default 300. */
  delay?: number;
  className?: string;
};

export function Tooltip({ content, children, side = "top", label = false, delay = 300, className }: TooltipProps) {
  const id = "vin-tip-" + React.useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const tip = React.useRef<HTMLDivElement>(null);
  const trigger = React.useRef<HTMLElement | null>(null);
  const timers = React.useRef<{ show?: number; hide?: number }>({});

  const isOpen = () => !!tip.current?.matches(":popover-open");
  const onKey = React.useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape" && isOpen()) { e.stopPropagation(); hide(true); }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  function show(now = false) {
    clearTimeout(timers.current.hide); clearTimeout(timers.current.show);
    timers.current.show = window.setTimeout(() => {
      const el = tip.current, anchor = trigger.current;
      if (!el || !anchor) return;
      if (!isOpen()) el.showPopover?.();
      place(el, anchor, side, "center", 6);
      document.addEventListener("keydown", onKey, true);
    }, now ? 0 : delay);
  }
  function hide(now = false) {
    clearTimeout(timers.current.show); clearTimeout(timers.current.hide);
    timers.current.hide = window.setTimeout(() => {
      if (isOpen()) tip.current?.hidePopover?.();
      document.removeEventListener("keydown", onKey, true);
    }, now ? 0 : 100);
  }
  React.useEffect(() => () => {
    clearTimeout(timers.current.show); clearTimeout(timers.current.hide);
    document.removeEventListener("keydown", onKey, true);
  }, [onKey]);

  const p = children.props;
  const childRef = (children as unknown as { props: { ref?: React.Ref<HTMLElement> } }).props.ref;
  const trig = React.cloneElement(children, {
    [label ? "aria-labelledby" : "aria-describedby"]: id,
    ref: (node: HTMLElement | null) => {
      trigger.current = node;
      if (typeof childRef === "function") childRef(node);
      else if (childRef) (childRef as React.RefObject<HTMLElement | null>).current = node;
    },
    onPointerEnter: (e: React.PointerEvent) => { p.onPointerEnter?.(e); if (e.pointerType !== "touch") show(); },
    onPointerLeave: (e: React.PointerEvent) => { p.onPointerLeave?.(e); hide(); },
    onPointerDown: (e: React.PointerEvent) => { p.onPointerDown?.(e); hide(true); },
    onFocus: (e: React.FocusEvent) => { p.onFocus?.(e); if ((e.target as HTMLElement).matches(":focus-visible")) show(true); },
    onBlur: (e: React.FocusEvent) => { p.onBlur?.(e); hide(true); },
  } as TriggerProps);

  return (
    <>
      {trig}
      <div
        ref={tip}
        id={id}
        role="tooltip"
        popover="manual"
        data-side={side}
        className={["vin-tooltip", className].filter(Boolean).join(" ")}
        onPointerEnter={() => clearTimeout(timers.current.hide)}
        onPointerLeave={() => hide()}
      >
        {content}
      </div>
    </>
  );
}
