"use client";

import * as React from "react";

/** Dev-only warnings, without needing Node's `process` (Vite and the browser don't have it). */
const isDev = () => (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV !== "production";

/*
 * VinUI · Checkbox (React). API: spec/checkbox.json.
 * A real <input type="checkbox">. With `label`, it renders the label and description for you.
 */

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");
const useVinId = (id?: string) => {
  const auto = React.useId();
  return id ?? `vin-${auto.replace(/[^a-zA-Z0-9_-]/g, "")}`;
};

export type CheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  /** Visible label, linked to the checkbox. Without it, pass an aria-label. */
  label?: React.ReactNode;
  /** Smaller text under the label, read out with the checkbox. */
  description?: React.ReactNode;
  /** Show the "some selected" dash. */
  indeterminate?: boolean;
  /** Put the checkbox after the text, full width. Default: "start". */
  controlPosition?: "start" | "end";
  ref?: React.Ref<HTMLInputElement>;
};

// forwardRef so `ref` works on React 18 as well as 19.
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox({ label, description, indeterminate = false, controlPosition = "start", id, className, style, ...rest }, ref) {
  const inner = React.useRef<HTMLInputElement | null>(null);
  React.useEffect(() => { if (inner.current) inner.current.indeterminate = indeterminate; }, [indeterminate]);
  const setRef = (el: HTMLInputElement | null) => {
    inner.current = el;
    if (typeof ref === "function") ref(el);
    else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = el;
  };
  const inputId = useVinId(id);
  const descId = description ? `${inputId}-desc` : undefined;

  if (!label) {
    if (isDev() && !rest["aria-label"] && !rest["aria-labelledby"]) {
      console.warn("VinUI Checkbox: pass a label or an aria-label.");
    }
    return <input {...rest} ref={setRef} id={id} type="checkbox" className={cx("vin-checkbox", className)} style={style} />;
  }
  return (
    <div className={cx("vin-choice", controlPosition === "end" && "vin-choice--end", className)} style={style}>
      <input {...rest} ref={setRef} id={inputId} type="checkbox" className="vin-checkbox" aria-describedby={cx(rest["aria-describedby"], descId) || undefined} />
      <div className="vin-choice__body">
        <label className="vin-choice__label" htmlFor={inputId}>{label}</label>
        {description && <p className="vin-choice__desc" id={descId}>{description}</p>}
      </div>
    </div>
  );
});
