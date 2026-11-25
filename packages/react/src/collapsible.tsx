"use client";

import * as React from "react";

/*
 * VinUI · Collapsible (React). API: spec/collapsible.json.
 * A native <details>: one section behind a small button.
 */

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

export type CollapsibleProps = Omit<React.DetailsHTMLAttributes<HTMLDetailsElement>, "open"> & {
  trigger: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Props for the content wrapper (className, style). */
  contentProps?: React.HTMLAttributes<HTMLDivElement>;
};

export function Collapsible({ trigger, open, defaultOpen = false, onOpenChange, contentProps, className, children, ...rest }: CollapsibleProps) {
  const [inner, setInner] = React.useState(defaultOpen);
  const isOpen = open ?? inner;
  return (
    <details
      {...rest}
      className={cx("vin-collapsible", className)}
      open={isOpen}
      onToggle={(e) => {
        const now = e.currentTarget.open;
        if (now === isOpen) return;
        if (open === undefined) setInner(now);
        onOpenChange?.(now);
      }}
    >
      <summary className="vin-collapsible__trigger">{trigger}</summary>
      <div {...contentProps} className={cx("vin-collapsible__content", contentProps?.className)}>{children}</div>
    </details>
  );
}
