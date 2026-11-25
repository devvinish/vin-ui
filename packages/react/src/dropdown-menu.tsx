import * as React from "react";

/*
 * VinUI · Dropdown Menu (React). API: spec/dropdown-menu.json.
 * The browser's popover with the menu keyboard: arrows, Home/End, type to jump, Escape or Tab to close.
 *   <DropdownMenu trigger={<Button>My account</Button>}>
 *     <DropdownMenuItem onSelect={…}>Profile</DropdownMenuItem>
 *   </DropdownMenu>
 */

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");
type Side = "top" | "bottom";
type Align = "start" | "center" | "end";

/** Place `el` next to `anchor`, flipping to the other side if there's no room, and keep it on screen. */
function place(el: HTMLElement, anchor: HTMLElement, side: Side, align: Align, gap: number) {
  const r = anchor.getBoundingClientRect(), w = el.offsetWidth, h = el.offsetHeight;
  const vw = document.documentElement.clientWidth, vh = window.innerHeight, m = 8;
  const fits = { top: r.top - gap - h >= m, bottom: r.bottom + gap + h <= vh - m };
  if (!fits[side] && fits[side === "top" ? "bottom" : "top"]) side = side === "top" ? "bottom" : "top";
  if (getComputedStyle(anchor).direction === "rtl") align = align === "start" ? "end" : align === "end" ? "start" : align;
  const y = side === "top" ? r.top - gap - h : r.bottom + gap;
  const x = align === "start" ? r.left : align === "end" ? r.right - w : r.left + (r.width - w) / 2;
  el.style.left = `${Math.max(m, Math.min(x, vw - w - m))}px`;
  el.style.top = `${Math.max(m, Math.min(y, vh - h - m))}px`;
  el.setAttribute("data-placed", side);
}

const MenuContext = React.createContext<{ close: () => void }>({ close: () => {} });

export type DropdownMenuProps = React.HTMLAttributes<HTMLDivElement> & {
  /** The button that opens it. */
  trigger: React.ReactElement<React.ButtonHTMLAttributes<HTMLButtonElement> & { ref?: React.Ref<HTMLButtonElement> }>;
  side?: Side;
  align?: Align;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function DropdownMenu({ trigger, side = "bottom", align = "start", open, defaultOpen = false, onOpenChange, className, children, ...rest }: DropdownMenuProps) {
  const id = "vin-menu-" + React.useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const menu = React.useRef<HTMLDivElement>(null);
  const btn = React.useRef<HTMLButtonElement | null>(null);
  const focusLast = React.useRef(false);
  const [inner, setInner] = React.useState(defaultOpen);
  const isOpen = open ?? inner;

  const items = () => [...(menu.current?.querySelectorAll<HTMLButtonElement>('[role^="menuitem"]') ?? [])]
    .filter((el) => !el.disabled && el.getAttribute("aria-disabled") !== "true");
  const move = (to: number) => { const all = items(); if (all.length) all[(to + all.length) % all.length].focus(); };
  const close = React.useCallback(() => { menu.current?.hidePopover?.(); btn.current?.focus(); }, []);

  // Follow the browser's open/close, keep it placed, and put focus on the first (or last) item.
  React.useEffect(() => {
    const el = menu.current;
    if (!el) return;
    const reposition = () => btn.current && place(el, btn.current, side, align, 4);
    const onToggle = (e: Event) => {
      const now = (e as ToggleEvent).newState === "open";
      if (now) {
        reposition(); window.addEventListener("scroll", reposition, true); window.addEventListener("resize", reposition);
        move(focusLast.current ? -1 : 0); focusLast.current = false;
      } else { window.removeEventListener("scroll", reposition, true); window.removeEventListener("resize", reposition); }
      if (open === undefined) setInner(now);
      onOpenChange?.(now);
    };
    el.addEventListener("toggle", onToggle);
    return () => { el.removeEventListener("toggle", onToggle); window.removeEventListener("scroll", reposition, true); window.removeEventListener("resize", reposition); };
  }, [side, align, open, onOpenChange]);

  React.useEffect(() => {
    const el = menu.current;
    if (!el?.showPopover) return;
    const shown = el.matches(":popover-open");
    if (isOpen && !shown) el.showPopover();
    if (!isOpen && shown) el.hidePopover();
  }, [isOpen]);

  const typed = React.useRef({ text: "", at: 0 });
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    rest.onKeyDown?.(e);
    const all = items(), at = all.indexOf(document.activeElement as HTMLButtonElement);
    if (e.key === "ArrowDown") { e.preventDefault(); move(at + 1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); move(at < 0 ? -1 : at - 1); }
    else if (e.key === "Home") { e.preventDefault(); move(0); }
    else if (e.key === "End") { e.preventDefault(); move(-1); }
    else if (e.key === "Tab") { e.preventDefault(); close(); }
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

  const t = trigger.props;
  const tRef = t.ref;
  const triggerEl = React.cloneElement(trigger, {
    id: t.id ?? `${id}-trigger`,
    popoverTarget: id,
    "aria-haspopup": "menu",
    "aria-expanded": isOpen,
    onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => {
      t.onKeyDown?.(e);
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      e.preventDefault();
      focusLast.current = e.key === "ArrowUp";
      if (!menu.current?.matches(":popover-open")) menu.current?.showPopover();
      else move(focusLast.current ? -1 : 0);
    },
    ref: (node: HTMLButtonElement | null) => {
      btn.current = node;
      if (typeof tRef === "function") tRef(node);
      else if (tRef) (tRef as React.RefObject<HTMLButtonElement | null>).current = node;
    },
  } as React.ButtonHTMLAttributes<HTMLButtonElement>);

  return (
    <MenuContext.Provider value={{ close }}>
      {triggerEl}
      <div
        {...rest}
        ref={menu}
        id={id}
        popover="auto"
        role="menu"
        aria-labelledby={t.id ?? `${id}-trigger`}
        data-side={side === "bottom" ? undefined : side}
        data-align={align === "start" ? undefined : align}
        className={cx("vin-menu", className)}
        onKeyDown={onKeyDown}
        onPointerMove={onPointerMove}
      >
        {children}
      </div>
    </MenuContext.Provider>
  );
}

type ItemBase = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "role" | "onSelect">;

export type DropdownMenuItemProps = ItemBase & {
  /** Called when the item is chosen. Call event.preventDefault() to keep the menu open. */
  onSelect?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  icon?: React.ReactNode;
  /** A keyboard shortcut shown at the end, e.g. "⌘B". */
  shortcut?: React.ReactNode;
  /** For an action that deletes. */
  danger?: boolean;
};

export function DropdownMenuItem({ onSelect, icon, shortcut, danger, className, children, onClick, ...rest }: DropdownMenuItemProps) {
  const { close } = React.useContext(MenuContext);
  return (
    <button
      type="button"
      {...rest}
      role="menuitem"
      tabIndex={-1}
      className={cx("vin-menu__item", danger && "vin-menu__item--danger", className)}
      onClick={(e) => { onClick?.(e); onSelect?.(e); if (!e.defaultPrevented) close(); }}
    >
      {icon}{children}
      {shortcut != null && <span className="vin-menu__shortcut" aria-hidden="true">{shortcut}</span>}
    </button>
  );
}

export type DropdownMenuCheckboxItemProps = ItemBase & {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

/** An option that turns on and off. The menu stays open. */
export function DropdownMenuCheckboxItem({ checked, defaultChecked = false, onCheckedChange, className, onClick, children, ...rest }: DropdownMenuCheckboxItemProps) {
  const [inner, setInner] = React.useState(defaultChecked);
  const on = checked ?? inner;
  return (
    <button
      type="button"
      {...rest}
      role="menuitemcheckbox"
      aria-checked={on}
      tabIndex={-1}
      className={cx("vin-menu__item", className)}
      onClick={(e) => { onClick?.(e); if (checked === undefined) setInner(!on); onCheckedChange?.(!on); }}
    >
      {children}
    </button>
  );
}

const RadioContext = React.createContext<{ value?: string; set: (v: string) => void }>({ set: () => {} });

export type DropdownMenuRadioGroupProps = Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue"> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Name for the group, read by screen readers. */
  label: string;
};

/** A set of options where one is picked. The menu stays open. */
export function DropdownMenuRadioGroup({ value, defaultValue, onValueChange, label, children, ...rest }: DropdownMenuRadioGroupProps) {
  const [inner, setInner] = React.useState(defaultValue);
  const current = value ?? inner;
  const set = (v: string) => { if (value === undefined) setInner(v); onValueChange?.(v); };
  return (
    <RadioContext.Provider value={{ value: current, set }}>
      <div {...rest} role="group" aria-label={label}>{children}</div>
    </RadioContext.Provider>
  );
}

export function DropdownMenuRadioItem({ value, className, onClick, children, ...rest }: ItemBase & { value: string }) {
  const group = React.useContext(RadioContext);
  return (
    <button
      type="button"
      {...rest}
      role="menuitemradio"
      aria-checked={group.value === value}
      tabIndex={-1}
      className={cx("vin-menu__item", className)}
      onClick={(e) => { onClick?.(e); group.set(value); }}
    >
      {children}
    </button>
  );
}

/** A heading for a group of items. */
export function DropdownMenuLabel({ className, ...rest }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p {...rest} role="presentation" className={cx("vin-menu__label", className)} />;
}

export function DropdownMenuSeparator({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...rest} role="separator" className={cx("vin-menu__separator", className)} />;
}
