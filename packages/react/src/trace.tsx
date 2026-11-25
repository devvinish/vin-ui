"use client";

import * as React from "react";

/*
 * VinUI · Trace (React). API: spec/trace.json.
 * What an agent did, step by step: an ordered list with a status icon, a title, the kind
 * and duration, and details behind a native <details>.
 */

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

export type TraceStatus = "done" | "running" | "error" | "pending";

const STATUS_LABEL: Record<TraceStatus, string> = { done: "Done", running: "Running", error: "Failed", pending: "Not started" };

const Svg = ({ children }: { children: React.ReactNode }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);

export type TraceProps = React.OlHTMLAttributes<HTMLOListElement> & {
  /** Name for the list. Default: "Agent steps". */
  label?: string;
};

export function Trace({ label = "Agent steps", className, ...rest }: TraceProps) {
  return <ol aria-label={label} {...rest} className={cx("vin-trace", className)} />;
}

export type TraceStepProps = Omit<React.LiHTMLAttributes<HTMLLIElement>, "title"> & {
  /** Default: "done". */
  status?: TraceStatus;
  /** What happened, e.g. "Searched the web". */
  title: React.ReactNode;
  /** The kind of step, e.g. "Tool call", "Thought" or "Result". */
  kind?: string;
  /** How long it took, e.g. "1.2s". */
  duration?: string;
  /** Your own text instead of kind and duration. */
  meta?: React.ReactNode;
  /** What screen readers hear for the status. Default: Done, Running, Failed or Not started. */
  statusLabel?: string;
  /** With details (children): open or closed. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Details: the input, output or error. Put code in <pre className="vin-trace__code">. */
  children?: React.ReactNode;
};

export function TraceStep({
  status = "done", title, kind, duration, meta, statusLabel, open, defaultOpen = false, onOpenChange, className, children, ...rest
}: TraceStepProps) {
  const [inner, setInner] = React.useState(defaultOpen);
  const isOpen = open ?? inner;
  const line = meta ?? ([kind, duration].filter(Boolean).join(" · ") || null);
  const head = (
    <>
      <span className="vin-trace__title">{title}</span>
      {line != null && <span className="vin-trace__meta">{line}</span>}
    </>
  );
  return (
    <li {...rest} className={cx("vin-trace__step", status !== "done" && `vin-trace__step--${status}`, className)}>
      <span className="vin-trace__icon" role="img" aria-label={statusLabel ?? STATUS_LABEL[status]}>
        {status === "done" && <Svg><path d="m5 12.5 4.5 4.5L19 7.5" /></Svg>}
        {status === "error" && <Svg><path d="M17 7 7 17" /><path d="m7 7 10 10" /></Svg>}
        {status === "running" && <span className="vin-spinner vin-spinner--sm" aria-hidden="true" />}
      </span>
      {children == null ? (
        <div className="vin-trace__head">{head}</div>
      ) : (
        <details
          className="vin-collapsible vin-trace__details"
          open={isOpen}
          onToggle={(e) => {
            const now = e.currentTarget.open;
            if (now === isOpen) return;
            if (open === undefined) setInner(now);
            onOpenChange?.(now);
          }}
        >
          <summary className="vin-collapsible__trigger vin-trace__head">{head}</summary>
          <div className="vin-collapsible__content vin-trace__body">{children}</div>
        </details>
      )}
    </li>
  );
}
