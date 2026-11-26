"use client";

import * as React from "react";

/** The popover attribute. A plain attribute so React 18 passes it through too (React 19 knows the prop). */
const popover = (mode: "auto" | "manual") => ({ popover: mode }) as unknown as React.HTMLAttributes<HTMLElement>;

/** The ref on a React element: React 19 keeps it in props, React 18 on the element itself. */
const elementRef = <T,>(el: React.ReactElement): React.Ref<T> | undefined =>
  React.version.startsWith("18") ? (el as unknown as { ref?: React.Ref<T> }).ref : (el.props as { ref?: React.Ref<T> }).ref;

/*
 * VinUI · Hover Card (React). API: spec/hover-card.json.
 * A Popover that opens when the pointer rests on its trigger (after openDelay) or the trigger gets
 * keyboard focus. The pointer can move onto the card; Esc closes it.
 *   <HoverCard trigger={<a href="/u/ada">@ada</a>}><p className="vin-popover__title">Ada Lovelace</p>…</HoverCard>
 */

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");
type Side = "top" | "bottom" | "left" | "right";

function place(el: HTMLElement, anchor: HTMLElement, side: Side, gap: number) {
  const r = anchor.getBoundingClientRect(), w = el.offsetWidth, h = el.offsetHeight;
  const vw = document.documentElement.clientWidth, vh = window.innerHeight, m = 8;
  const opposite = { top: "bottom", bottom: "top", left: "right", right: "left" } as const;
  const fits = { top: r.top - gap - h >= m, bottom: r.bottom + gap + h <= vh - m, left: r.left - gap - w >= m, right: r.right + gap + w <= vw - m };
  if (!fits[side] && fits[opposite[side]]) side = opposite[side];
  let x: number, y: number;
  if (side === "top" || side === "bottom") { y = side === "top" ? r.top - gap - h : r.bottom + gap; x = r.left + (r.width - w) / 2; }
  else { x = side === "left" ? r.left - gap - w : r.right + gap; y = r.top + (r.height - h) / 2; }
  el.style.left = `${Math.max(m, Math.min(x, vw - w - m))}px`;
  el.style.top = `${Math.max(m, Math.min(y, vh - h - m))}px`;
  el.setAttribute("data-placed", side);
}

type TriggerProps = React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<HTMLElement> };

export type HoverCardProps = Omit<React.HTMLAttributes<HTMLDivElement>, "popover"> & {
  /** The link (or button) it previews. */
  trigger: React.ReactElement<TriggerProps>;
  side?: Side;
  /** Milliseconds before it opens on hover. Default 500. */
  openDelay?: number;
  /** Milliseconds before it closes after the pointer leaves. Default 300. */
  closeDelay?: number;
  onOpenChange?: (open: boolean) => void;
};

export function HoverCard({ trigger, side = "bottom", openDelay = 500, closeDelay = 300, onOpenChange, className, children, ...rest }: HoverCardProps) {
  const card = React.useRef<HTMLDivElement>(null);
  const anchor = React.useRef<HTMLElement | null>(null);
  const timers = React.useRef<{ show?: ReturnType<typeof setTimeout>; hide?: ReturnType<typeof setTimeout> }>({});

  const isOpen = () => !!card.current?.matches(":popover-open");
  const show = (delay: number) => {
    clearTimeout(timers.current.hide); clearTimeout(timers.current.show);
    timers.current.show = setTimeout(() => {
      const el = card.current, a = anchor.current;
      if (!el?.showPopover || !a) return;
      if (!isOpen()) { el.showPopover(); onOpenChange?.(true); }
      place(el, a, side, 8);
    }, delay);
  };
  const hide = (delay: number) => {
    clearTimeout(timers.current.show); clearTimeout(timers.current.hide);
    timers.current.hide = setTimeout(() => { if (isOpen()) { card.current?.hidePopover(); onOpenChange?.(false); } }, delay);
  };

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && isOpen()) { e.stopPropagation(); hide(0); } };
    document.addEventListener("keydown", onKey, true);
    const t = timers.current;
    return () => { document.removeEventListener("keydown", onKey, true); clearTimeout(t.show); clearTimeout(t.hide); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const p = trigger.props;
  const tRef = elementRef<HTMLElement>(trigger);
  const triggerEl = React.cloneElement(trigger, {
    ref: (node: HTMLElement | null) => {
      anchor.current = node;
      if (typeof tRef === "function") tRef(node);
      else if (tRef) (tRef as React.MutableRefObject<HTMLElement | null>).current = node;
    },
    onPointerEnter: (e: React.PointerEvent<HTMLElement>) => { p.onPointerEnter?.(e); if (e.pointerType !== "touch") show(openDelay); },
    onPointerLeave: (e: React.PointerEvent<HTMLElement>) => { p.onPointerLeave?.(e); hide(closeDelay); },
    onFocus: (e: React.FocusEvent<HTMLElement>) => { p.onFocus?.(e); if (e.currentTarget.matches(":focus-visible")) show(0); },
    onBlur: (e: React.FocusEvent<HTMLElement>) => { p.onBlur?.(e); hide(150); },
  } as TriggerProps);

  return (
    <>
      {triggerEl}
      <div
        {...rest}
        ref={card}
        {...popover("manual")}
        data-side={side === "bottom" ? undefined : side}
        className={cx("vin-popover", "vin-hover-card", className)}
        onPointerEnter={(e) => { rest.onPointerEnter?.(e); clearTimeout(timers.current.hide); }}
        onPointerLeave={(e) => { rest.onPointerLeave?.(e); hide(closeDelay); }}
        onFocus={(e) => { rest.onFocus?.(e); clearTimeout(timers.current.hide); }}
        onBlur={(e) => { rest.onBlur?.(e); if (!e.currentTarget.contains(e.relatedTarget as Node) && e.relatedTarget !== anchor.current) hide(150); }}
      >
        {children}
      </div>
    </>
  );
}
