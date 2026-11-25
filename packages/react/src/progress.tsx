import * as React from "react";

/*
 * VinUI · Progress (React). API: spec/progress.json.
 * Leave out `value` while the amount is unknown: the bar slides and has no aria-valuenow.
 */

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

export type ProgressProps = React.HTMLAttributes<HTMLDivElement> & {
  /** 0 to max. Leave it out for an indeterminate bar. */
  value?: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "success";
  /** Shown above the bar and used as its name. Without it, pass an aria-label. */
  label?: React.ReactNode;
  /** Show the percentage next to the label. */
  showValue?: boolean;
};

export function Progress({ value, max = 100, size = "md", variant = "default", label, showValue, className, style, ...rest }: ProgressProps) {
  const id = React.useId();
  const labelId = `vin-${id.replace(/[^a-zA-Z0-9_-]/g, "")}-label`;
  const known = value != null;
  const pct = known ? Math.round((Math.min(max, Math.max(0, value)) / max) * 100) : 0;
  const bar = (
    <div
      role="progressbar"
      aria-labelledby={label ? labelId : undefined}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={known ? pct : undefined}
      {...rest}
      className={cx("vin-progress", size !== "md" && `vin-progress--${size}`, variant === "success" && "vin-progress--success", !known && "vin-progress--indeterminate", !label && className)}
      style={{ ...(label ? {} : style), ...(known ? { ["--vin-value" as string]: `${pct}%` } : {}) }}
    />
  );
  if (!label) return bar;
  return (
    <div className={cx("vin-field", className)} style={style}>
      <div className="vin-progress__head">
        <span className="vin-label" id={labelId}>{label}</span>
        {showValue && known && <span className="vin-progress__value">{pct}%</span>}
      </div>
      {bar}
    </div>
  );
}
