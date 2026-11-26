"use client";

import * as React from "react";
import { Button } from "./button";

/** The popover attribute. A plain attribute so React 18 passes it through too (React 19 knows the prop). */
const popover = (mode: "auto" | "manual") => ({ popover: mode }) as unknown as React.HTMLAttributes<HTMLElement>;

/*
 * VinUI · Sidebar (React). API: spec/sidebar.json. Needs button.tsx next to it.
 * 768px and wider it sits beside the page and folds to icons; narrower, the trigger slides it in.
 *   <SidebarLayout>
 *     <Sidebar label="App">
 *       <SidebarContent>
 *         <SidebarGroup label="Platform"><SidebarItem href="/" icon={<HomeIcon />} active>Dashboard</SidebarItem></SidebarGroup>
 *       </SidebarContent>
 *     </Sidebar>
 *     <SidebarInset><SidebarTrigger />…</SidebarInset>
 *   </SidebarLayout>
 */

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");
const PHONE = "(max-width: 767px)";

type Ctx = {
  id: string;
  collapsed: boolean;
  setCollapsed: (on: boolean) => void;
  phone: boolean;
  open: boolean;
  setOpen: (on: boolean) => void;
  nav: React.MutableRefObject<HTMLElement | null>;
  opener: React.MutableRefObject<HTMLButtonElement | null>;
};
const SidebarContext = React.createContext<Ctx | null>(null);
const useSidebar = () => {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) throw new Error("VinUI Sidebar parts must be inside <SidebarLayout>.");
  return ctx;
};

export type SidebarLayoutProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Folded to icons (wide screens). Use with onCollapsedChange. */
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
};

/** Holds the sidebar and the page beside it. */
export function SidebarLayout({ collapsed, defaultCollapsed = false, onCollapsedChange, className, children, ...rest }: SidebarLayoutProps) {
  const id = "vin-sb-" + React.useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const [inner, setInner] = React.useState(defaultCollapsed);
  const [phone, setPhone] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const nav = React.useRef<HTMLElement | null>(null);
  const opener = React.useRef<HTMLButtonElement | null>(null);
  const isCollapsed = collapsed ?? inner;

  React.useEffect(() => {
    const mq = window.matchMedia(PHONE);
    const onChange = () => {
      setPhone(mq.matches);
      if (!mq.matches && nav.current?.matches(":popover-open")) nav.current.hidePopover();
    };
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const setCollapsed = (on: boolean) => { if (collapsed === undefined) setInner(on); onCollapsedChange?.(on); };
  return (
    <SidebarContext.Provider value={{ id, collapsed: isCollapsed, setCollapsed, phone, open, setOpen, nav, opener }}>
      <div {...rest} data-state={isCollapsed ? "collapsed" : undefined} className={cx("vin-sidebar-layout", className)}>
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

export type SidebarProps = React.HTMLAttributes<HTMLElement> & {
  /** Name for the navigation, read by screen readers. */
  label: string;
};

/** The navigation itself. On phones it's a popover the trigger opens. */
export function Sidebar({ label, className, children, onClick, ...rest }: SidebarProps) {
  const ctx = useSidebar();
  const { nav, opener, setOpen, setCollapsed } = ctx;

  React.useEffect(() => {
    const el = nav.current;
    if (!el) return;
    const onBefore = (e: Event) => {
      if ((e as ToggleEvent).newState === "closed" && el.contains(document.activeElement)) opener.current?.focus();
    };
    const onToggle = (e: Event) => {
      const now = (e as ToggleEvent).newState === "open";
      setOpen(now);
      if (now) (el.querySelector<HTMLElement>('[aria-current="page"]') ?? el.querySelector<HTMLElement>("a[href], summary, button:not(:disabled)"))?.focus();
    };
    el.addEventListener("beforetoggle", onBefore);
    el.addEventListener("toggle", onToggle);
    return () => { el.removeEventListener("beforetoggle", onBefore); el.removeEventListener("toggle", onToggle); };
  }, [nav, opener, setOpen]);

  return (
    <nav
      {...rest}
      ref={nav}
      id={ctx.id}
      aria-label={label}
      {...popover("auto")}
      className={cx("vin-sidebar", className)}
      onClick={(e) => {
        onClick?.(e);
        const target = (e.target as HTMLElement).closest("a[href], summary");
        if (!target) return;
        // On a phone, following a link closes the sidebar.
        if (ctx.phone && target.tagName === "A" && nav.current?.matches(":popover-open")) nav.current.hidePopover();
        // Folded, a nested list's button unfolds the sidebar to show it.
        if (!ctx.phone && ctx.collapsed && target.tagName === "SUMMARY") {
          e.preventDefault();
          (target.parentElement as HTMLDetailsElement).open = true;
          setCollapsed(false);
        }
      }}
    >
      {children}
    </nav>
  );
}

const part = (cls: string) =>
  function SidebarPart({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
    return <div {...rest} className={cx(cls, className)} />;
  };
/** The top of the sidebar, e.g. the app's name. */
export const SidebarHeader = part("vin-sidebar__header");
/** The groups. It scrolls when they don't fit. */
export const SidebarContent = part("vin-sidebar__content");
/** The bottom of the sidebar, e.g. help or the account. */
export const SidebarFooter = part("vin-sidebar__footer");
/** The page next to the sidebar. */
export const SidebarInset = part("vin-sidebar-inset");

/** A list of items outside a group, e.g. in the header or footer. */
export function SidebarMenu({ className, ...rest }: React.HTMLAttributes<HTMLUListElement>) {
  return <ul {...rest} className={cx("vin-sidebar__menu", className)} />;
}

export type SidebarGroupProps = React.HTMLAttributes<HTMLDivElement> & {
  /** The group's heading. It also names the list for screen readers. */
  label: React.ReactNode;
};

export function SidebarGroup({ label, className, children, ...rest }: SidebarGroupProps) {
  const id = "vin-sbg-" + React.useId().replace(/[^a-zA-Z0-9_-]/g, "");
  return (
    <div {...rest} className={cx("vin-sidebar__group", className)}>
      <p className="vin-sidebar__label" id={id}>{label}</p>
      <ul className="vin-sidebar__menu" aria-labelledby={id}>{children}</ul>
    </div>
  );
}

/** Folded, each item shows its name as a tooltip. */
const useTip = (text: React.ReactNode) => {
  const ctx = React.useContext(SidebarContext);
  return ctx && ctx.collapsed && !ctx.phone && typeof text === "string" ? text : undefined;
};

export type SidebarItemProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  /** Shown on its own when the sidebar is folded. */
  icon?: React.ReactNode;
  /** Marks the link to the current page. */
  active?: boolean;
  /** A count or short label at the end, e.g. unread messages. */
  badge?: React.ReactNode;
};

export function SidebarItem({ icon, active, badge, className, children, ...rest }: SidebarItemProps) {
  const tip = useTip(children);
  return (
    <li>
      <a title={tip} aria-current={active ? "page" : undefined} {...rest} className={cx("vin-sidebar__item", className)}>
        {icon}
        <span className="vin-sidebar__text">{children}</span>
        {badge != null && badge !== false && <span className="vin-sidebar__badge">{badge}</span>}
      </a>
    </li>
  );
}

export type SidebarSubProps = Omit<React.DetailsHTMLAttributes<HTMLDetailsElement>, "open"> & {
  /** The item's text. */
  label: React.ReactNode;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
};

/** An item that opens a nested list of SidebarItems. */
export function SidebarSub({ label, icon, defaultOpen, className, children, ...rest }: SidebarSubProps) {
  const tip = useTip(label);
  return (
    <li>
      <details {...rest} open={defaultOpen} className={cx("vin-sidebar__sub", className)}>
        <summary className="vin-sidebar__item" title={tip}>
          {icon}
          <span className="vin-sidebar__text">{label}</span>
        </summary>
        <ul className="vin-sidebar__submenu">{children}</ul>
      </details>
    </li>
  );
}

export type SidebarTriggerProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> & { children?: React.ReactNode };

/** Folds the sidebar to icons, or opens it on phones. */
export function SidebarTrigger({ onClick, children, ...rest }: SidebarTriggerProps) {
  const ctx = useSidebar();
  const expanded = ctx.phone ? ctx.open : !ctx.collapsed;
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle sidebar"
      {...rest}
      className={cx("vin-sidebar__trigger", rest.className)}
      aria-controls={ctx.id}
      aria-expanded={expanded}
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        if (!window.matchMedia(PHONE).matches) { ctx.setCollapsed(!ctx.collapsed); return; }
        ctx.opener.current = e.currentTarget;
        const nav = ctx.nav.current;
        if (nav?.matches(":popover-open")) nav.hidePopover(); else nav?.showPopover?.();
      }}
    >
      {children ?? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18" /></svg>
      )}
    </Button>
  );
}
