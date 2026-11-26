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

// forwardRef so `ref` works on React 18 as well as 19.
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(function Badge({ variant, dot, className, children, ...rest }, ref) {
  return (
    <span {...rest} ref={ref} className={badgeClasses({ variant, className })}>
      {dot && <span className="vin-badge__dot" aria-hidden="true" />}
      {children}
    </span>
  );
});
