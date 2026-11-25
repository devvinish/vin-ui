import * as React from "react";

/*
 * VinUI · Badge (React)
 * API: spec/badge.json. Styling comes from @vinui/styles (the vin-badge classes),
 * so this file is the same for all 8 styles.
 */

export type BadgeVariant = "neutral" | "primary" | "success" | "warning" | "danger" | "outline";

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  /** Colour and meaning. Default: "neutral". */
  variant?: BadgeVariant;
  /** Show a status dot before the label. */
  dot?: boolean;
  ref?: React.Ref<HTMLSpanElement>;
};

/** The class list for a badge. */
export function badgeClasses({ variant = "neutral", className }: { variant?: BadgeVariant; className?: string } = {}): string {
  return ["vin-badge", variant !== "neutral" && `vin-badge--${variant}`, className].filter(Boolean).join(" ");
}

export function Badge({ variant, dot, className, children, ...rest }: BadgeProps) {
  return (
    <span {...rest} className={badgeClasses({ variant, className })}>
      {dot && <span className="vin-badge__dot" aria-hidden="true" />}
      {children}
    </span>
  );
}
