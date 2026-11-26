"use client";

import * as React from "react";
import { createPortal } from "react-dom";

/*
 * VinUI · Toast (React). API: spec/toast.json.
 * Put <Toaster /> once in your app, then call toast({ title, description, variant, action }) from anywhere.
 * The timer pauses while the pointer or focus is on a toast.
 */

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

export type ToastVariant = "default" | "success" | "danger";
export type ToastOptions = {
  title: React.ReactNode;
  description?: React.ReactNode;
  variant?: ToastVariant;
  action?: { label: string; onClick: () => void };
  /** Milliseconds. Default 5000. */
  duration?: number;
};
type Entry = ToastOptions & { id: number; leaving?: boolean };

let entries: Entry[] = [];
let nextId = 0;
const listeners = new Set<(e: Entry[]) => void>();
const emit = () => listeners.forEach((l) => l(entries));

/** Show a toast. Returns its id, for dismissToast(id). */
export function toast(options: ToastOptions | string): number {
  const opts = typeof options === "string" ? { title: options } : options;
  const id = ++nextId;
  entries = [...entries, { ...opts, id }];
  emit();
  return id;
}

/** Close a toast early. */
export function dismissToast(id: number) {
  if (!entries.some((t) => t.id === id && !t.leaving)) return;
  entries = entries.map((t) => (t.id === id ? { ...t, leaving: true } : t));
  emit();
  setTimeout(() => { entries = entries.filter((t) => t.id !== id); emit(); }, 160);
}

const svg = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;
const ICONS: Partial<Record<ToastVariant, React.ReactNode>> = {
  success: <><circle cx="12" cy="12" r="9" /><path d="m8.5 12 2.5 2.5 4.5-5" /></>,
  danger: <><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5" /><path d="M12 16h.01" /></>,
};

export type ToastProps = Omit<React.HTMLAttributes<HTMLDivElement>, "title"> & Omit<ToastOptions, "duration"> & {
  onClose?: () => void;
};

/** One toast. <Toaster> uses it; you can also show one inline. */
export function Toast({ title, description, variant = "default", action, onClose, className, ...rest }: ToastProps) {
  return (
    <div {...rest} className={cx("vin-toast", variant !== "default" && `vin-toast--${variant}`, className)}>
      {ICONS[variant] && <svg {...svg} className="vin-toast__icon">{ICONS[variant]}</svg>}
      <div className="vin-toast__content">
        <p className="vin-toast__title">{title}</p>
        {description != null && <p className="vin-toast__description">{description}</p>}
        {action && (
          <div className="vin-toast__actions">
            <button type="button" className="vin-btn vin-btn--outline vin-btn--sm" onClick={action.onClick}>{action.label}</button>
          </div>
        )}
      </div>
      <button type="button" className="vin-btn vin-btn--ghost vin-btn--icon vin-toast__close" aria-label="Close" onClick={onClose}>
        <svg {...svg}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
      </button>
    </div>
  );
}

function Live({ entry }: { entry: Entry }) {
  // Render the live region empty first, then the text, so screen readers announce it.
  const [ready, setReady] = React.useState(false);
  const timer = React.useRef<number | undefined>(undefined);
  const left = React.useRef(entry.duration ?? 5000);
  const started = React.useRef(0);
  const run = React.useCallback(() => { started.current = Date.now(); timer.current = window.setTimeout(() => dismissToast(entry.id), left.current); }, [entry.id]);
  const pause = () => { clearTimeout(timer.current); left.current -= Date.now() - started.current; };
  React.useEffect(() => { const f = requestAnimationFrame(() => setReady(true)); run(); return () => { cancelAnimationFrame(f); clearTimeout(timer.current); }; }, [run]);
  const role = entry.variant === "danger" ? "alert" : "status";
  if (!ready) return <div role={role} className={cx("vin-toast", entry.variant && entry.variant !== "default" && `vin-toast--${entry.variant}`)} />;
  return (
    <Toast
      role={role}
      title={entry.title}
      description={entry.description}
      variant={entry.variant}
      action={entry.action && { label: entry.action.label, onClick: () => { entry.action!.onClick(); dismissToast(entry.id); } }}
      onClose={() => dismissToast(entry.id)}
      data-leaving={entry.leaving ? "" : undefined}
      onPointerEnter={pause}
      onPointerLeave={run}
      onFocus={pause}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) run(); }}
    />
  );
}

let owner: symbol | null = null;

/** Where toasts appear. Put it once in your app (extra copies render nothing). */
export function Toaster({ label = "Notifications" }: { label?: string }) {
  const [list, setList] = React.useState<Entry[]>(entries);
  const [me] = React.useState(() => Symbol("toaster"));
  const [active, setActive] = React.useState(false);
  React.useEffect(() => {
    if (!owner) owner = me;
    setActive(owner === me);
    listeners.add(setList);
    setList(entries);
    return () => { listeners.delete(setList); if (owner === me) owner = null; };
  }, [me]);
  if (!active) return null;
  return createPortal(
    <section className="vin-toaster" aria-label={label}>
      {list.map((t) => <Live key={t.id} entry={t} />)}
    </section>,
    document.body,
  );
}
