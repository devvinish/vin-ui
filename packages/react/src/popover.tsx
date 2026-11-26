"use client";

import * as React from "react";

/** The popover attribute. A plain attribute so React 18 passes it through too (React 19 knows the prop). */
const popover = (mode: "auto" | "manual") => ({ popover: mode }) as unknown as React.HTMLAttributes<HTMLElement>;

/** The button's popovertarget: React 19 calls the prop popoverTarget, React 18 only passes the plain attribute. */
const popoverTarget = (id: string) => (React.version.startsWith("18") ? { popovertarget: id } : { popoverTarget: id }) as unknown as React.ButtonHTMLAttributes<HTMLButtonElement>;

/** The ref on a React element: React 19 keeps it in props, React 18 on the element itself. */
const elementRef = <T,>(el: React.ReactElement): React.Ref<T> | undefined =>
  React.version.startsWith("18") ? (el as unknown as { ref?: React.Ref<T> }).ref : (el.props as { ref?: React.Ref<T> }).ref;

/*
 * VinUI · Popover (React). API: spec/popover.json.
 * The browser's popover: Escape and a click outside close it. This places it next to the trigger.
 *   <Popover trigger={<Button>Dimensions</Button>} title="Dimensions">…</Popover>
 */

type Side = "top" | "right" | "bottom" | "left";
type Align = "start" | "center" | "end";

/** Place `el` next to `anchor`, flipping to the other side if there's no room, and keep it on screen. */
function place(el: HTMLElement, anchor: HTMLElement, side: Side, align: Align, gap: number) {
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

export type PopoverProps = Omit<React.HTMLAttributes<HTMLDivElement>, "title"> & {
  /** The button that opens it. */
  trigger: React.ReactElement<React.ButtonHTMLAttributes<HTMLButtonElement> & { ref?: React.Ref<HTMLButtonElement> }>;
  title?: React.ReactNode;
  description?: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: Side;
  align?: Align;
};

export function Popover({ trigger, title, description, open, defaultOpen = false, onOpenChange, side = "bottom", align = "start", className, children, ...rest }: PopoverProps) {
  const id = "vin-pop-" + React.useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const pop = React.useRef<HTMLDivElement>(null);
  const btn = React.useRef<HTMLButtonElement | null>(null);
  const [inner, setInner] = React.useState(defaultOpen);
  const isOpen = open ?? inner;

  // Follow the browser's open/close (Escape, click outside), and keep it placed while open.
  React.useEffect(() => {
    const el = pop.current;
    if (!el) return;
    const reposition = () => btn.current && place(el, btn.current, side, align, 6);
    const onToggle = (e: Event) => {
      const now = (e as ToggleEvent).newState === "open";
      if (now) { reposition(); window.addEventListener("scroll", reposition, true); window.addEventListener("resize", reposition); }
      else { window.removeEventListener("scroll", reposition, true); window.removeEventListener("resize", reposition); }
      if (open === undefined) setInner(now);
      onOpenChange?.(now);
    };
    el.addEventListener("toggle", onToggle);
    return () => { el.removeEventListener("toggle", onToggle); window.removeEventListener("scroll", reposition, true); window.removeEventListener("resize", reposition); };
  }, [side, align, open, onOpenChange]);

  // Controlled or defaultOpen: open or close it to match.
  React.useEffect(() => {
    const el = pop.current;
    if (!el?.showPopover) return;
    const shown = el.matches(":popover-open");
    if (isOpen && !shown) el.showPopover();
    if (!isOpen && shown) el.hidePopover();
  }, [isOpen]);

  const tRef = elementRef<HTMLButtonElement>(trigger);
  const triggerEl = React.cloneElement(trigger, {
    ...popoverTarget(id),
    "aria-expanded": isOpen,
    ref: (node: HTMLButtonElement | null) => {
      btn.current = node;
      if (typeof tRef === "function") tRef(node);
      else if (tRef) (tRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
    },
  } as React.ButtonHTMLAttributes<HTMLButtonElement>);

  return (
    <>
      {triggerEl}
      <div
        {...rest}
        ref={pop}
        id={id}
        {...popover("auto")}
        role="dialog"
        aria-labelledby={title != null ? `${id}-title` : undefined}
        data-side={side}
        data-align={align}
        className={["vin-popover", className].filter(Boolean).join(" ")}
      >
        {title != null && <p className="vin-popover__title" id={`${id}-title`}>{title}</p>}
        {description != null && <p className="vin-popover__description">{description}</p>}
        {children}
      </div>
    </>
  );
}
