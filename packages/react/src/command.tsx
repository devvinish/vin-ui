"use client";

import * as React from "react";

/*
 * VinUI · Command (React). API: spec/command.json.
 * A search box that filters a list of commands (WAI-ARIA combobox + listbox). Use it inline, or as a
 * ⌘K palette with <CommandDialog>.
 *   <Command groups={[{ heading: "Pages", items: [{ value: "home", label: "Home" }] }]} onSelect={go} />
 */

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");
const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export type CommandItem = {
  value: string;
  label: string;
  icon?: React.ReactNode;
  /** Shown at the end, e.g. "⌘P". Hidden from screen readers. */
  shortcut?: string;
  /** Extra words that match, e.g. "payment invoice" for Billing. */
  keywords?: string;
  /** Go to this page when chosen. */
  href?: string;
  disabled?: boolean;
  onSelect?: () => void;
};
export type CommandGroup = { heading?: string; items: CommandItem[] };

export type CommandProps = Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> & {
  groups: CommandGroup[];
  /** Called with the chosen command's value. */
  onSelect?: (value: string) => void;
  placeholder?: string;
  emptyText?: React.ReactNode;
  /** Name for the search box. Default "Search commands". */
  label?: string;
  /** Show key hints under the list. */
  footer?: boolean;
  /** Your own matching. The default needs every typed word in the label or keywords. */
  filter?: (item: CommandItem, query: string) => boolean;
};

const defaultFilter = (item: CommandItem, q: string) => {
  const hay = fold(`${item.label} ${item.keywords ?? ""}`);
  return fold(q).split(/\s+/).filter(Boolean).every((w) => hay.includes(w));
};

const SearchIcon = () => (
  <svg className="vin-command__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
  </svg>
);

/** Set by CommandDialog so choosing a command closes it, and opening it starts fresh. */
const DialogContext = React.createContext<{ close: () => void; openCount: number } | null>(null);

export function Command({
  groups, onSelect, placeholder = "Type a command or search…", emptyText = "No results found.", label = "Search commands",
  footer = false, filter = defaultFilter, className, ...rest
}: CommandProps) {
  const base = "vin-cmd-" + React.useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const dialog = React.useContext(DialogContext);
  const [query, setQuery] = React.useState("");
  const input = React.useRef<HTMLInputElement>(null);
  const flat = groups.flatMap((g, gi) => g.items.map((item, ii) => ({ item, gi, key: `${gi}-${ii}` })));
  const q = query.trim();
  const shown = flat.filter((x) => !q || filter(x.item, q));
  const usable = shown.filter((x) => !x.item.disabled);
  const [activeKey, setActiveKey] = React.useState<string | null>(null);
  const active = usable.find((x) => x.key === activeKey) ?? usable[0];

  // A fresh start each time the palette opens.
  React.useEffect(() => {
    if (!dialog) return;
    setQuery(""); setActiveKey(null);
    input.current?.focus();
  }, [dialog?.openCount]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    if (active) document.getElementById(`${base}-${active.key}`)?.scrollIntoView({ block: "nearest" });
  }, [active?.key]); // eslint-disable-line react-hooks/exhaustive-deps

  const run = (item: CommandItem | undefined) => {
    if (!item || item.disabled) return;
    item.onSelect?.();
    onSelect?.(item.value);
    dialog?.close();
    if (item.href) window.location.href = item.href;
  };
  const move = (step: number) => {
    if (!usable.length) return;
    const i = active ? usable.indexOf(active) : -1;
    setActiveKey(usable[(i + step + usable.length) % usable.length].key);
  };
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
    else if (e.key === "Home" && e.ctrlKey) { e.preventDefault(); setActiveKey(usable[0]?.key ?? null); }
    else if (e.key === "End" && e.ctrlKey) { e.preventDefault(); setActiveKey(usable[usable.length - 1]?.key ?? null); }
    else if (e.key === "Enter") { e.preventDefault(); run(active?.item); }
  };

  const listId = `${base}-list`;
  return (
    <div {...rest} className={cx("vin-command", className)}>
      <div className="vin-command__search">
        <SearchIcon />
        <input
          ref={input}
          className="vin-command__input"
          type="text"
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-autocomplete="list"
          aria-label={label}
          aria-activedescendant={active ? `${base}-${active.key}` : undefined}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setActiveKey(null); }}
          onKeyDown={onKeyDown}
        />
      </div>
      <div className="vin-command__list" id={listId} role="listbox" aria-label="Commands" onMouseDown={(e) => e.preventDefault()}>
        {groups.map((g, gi) => {
          const any = shown.some((x) => x.gi === gi);
          return (
            <React.Fragment key={gi}>
              {gi > 0 && <div className="vin-command__separator" role="presentation" hidden={!!q || undefined} />}
              <div className="vin-command__group" role="group" aria-labelledby={g.heading ? `${base}-g${gi}` : undefined} hidden={!any || undefined}>
                {g.heading && <div className="vin-command__label" id={`${base}-g${gi}`} role="presentation">{g.heading}</div>}
                {g.items.map((item, ii) => {
                  const key = `${gi}-${ii}`;
                  const visible = shown.some((x) => x.key === key);
                  const on = active?.key === key;
                  return (
                    <div
                      key={key}
                      id={`${base}-${key}`}
                      className="vin-command__item"
                      role="option"
                      aria-selected={on}
                      aria-disabled={item.disabled || undefined}
                      data-value={item.value}
                      data-active={on ? "" : undefined}
                      hidden={!visible || undefined}
                      onPointerMove={() => { if (!item.disabled && !on) setActiveKey(key); }}
                      onClick={() => run(item)}
                    >
                      {item.icon}{item.label}
                      {item.shortcut && <span className="vin-command__shortcut" aria-hidden="true">{item.shortcut}</span>}
                    </div>
                  );
                })}
              </div>
            </React.Fragment>
          );
        })}
      </div>
      <p className="vin-command__empty" role="status" hidden={shown.length > 0 || undefined}>{emptyText}</p>
      {footer && (
        <div className="vin-command__footer" aria-hidden="true">
          <span><kbd className="vin-kbd">↑</kbd><kbd className="vin-kbd">↓</kbd> to move</span>
          <span><kbd className="vin-kbd">↵</kbd> to open</span>
          <span><kbd className="vin-kbd">Esc</kbd> to close</span>
        </div>
      )}
    </div>
  );
}

export type CommandDialogProps = CommandProps & {
  /** The button that opens it. */
  trigger?: React.ReactElement<React.ButtonHTMLAttributes<HTMLButtonElement>>;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** ⌘ / Ctrl + this key toggles it. Default "k"; pass null for none. */
  shortcut?: string | null;
  /** Name for the dialog. Default "Command menu". */
  title?: string;
};

/** The ⌘K palette: Command in a modal dialog near the top of the screen. */
export function CommandDialog({ trigger, open, defaultOpen = false, onOpenChange, shortcut = "k", title = "Command menu", ...command }: CommandDialogProps) {
  const ref = React.useRef<HTMLDialogElement>(null);
  const [inner, setInner] = React.useState(defaultOpen);
  const isOpen = open ?? inner;
  const [openCount, setOpenCount] = React.useState(0);
  const setOpen = React.useCallback((v: boolean) => { if (open === undefined) setInner(v); onOpenChange?.(v); }, [open, onOpenChange]);

  React.useEffect(() => {
    const el = ref.current;
    if (!el?.showModal) return;
    if (isOpen && !el.open) { el.showModal(); setOpenCount((n) => n + 1); }
    if (!isOpen && el.open) el.close();
  }, [isOpen]);

  React.useEffect(() => {
    if (!shortcut) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.altKey && e.key.toLowerCase() === shortcut.toLowerCase()) {
        e.preventDefault();
        // Never on top of another dialog.
        if (ref.current?.open) setOpen(false);
        else if (!document.querySelector("dialog[open]")) setOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [shortcut, setOpen]);

  const ctx = React.useMemo(() => ({ close: () => ref.current?.close(), openCount }), [openCount]);
  return (
    <>
      {trigger && React.cloneElement(trigger, {
        "aria-haspopup": "dialog",
        "aria-keyshortcuts": shortcut ? `Meta+${shortcut.toUpperCase()} Control+${shortcut.toUpperCase()}` : undefined,
        onClick: (e: React.MouseEvent<HTMLButtonElement>) => { trigger.props.onClick?.(e); if (!e.defaultPrevented) setOpen(true); },
      } as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      <dialog
        ref={ref}
        className="vin-dialog vin-command-dialog"
        aria-label={title}
        onClose={() => { if (isOpen) setOpen(false); }}
        onClick={(e) => {
          if (e.target !== e.currentTarget) return;
          const r = e.currentTarget.getBoundingClientRect();
          if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) e.currentTarget.close();
        }}
      >
        <DialogContext.Provider value={ctx}>
          <Command {...command} />
        </DialogContext.Provider>
      </dialog>
    </>
  );
}
