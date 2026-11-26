"use client";

import * as React from "react";

/*
 * VinUI · Input Group (React). API: spec/input-group.json.
 * An input with text, icons or buttons attached. With `label`, it renders the field for you.
 */

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

export type InputGroupProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> & {
  /** Shown before the input: text, an icon or a small Button. */
  start?: React.ReactNode;
  /** Shown after the input. */
  end?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  label?: React.ReactNode;
  hint?: React.ReactNode;
  /** Error message. Also marks the input invalid. */
  error?: React.ReactNode;
  ref?: React.Ref<HTMLInputElement>;
};

// forwardRef so `ref` works on React 18 as well as 19.
export const InputGroup = React.forwardRef<HTMLInputElement, InputGroupProps>(function InputGroup({ start, end, size = "md", label, hint, error, id, className, style, ...rest }, ref) {
  const auto = React.useId();
  const inputId = id ?? `vin-${auto.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const group = (
    <div
      className={cx("vin-input", "vin-input-group", size !== "md" && `vin-input--${size}`, !label && className)}
      style={label ? undefined : style}
      onPointerDown={(e) => {
        // Clicking the padding or an addon's text focuses the input (not when clicking a button).
        if (!(e.target as HTMLElement).closest("button, a, input")) { e.preventDefault(); document.getElementById(inputId)?.focus(); }
      }}
    >
      {start !== undefined && <span className="vin-input-group__addon">{start}</span>}
      <input
        {...rest} ref={ref}
        id={inputId}
        className="vin-input-group__input"
        aria-invalid={error ? true : rest["aria-invalid"]}
        aria-describedby={cx(rest["aria-describedby"], errorId, hintId) || undefined}
      />
      {end !== undefined && <span className="vin-input-group__addon">{end}</span>}
    </div>
  );
  if (!label) return group;
  return (
    <div className={cx("vin-field", className)} style={style}>
      <label className="vin-label" htmlFor={inputId}>{label}</label>
      {group}
      {error && <p className="vin-error" id={errorId}>{error}</p>}
      {hint && <p className="vin-hint" id={hintId}>{hint}</p>}
    </div>
  );
});
