import * as React from "react";

/*
 * VinUI · Input (React): Input, Textarea, Label and Field.
 * API: spec/input.json. Field wires up the label, hint and error for you.
 */

export type InputSize = "sm" | "md" | "lg";
const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

export type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> & {
  /** Height and text size, matching the Button sizes. Default: "md". */
  size?: InputSize;
  ref?: React.Ref<HTMLInputElement>;
};

/** The class list for an input. */
export function inputClasses({ size = "md", className }: { size?: InputSize; className?: string } = {}): string {
  return cx("vin-input", size !== "md" && `vin-input--${size}`, className);
}

export function Input({ size, className, ...rest }: InputProps) {
  if (process.env.NODE_ENV !== "production" && !rest.id && !rest["aria-label"] && !rest["aria-labelledby"]) {
    console.warn("VinUI Input: give it an id with a matching <Label htmlFor>, an aria-label, or use <Field label>.");
  }
  return <input {...rest} className={inputClasses({ size, className })} />;
}

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & { ref?: React.Ref<HTMLTextAreaElement> };
export function Textarea({ className, ...rest }: TextareaProps) {
  return <textarea {...rest} className={cx("vin-input", className)} />;
}

export function Label({ className, ...rest }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label {...rest} className={cx("vin-label", className)} />;
}

export type FieldProps = InputProps & {
  /** Visible label, linked to the input. */
  label: React.ReactNode;
  /** Help text under the input. */
  hint?: React.ReactNode;
  /** Error message. Also marks the input invalid. */
  error?: React.ReactNode;
  /** Render a textarea instead of an input. */
  multiline?: boolean;
  rows?: number;
};

/**
 * A labelled input with optional hint and error.
 * `className` and `style` go on the wrapper; every other prop goes to the input.
 */
export function Field({ label, hint, error, multiline, rows, id, className, style, size, ...rest }: FieldProps) {
  const auto = React.useId();
  const inputId = id ?? `vin-${auto.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = cx(rest["aria-describedby"], errorId, hintId) || undefined;
  const control = {
    id: inputId,
    "aria-describedby": describedBy,
    "aria-invalid": error ? (true as const) : rest["aria-invalid"],
  };

  return (
    <div className={cx("vin-field", className)} style={style}>
      <Label htmlFor={inputId}>{label}</Label>
      {multiline ? (
        <Textarea {...(rest as TextareaProps)} {...control} rows={rows} />
      ) : (
        <Input {...rest} {...control} size={size} />
      )}
      {error && <p className="vin-error" id={errorId}>{error}</p>}
      {hint && <p className="vin-hint" id={hintId}>{hint}</p>}
    </div>
  );
}
