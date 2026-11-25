"use client";

import * as React from "react";

/*
 * VinUI · Radio Group (React). API: spec/radio-group.json.
 * Native radios in a fieldset: arrow keys, forms and screen readers work with no extra code.
 */

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

export type RadioOption = string | { value: string; label: React.ReactNode; description?: React.ReactNode; disabled?: boolean };
const norm = (o: RadioOption) => (typeof o === "string" ? { value: o, label: o as React.ReactNode } : o);

export type RadioGroupProps = Omit<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, "onChange" | "defaultValue"> & {
  /** The group's name, shown as the legend. */
  label: React.ReactNode;
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Form field name. Generated if you leave it out. */
  name?: string;
  orientation?: "vertical" | "horizontal";
  /** "cards" draws each option as a bordered card. */
  variant?: "default" | "cards";
  /** Error message. Also marks the radios invalid. */
  error?: React.ReactNode;
};

export function RadioGroup({
  label, options, value, defaultValue, onValueChange, name, orientation = "vertical", variant = "default",
  error, disabled, className, ...rest
}: RadioGroupProps) {
  const auto = React.useId();
  const base = `vin-${auto.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const groupName = name ?? base;
  const errorId = error ? `${base}-error` : undefined;
  return (
    <fieldset
      {...rest}
      disabled={disabled}
      aria-describedby={cx(rest["aria-describedby"], errorId) || undefined}
      className={cx("vin-radio-group", orientation === "horizontal" && "vin-radio-group--horizontal", variant === "cards" && "vin-radio-group--cards", className)}
    >
      <legend className="vin-radio-group__legend">{label}</legend>
      {options.map(norm).map((o, i) => {
        const id = `${base}-${i}`;
        const descId = o.description ? `${id}-desc` : undefined;
        const state = value !== undefined
          ? { checked: value === o.value, onChange: () => onValueChange?.(o.value) }
          : { defaultChecked: defaultValue === o.value, onChange: () => onValueChange?.(o.value) };
        return (
          <div className="vin-choice" key={o.value}>
            <input
              {...state}
              type="radio"
              className="vin-radio"
              id={id}
              name={groupName}
              value={o.value}
              disabled={o.disabled}
              aria-invalid={error ? true : undefined}
              aria-describedby={descId}
            />
            <div className="vin-choice__body">
              <label className="vin-choice__label" htmlFor={id}>{o.label}</label>
              {o.description && <p className="vin-choice__desc" id={descId}>{o.description}</p>}
            </div>
          </div>
        );
      })}
      {error && <p className="vin-error" id={errorId}>{error}</p>}
    </fieldset>
  );
}
