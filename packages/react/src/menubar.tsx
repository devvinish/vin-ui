"use client";

import * as React from "react";
import { MenuContext } from "./dropdown-menu";

/** The popover attribute. A plain attribute so React 18 passes it through too (React 19 knows the prop). */
const popover = (mode: "auto" | "manual") => ({ popover: mode }) as unknown as React.HTMLAttributes<HTMLElement>;

/** The button's popovertarget: React 19 calls the prop popoverTarget, React 18 only passes the plain attribute. */
const popoverTarget = (id: string) => (React.version.startsWith("18") ? { popovertarget: id } : { popoverTarget: id }) as unknown as React.ButtonHTMLAttributes<HTMLButtonElement>;

/*
 * VinUI · Menubar (React). API: spec/menubar.json. Needs dropdown-menu.tsx next to it.
 * A row of menus with the WAI-ARIA menubar keys. The items are Dropdown Menu's.
 *   <Menubar label="Editor">
 *     <MenubarMenu label="File"><DropdownMenuItem shortcut="⌘T">New tab</DropdownMenuItem></MenubarMenu>
 *   </Menubar>
 */

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

/** Place the menu under its button, flipping up if there's no room, and keep it on screen. */
function place(el: HTMLElement, anchor: HTMLElement) {
  const r = anchor.getBoundingClientRect(), w = el.offsetWidth, h = el.offsetHeight, gap = 6;
  const vw = document.documentElement.clientWidth, vh = window.innerHeight, m = 8;
  const up = r.bottom + gap + h > vh - m && r.top - gap - h >= m;
  const rtl = getComputedStyle(anchor).direction === "rtl";
  const x = rtl ? r.right - w : r.left;
  el.style.left = `${Math.max(m, Math.min(x, vw - w - m))}px`;
  el.style.top = `${Math.max(m, Math.min(up ? r.top - gap - h : r.bottom + gap, vh - h - m))}px`;
  el.setAttribute("data-placed", up ? "top" : "bottom");
}

type Bar = {
  active: number;
  setActive: (i: number) => void;
  /** Open the menu of the trigger `step` places along from `from` (0 = itself). */
  openFrom: (from: HTMLElement, step: number, last?: boolean) => void;
  /** Move focus along the bar. */
  focusFrom: (from: HTMLElement, to: "next" | "prev" | "first" | "last") => void;
  anyOpen: () => boolean;
};
const BarContext = React.createContext<Bar | null>(null);
const IndexContext = React.createContext(0);

export type MenubarProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Name for the menubar, read by screen readers. */
  label: string;
};

export function Menubar({ label, className, children, ...rest }: MenubarProps) {
  const bar = React.useRef<HTMLDivElement>(null);
  const [active, setActive] = React.useState(0);
  const triggers = () => [...(bar.current?.querySelectorAll<HTMLButtonElement>(".vin-menubar__trigger") ?? [])].filter((t) => !t.disabled);
  const menuOf = (t: HTMLElement) => document.getElementById(t.getAttribute("popovertarget") ?? "");
  const rtl = () => !!bar.current && getComputedStyle(bar.current).direction === "rtl";

  const ctx: Bar = {
    active,
    setActive,
    openFrom: (from, step, last) => {
      const all = triggers(), i = all.indexOf(from as HTMLButtonElement);
      const t = all[(i + (rtl() ? -step : step) + all.length) % all.length];
      const menu = menuOf(t);
      if (!t || !menu?.showPopover) return;
      setActive(all.indexOf(t));
      menu.toggleAttribute("data-vin-last", !!last);
      if (menu.matches(":popover-open")) menu.dispatchEvent(new CustomEvent("vin-focus-item"));
      else menu.showPopover();
    },
    focusFrom: (from, to) => {
      const all = triggers(), i = all.indexOf(from as HTMLButtonElement), back = rtl();
      const next = to === "first" ? all[0] : to === "last" ? all[all.length - 1]
        : all[(i + ((to === "next") !== back ? 1 : -1) + all.length) % all.length];
      if (!next) return;
      setActive(all.indexOf(next));
      next.focus();
    },
    anyOpen: () => triggers().some((t) => menuOf(t)?.matches(":popover-open")),
  };

  let index = 0;
  return (
    <BarContext.Provider value={ctx}>
      <div {...rest} ref={bar} role="menubar" aria-label={label} className={cx("vin-menubar", className)}>
        {React.Children.map(children, (child) => (React.isValidElement(child) ? <IndexContext.Provider value={index++}>{child}</IndexContext.Provider> : child))}
      </div>
    </BarContext.Provider>
  );
}

export type MenubarMenuProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
  /** The button's text. */
  label: React.ReactNode;
  disabled?: boolean;
  /** The menu's items: DropdownMenuItem, CheckboxItem, RadioGroup, Label and Separator. */
  children?: React.ReactNode;
};

export function MenubarMenu({ label, disabled, className, children, ...rest }: MenubarMenuProps) {
  const bar = React.useContext(BarContext);
  const index = React.useContext(IndexContext);
  const id = "vin-mb-" + React.useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const btn = React.useRef<HTMLButtonElement>(null);
  const menu = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState(false);

  const items = () => [...(menu.current?.querySelectorAll<HTMLButtonElement>('[role^="menuitem"]') ?? [])]
    .filter((el) => !el.disabled && el.getAttribute("aria-disabled") !== "true");
  const move = (to: number) => { const all = items(); if (all.length) all[(to + all.length) % all.length].focus(); };
  const close = React.useCallback(() => { menu.current?.hidePopover?.(); btn.current?.focus(); }, []);

  React.useEffect(() => {
    const el = menu.current;
    if (!el) return;
    const reposition = () => btn.current && place(el, btn.current);
    const focusItem = () => { move(el.hasAttribute("data-vin-last") ? -1 : 0); el.removeAttribute("data-vin-last"); };
    const onBefore = (e: Event) => {
      if ((e as ToggleEvent).newState === "closed" && el.contains(document.activeElement)) btn.current?.focus();
    };
    const onToggle = (e: Event) => {
      const now = (e as ToggleEvent).newState === "open";
      setOpen(now);
      if (now) {
        bar?.setActive(index);
        reposition(); window.addEventListener("scroll", reposition, true); window.addEventListener("resize", reposition);
        focusItem();
      } else { window.removeEventListener("scroll", reposition, true); window.removeEventListener("resize", reposition); }
    };
    el.addEventListener("beforetoggle", onBefore);
    el.addEventListener("toggle", onToggle);
    el.addEventListener("vin-focus-item", focusItem);
    return () => {
      el.removeEventListener("beforetoggle", onBefore); el.removeEventListener("toggle", onToggle); el.removeEventListener("vin-focus-item", focusItem);
      window.removeEventListener("scroll", reposition, true); window.removeEventListener("resize", reposition);
    };
  }, [bar, index]);

  const typed = React.useRef({ text: "", at: 0 });
  const onMenuKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    rest.onKeyDown?.(e);
    const all = items(), at = all.indexOf(document.activeElement as HTMLButtonElement);
    if (e.key === "ArrowDown") { e.preventDefault(); move(at + 1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); move(at < 0 ? -1 : at - 1); }
    else if (e.key === "Home") { e.preventDefault(); move(0); }
    else if (e.key === "End") { e.preventDefault(); move(-1); }
    else if (e.key === "Tab") { e.preventDefault(); close(); }
    else if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); if (btn.current) bar?.openFrom(btn.current, e.key === "ArrowRight" ? 1 : -1); }
    else if (e.key.length === 1 && e.key !== " " && !e.ctrlKey && !e.metaKey && !e.altKey) {
      // One letter jumps to the next match; a quick run of letters refines the current one.
      const now = Date.now(), t = typed.current;
      t.text = (now - t.at > 600 ? "" : t.text) + e.key.toLowerCase(); t.at = now;
      const start = t.text.length > 1 ? Math.max(at, 0) : at + 1;
      for (let i = 0; i < all.length; i++) {
        const item = all[(start + i) % all.length];
        if (item.textContent?.trim().toLowerCase().startsWith(t.text)) { item.focus(); break; }
      }
    }
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    rest.onPointerMove?.(e);
    const item = (e.target as HTMLElement).closest<HTMLButtonElement>('[role^="menuitem"]');
    if (item && items().includes(item) && document.activeElement !== item) item.focus({ preventScroll: true });
  };
  const onTriggerKey = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    const t = e.currentTarget;
    const to = ({ ArrowRight: "next", ArrowLeft: "prev", Home: "first", End: "last" } as const)[e.key as "Home"];
    if (to) { e.preventDefault(); bar?.focusFrom(t, to); }
    else if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); bar?.openFrom(t, 0, e.key === "ArrowUp"); }
  };

  return (
    <MenuContext.Provider value={{ close }}>
      <button
        type="button"
        ref={btn}
        id={`${id}-trigger`}
        className="vin-menubar__trigger"
        role="menuitem"
        aria-haspopup="menu"
        aria-expanded={open}
        {...popoverTarget(id)}
        tabIndex={(bar?.active ?? 0) === index ? 0 : -1}
        disabled={disabled}
        onKeyDown={onTriggerKey}
        onFocus={() => bar?.setActive(index)}
        onPointerEnter={(e) => { if (e.pointerType !== "touch" && !open && bar?.anyOpen()) bar.openFrom(e.currentTarget, 0); }}
      >
        {label}
      </button>
      <div
        {...rest}
        ref={menu}
        id={id}
        {...popover("auto")}
        role="menu"
        aria-labelledby={`${id}-trigger`}
        className={cx("vin-menu", className)}
        onKeyDown={onMenuKey}
        onPointerMove={onPointerMove}
      >
        {children}
      </div>
    </MenuContext.Provider>
  );
}
