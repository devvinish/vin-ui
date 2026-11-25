import * as React from "react";

/*
 * VinUI · Spinner (React). API: spec/spinner.json.
 * On its own: role="status" with a label. Next to text that says what's loading: decorative (hidden).
 */

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

export type SpinnerProps = React.HTMLAttributes<HTMLSpanElement> & {
  size?: "sm" | "md" | "lg";
  /** "primary" uses the accent colour; the default takes the text colour. */
  variant?: "current" | "primary";
  /** What screen readers hear. Default: "Loading". */
  label?: string;
  /** Hide it from screen readers, when text next to it already says it. */
  decorative?: boolean;
};

export function Spinner({ size = "md", variant = "current", label = "Loading", decorative, className, ...rest }: SpinnerProps) {
  const a11y = decorative ? { "aria-hidden": true as const } : { role: "status", "aria-label": label };
  return (
    <span
      {...a11y}
      {...rest}
      className={cx("vin-spinner", size !== "md" && `vin-spinner--${size}`, variant === "primary" && "vin-spinner--primary", className)}
    />
  );
}

export type LoadingProps = React.HTMLAttributes<HTMLDivElement> & Pick<SpinnerProps, "size" | "variant">;

/** A spinner with a message. Screen readers announce the message. */
export function Loading({ size, variant, className, children, ...rest }: LoadingProps) {
  return (
    <div role="status" {...rest} className={cx("vin-loading", className)}>
      <Spinner size={size} variant={variant} decorative />
      {children}
    </div>
  );
}
