"use client";

import * as React from "react";
import { MenuContext } from "./dropdown-menu";

/** The popover attribute. A plain attribute so React 18 passes it through too (React 19 knows the prop). */
const popover = (mode: "auto" | "manual") => ({ popover: mode }) as unknown as React.HTMLAttributes<HTMLElement>;

/*
 * VinUI · Context Menu (React). API: spec/context-menu.json. Needs dropdown-menu.tsx next to it.
 * Right-click, long-press, or focus the area and press Shift+F10 / the Menu key. The items are
 * Dropdown Menu's: DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioGroup…
 *   <ContextMenu label="File actions" content={<DropdownMenuItem>Rename</DropdownMenuItem>}>Right-click here</ContextMenu>
 */

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

export type ContextMenuProps = Omit<React.HTMLAttributes<HTMLDivElement>, "content"> & {
  /** The menu's items. */
  content: React.ReactNode;
  /** Name for the menu, read by screen readers. */
  label: string;
  onOpenChange?: (open: boolean) => void;
};

export function ContextMenu({ content, label, onOpenChange, className, children, ...rest }: ContextMenuProps) {
  const id = "vin-cm-" + React.useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const area = React.useRef<HTMLDivElement>(null);
  const menu = React.useRef<HTMLDivElement>(null);
  const press = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const items = () => [...(menu.current?.querySelectorAll<HTMLButtonElement>('[role^="menuitem"]') ?? [])]
    .filter((el) => !el.disabled && el.getAttribute("aria-disabled") !== "true");
  const move = (to: number) => { const all = items(); if (all.length) all[(to + all.length) % all.length].focus(); };
  const close = React.useCallback(() => { menu.current?.hidePopover?.(); area.current?.focus({ preventScroll: true }); }, []);

  const openAt = (x: number, y: number) => {
    const el = menu.current;
    if (!el?.showPopover) return;
    if (el.matches(":popover-open")) el.hidePopover();
    el.showPopover();
    const w = el.offsetWidth, h = el.offsetHeight, vw = document.documentElement.clientWidth, vh = window.innerHeight, m = 8;
    if (area.current && getComputedStyle(area.current).direction === "rtl") x -= w;
    el.style.left = `${Math.max(m, Math.min(x, vw - w - m))}px`;
    el.style.top = `${Math.max(m, Math.min(y, vh - h - m))}px`;
    move(0);
  };

  React.useEffect(() => {
    const el = menu.current;
    if (!el) return;
    const onToggle = (e: Event) => {
      const open = (e as ToggleEvent).newState === "open";
      onOpenChange?.(open);
      if (!open && el.contains(document.activeElement)) area.current?.focus({ preventScroll: true });
    };
    el.addEventListener("toggle", onToggle);
    return () => el.removeEventListener("toggle", onToggle);
  }, [onOpenChange]);

  const typed = React.useRef({ text: "", at: 0 });
  const onMenuKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const all = items(), at = all.indexOf(document.activeElement as HTMLButtonElement);
    if (e.key === "ArrowDown") { e.preventDefault(); move(at + 1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); move(at < 0 ? -1 : at - 1); }
    else if (e.key === "Home") { e.preventDefault(); move(0); }
    else if (e.key === "End") { e.preventDefault(); move(-1); }
    else if (e.key === "Tab") { e.preventDefault(); close(); }
    else if (e.key.length === 1 && e.key !== " " && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const now = Date.now(), t = typed.current;
      t.text = (now - t.at > 600 ? "" : t.text) + e.key.toLowerCase(); t.at = now;
      const start = t.text.length > 1 ? Math.max(at, 0) : at + 1;
      for (let i = 0; i < all.length; i++) {
        const item = all[(start + i) % all.length];
        if (item.textContent?.trim().toLowerCase().startsWith(t.text)) { item.focus(); break; }
      }
    }
  };

  return (
    <MenuContext.Provider value={{ close }}>
      <div
        {...rest}
        ref={area}
        tabIndex={rest.tabIndex ?? 0}
        className={cx("vin-context-menu", className)}
        onContextMenu={(e) => {
          rest.onContextMenu?.(e);
          if (e.defaultPrevented || (e.shiftKey && e.button === 2)) return;
          e.preventDefault();
          const r = e.currentTarget.getBoundingClientRect();
          if (!e.clientX && !e.clientY) openAt(r.left + 8, r.top + 8); else openAt(e.clientX, e.clientY);
        }}
        onKeyDown={(e) => {
          rest.onKeyDown?.(e);
          // Not every browser turns Shift+F10 or the Menu key into a contextmenu event.
          if (e.defaultPrevented || e.target !== e.currentTarget || !((e.key === "F10" && e.shiftKey) || e.key === "ContextMenu")) return;
          e.preventDefault();
          const r = e.currentTarget.getBoundingClientRect();
          openAt(r.left + 8, r.top + 8);
        }}
        onPointerDown={(e) => {
          rest.onPointerDown?.(e);
          if (e.pointerType !== "touch") return;
          const { clientX, clientY } = e;
          press.current = setTimeout(() => openAt(clientX, clientY), 550);
        }}
        onPointerUp={(e) => { rest.onPointerUp?.(e); clearTimeout(press.current); }}
        onPointerCancel={(e) => { rest.onPointerCancel?.(e); clearTimeout(press.current); }}
        onPointerMove={(e) => { rest.onPointerMove?.(e); if (e.movementX ** 2 + e.movementY ** 2 > 25) clearTimeout(press.current); }}
      >
        {children}
      </div>
      <div
        ref={menu}
        id={id}
        {...popover("auto")}
        role="menu"
        aria-label={label}
        className="vin-menu"
        onKeyDown={onMenuKey}
        onPointerMove={(e) => {
          const item = (e.target as HTMLElement).closest<HTMLButtonElement>('[role^="menuitem"]');
          if (item && items().includes(item) && document.activeElement !== item) item.focus({ preventScroll: true });
        }}
      >
        {content}
      </div>
    </MenuContext.Provider>
  );
}
