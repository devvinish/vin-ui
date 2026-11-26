"use client";

import * as React from "react";

/*
 * VinUI · Native Select (React). API: spec/native-select.json.
 * The browser's own <select>, drawn like an Input. With `label`, it renders the field for you.
 */

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

export type NativeSelectProps = Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> & {
  size?: "sm" | "md" | "lg";
  /** Visible label. Without it, pass an aria-label. */
  label?: React.ReactNode;
  hint?: React.ReactNode;
  /** Error message. Also marks the select invalid. */
  error?: React.ReactNode;
  ref?: React.Ref<HTMLSelectElement>;
};

// forwardRef so `ref` works on React 18 as well as 19.
export const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(function NativeSelect({ size = "md", label, hint, error, id, className, style, children, ...rest }, ref) {
  const auto = React.useId();
  const selectId = id ?? `vin-${auto.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const cls = cx("vin-input", "vin-native-select", size !== "md" && `vin-input--${size}`);
  if (!label) {
    return <select {...rest} ref={ref} id={id} className={cx(cls, className)} style={style}>{children}</select>;
  }
  const hintId = hint ? `${selectId}-hint` : undefined;
  const errorId = error ? `${selectId}-error` : undefined;
  return (
    <div className={cx("vin-field", className)} style={style}>
      <label className="vin-label" htmlFor={selectId}>{label}</label>
      <select
        {...rest} ref={ref}
        id={selectId}
        className={cls}
        aria-invalid={error ? true : rest["aria-invalid"]}
        aria-describedby={cx(rest["aria-describedby"], errorId, hintId) || undefined}
      >
        {children}
      </select>
      {error && <p className="vin-error" id={errorId}>{error}</p>}
      {hint && <p className="vin-hint" id={hintId}>{hint}</p>}
    </div>
  );
});
