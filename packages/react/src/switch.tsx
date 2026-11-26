"use client";

import * as React from "react";

/** Dev-only warnings, without needing Node's `process` (Vite and the browser don't have it). */
const isDev = () => (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV !== "production";

/*
 * VinUI · Switch (React). API: spec/switch.json.
 * A real checkbox with role="switch": works in forms, no extra state needed.
 */

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

export type SwitchProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size" | "role"> & {
  /** Visible label, linked to the switch. Without it, pass an aria-label. */
  label?: React.ReactNode;
  /** Smaller text under the label, read out with the switch. */
  description?: React.ReactNode;
  size?: "sm" | "md";
  /** Put the switch after the text, full width (settings rows). Default: "start". */
  controlPosition?: "start" | "end";
  ref?: React.Ref<HTMLInputElement>;
};

// forwardRef so `ref` works on React 18 as well as 19.
export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(function Switch({ label, description, size = "md", controlPosition = "start", id, className, style, ...rest }, ref) {
  const auto = React.useId();
  const inputId = id ?? `vin-${auto.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const descId = description ? `${inputId}-desc` : undefined;
  const cls = cx("vin-switch", size === "sm" && "vin-switch--sm");

  if (!label) {
    if (isDev() && !rest["aria-label"] && !rest["aria-labelledby"]) {
      console.warn("VinUI Switch: pass a label or an aria-label.");
    }
    return <input {...rest} ref={ref} id={id} type="checkbox" role="switch" className={cx(cls, className)} style={style} />;
  }
  return (
    <div className={cx("vin-choice", controlPosition === "end" && "vin-choice--end", className)} style={style}>
      <input {...rest} ref={ref} id={inputId} type="checkbox" role="switch" className={cls} aria-describedby={cx(rest["aria-describedby"], descId) || undefined} />
      <div className="vin-choice__body">
        <label className="vin-choice__label" htmlFor={inputId}>{label}</label>
        {description && <p className="vin-choice__desc" id={descId}>{description}</p>}
      </div>
    </div>
  );
});
