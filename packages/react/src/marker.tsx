"use client";

import * as React from "react";

/*
 * VinUI · Marker (React). API: spec/marker.json.
 * Marker: a numbered citation chip that links to its source and previews it on hover and focus.
 * StatusMarker: what the assistant is doing ("Searching…", "Done", "Error"), inline in a reply.
 */

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

export type MarkerProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "title" | "children"> & {
  /** The number shown in the chip. */
  index: number | string;
  /** Where the source lives. */
  href: string;
  /** The source's title, shown in the preview and read out by screen readers. */
  title?: string;
  /** Where it's from, e.g. a domain. */
  source?: string;
};

export function Marker({ index, href, title, source, className, onMouseEnter, onMouseLeave, onFocus, onBlur, ...rest }: MarkerProps) {
  const [dismissed, setDismissed] = React.useState(false);
  const active = React.useRef(0);

  // Escape hides the preview without moving the pointer or focus (WCAG 1.4.13).
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && active.current > 0) setDismissed(true); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  const enter = () => { active.current++; };
  const leave = () => { active.current = Math.max(0, active.current - 1); if (!active.current) setDismissed(false); };

  const label = [`Source ${index}`, title && `: ${title}`, source && `, ${source}`].filter(Boolean).join("");
  return (
    <a
      aria-label={label}
      {...rest}
      href={href}
      className={cx("vin-marker", className)}
      data-dismissed={dismissed || undefined}
      onMouseEnter={(e) => { enter(); onMouseEnter?.(e); }}
      onMouseLeave={(e) => { leave(); onMouseLeave?.(e); }}
      onFocus={(e) => { enter(); onFocus?.(e); }}
      onBlur={(e) => { leave(); onBlur?.(e); }}
    >
      {index}
      {title && (
        <span className="vin-marker__preview" aria-hidden="true">
          <span className="vin-marker__title">{title}</span>
          {source && <span className="vin-marker__source">{source}</span>}
        </span>
      )}
    </a>
  );
}

const Icon = ({ children }: { children: React.ReactNode }) => (
  <svg className="vin-marker__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);

export type StatusMarkerProps = React.HTMLAttributes<HTMLSpanElement> & {
  /** "running" shows a spinner, "done" a check, "error" a warning sign. Default: "running". */
  status?: "running" | "done" | "error";
  /** Announce changes to screen readers (role="status"). Default: true while running. */
  live?: boolean;
};

export function StatusMarker({ status = "running", live, className, children, ...rest }: StatusMarkerProps) {
  const isLive = live ?? status === "running";
  return (
    <span
      role={isLive ? "status" : undefined}
      {...rest}
      className={cx("vin-marker vin-marker--status", status === "done" && "vin-marker--success", status === "error" && "vin-marker--danger", className)}
    >
      {status === "running" && <span className="vin-spinner vin-spinner--sm" aria-hidden="true" />}
      {status === "done" && <Icon><circle cx="12" cy="12" r="9" /><path d="m8.5 12 2.5 2.5 4.5-5" /></Icon>}
      {status === "error" && <Icon><circle cx="12" cy="12" r="9" /><path d="M12 8v4.5" /><path d="M12 16h.01" /></Icon>}
      {children}
    </span>
  );
}
