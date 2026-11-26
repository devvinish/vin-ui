"use client";

import * as React from "react";

/** The popover attribute. A plain attribute so React 18 passes it through too (React 19 knows the prop). */
const popover = (mode: "auto" | "manual") => ({ popover: mode }) as unknown as React.HTMLAttributes<HTMLElement>;

/** The button's popovertarget: React 19 calls the prop popoverTarget, React 18 only passes the plain attribute. */
const popoverTarget = (id: string) => (React.version.startsWith("18") ? { popovertarget: id } : { popoverTarget: id }) as unknown as React.ButtonHTMLAttributes<HTMLButtonElement>;

/*
 * VinUI · Navigation Menu (React). API: spec/navigation-menu.json.
 * Disclosure buttons whose panels open on hover, click or Down Arrow.
 *   <NavigationMenu label="Main">
 *     <NavigationMenuItem trigger="Products">
 *       <NavigationMenuGrid><NavigationMenuCard href="/analytics" title="Analytics">See what's working.</NavigationMenuCard></NavigationMenuGrid>
 *     </NavigationMenuItem>
 *     <NavigationMenuLink href="/docs" active>Docs</NavigationMenuLink>
 *   </NavigationMenu>
 */

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

/** Place the panel under its button, flipping up if there's no room, and keep it on screen. */
function place(el: HTMLElement, anchor: HTMLElement) {
  const r = anchor.getBoundingClientRect(), w = el.offsetWidth, h = el.offsetHeight, gap = 6;
  const vw = document.documentElement.clientWidth, vh = window.innerHeight, m = 8;
  const up = r.bottom + gap + h > vh - m && r.top - gap - h >= m;
  const rtl = getComputedStyle(anchor).direction === "rtl";
  el.style.left = `${Math.max(m, Math.min(rtl ? r.right - w : r.left, vw - w - m))}px`;
  el.style.top = `${Math.max(m, Math.min(up ? r.top - gap - h : r.bottom + gap, vh - h - m))}px`;
  el.setAttribute("data-placed", up ? "top" : "bottom");
}

export type NavigationMenuProps = React.HTMLAttributes<HTMLElement> & {
  /** Name for the navigation, read by screen readers. */
  label: string;
};

export function NavigationMenu({ label, className, children, onKeyDown, ...rest }: NavigationMenuProps) {
  const nav = React.useRef<HTMLElement>(null);
  // Left and Right Arrow, Home and End move between the top-level items.
  const onKey = (e: React.KeyboardEvent<HTMLElement>) => {
    onKeyDown?.(e);
    const list = [...(nav.current?.querySelectorAll<HTMLElement>(".vin-nav-menu__item > .vin-nav-menu__trigger, .vin-nav-menu__item > .vin-nav-menu__link") ?? [])];
    const i = list.indexOf(e.target as HTMLElement);
    if (i < 0) return;
    const rtl = getComputedStyle(nav.current!).direction === "rtl";
    const next = e.key === "ArrowRight" || e.key === "ArrowLeft" ? list[(i + ((e.key === "ArrowRight") !== rtl ? 1 : -1) + list.length) % list.length]
      : e.key === "Home" ? list[0] : e.key === "End" ? list[list.length - 1] : null;
    if (next) { e.preventDefault(); next.focus(); }
  };
  return (
    <nav {...rest} ref={nav} aria-label={label} className={cx("vin-nav-menu", className)} onKeyDown={onKey}>
      <ul className="vin-nav-menu__list">{children}</ul>
    </nav>
  );
}

export type NavigationMenuItemProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
  /** The button's text. */
  trigger: React.ReactNode;
  /** The panel: usually a NavigationMenuGrid. */
  children?: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
};

export function NavigationMenuItem({ trigger, onOpenChange, className, children, ...rest }: NavigationMenuItemProps) {
  const id = "vin-nm-" + React.useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const btn = React.useRef<HTMLButtonElement>(null);
  const panel = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState(false);
  const pinned = React.useRef(false);
  const focusFirst = React.useRef(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const isOpen = () => !!panel.current?.matches(":popover-open");
  const links = () => [...(panel.current?.querySelectorAll<HTMLElement>("a[href], button:not(:disabled)") ?? [])];
  const later = (fn: () => void, ms: number) => { clearTimeout(timer.current); timer.current = setTimeout(fn, ms); };
  const show = (pin: boolean) => { clearTimeout(timer.current); pinned.current = pin; if (!isOpen()) panel.current?.showPopover?.(); };
  const hide = () => { clearTimeout(timer.current); if (isOpen()) panel.current?.hidePopover(); };

  React.useEffect(() => {
    const el = panel.current;
    if (!el) return;
    const reposition = () => btn.current && place(el, btn.current);
    const onBefore = (e: Event) => {
      if ((e as ToggleEvent).newState === "closed" && el.contains(document.activeElement)) btn.current?.focus();
    };
    const onToggle = (e: Event) => {
      const now = (e as ToggleEvent).newState === "open";
      setOpen(now);
      onOpenChange?.(now);
      if (now) {
        reposition(); window.addEventListener("scroll", reposition, true); window.addEventListener("resize", reposition);
        if (focusFirst.current) links()[0]?.focus();
      } else {
        pinned.current = false;
        window.removeEventListener("scroll", reposition, true); window.removeEventListener("resize", reposition);
      }
      focusFirst.current = false;
    };
    el.addEventListener("beforetoggle", onBefore);
    el.addEventListener("toggle", onToggle);
    return () => {
      el.removeEventListener("beforetoggle", onBefore); el.removeEventListener("toggle", onToggle);
      window.removeEventListener("scroll", reposition, true); window.removeEventListener("resize", reposition);
      clearTimeout(timer.current);
    };
  }, [onOpenChange]);

  const onPanelKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    rest.onKeyDown?.(e);
    const l = links(), i = l.indexOf(document.activeElement as HTMLElement);
    const to = e.key === "ArrowDown" ? l[(i + 1) % l.length] : e.key === "ArrowUp" ? l[(i - 1 + l.length) % l.length]
      : e.key === "Home" ? l[0] : e.key === "End" ? l[l.length - 1] : null;
    if (to) { e.preventDefault(); to.focus(); }
  };

  return (
    <li
      className="vin-nav-menu__item"
      onBlur={(e) => {
        // Focus leaving the button and its panel closes it.
        const item = e.currentTarget, to = e.relatedTarget as Node | null;
        if (to) { if (!item.contains(to)) hide(); }
        else setTimeout(() => { if (!item.contains(document.activeElement)) hide(); }, 0);
      }}
    >
      <button
        type="button"
        ref={btn}
        className="vin-nav-menu__trigger"
        aria-expanded={open}
        aria-controls={id}
        {...popoverTarget(id)}
        onClick={(e) => {
          // The click is ours: a panel opened by hover stays open when clicked, a second click closes it.
          e.preventDefault();
          if (isOpen() && !pinned.current) { pinned.current = true; clearTimeout(timer.current); }
          else if (isOpen()) hide();
          else show(true);
        }}
        onKeyDown={(e) => {
          if (e.key !== "ArrowDown") return;
          e.preventDefault();
          if (isOpen()) { pinned.current = true; links()[0]?.focus(); }
          else { focusFirst.current = true; show(true); }
        }}
        onPointerEnter={(e) => {
          if (e.pointerType === "touch") return;
          if (isOpen()) clearTimeout(timer.current);
          else later(() => show(false), 120);
        }}
        onPointerLeave={(e) => { if (e.pointerType !== "touch" && !pinned.current) later(hide, 200); }}
      >
        {trigger}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
      </button>
      <div
        {...rest}
        ref={panel}
        id={id}
        {...popover("auto")}
        className={cx("vin-nav-menu__panel", className)}
        onKeyDown={onPanelKey}
        onPointerEnter={(e) => { rest.onPointerEnter?.(e); clearTimeout(timer.current); }}
        onPointerLeave={(e) => { rest.onPointerLeave?.(e); if (e.pointerType !== "touch" && !pinned.current) later(hide, 200); }}
      >
        {children}
      </div>
    </li>
  );
}

export type NavigationMenuLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  /** Marks the link to the current page. */
  active?: boolean;
};

/** A top-level link with no panel. */
export function NavigationMenuLink({ active, className, ...rest }: NavigationMenuLinkProps) {
  return (
    <li className="vin-nav-menu__item">
      <a aria-current={active ? "page" : undefined} {...rest} className={cx("vin-nav-menu__link", className)} />
    </li>
  );
}

export type NavigationMenuGridProps = React.HTMLAttributes<HTMLUListElement> & {
  /** One column of links instead of two. */
  list?: boolean;
};

export function NavigationMenuGrid({ list, className, ...rest }: NavigationMenuGridProps) {
  return <ul {...rest} className={cx("vin-nav-menu__grid", list && "vin-nav-menu__grid--list", className)} />;
}

export type NavigationMenuCardProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "title"> & {
  title: React.ReactNode;
  /** Marks the link to the current page. */
  active?: boolean;
};

/** A link in a panel: a title and, as children, an optional line of text. */
export function NavigationMenuCard({ title, active, className, children, ...rest }: NavigationMenuCardProps) {
  return (
    <li>
      <a aria-current={active ? "page" : undefined} {...rest} className={cx("vin-nav-menu__card", className)}>
        <span className="vin-nav-menu__card-title">{title}</span>
        {children != null && children !== false && <span className="vin-nav-menu__card-text">{children}</span>}
      </a>
    </li>
  );
}
