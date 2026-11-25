import * as React from "react";

/*
 * VinUI · Input OTP (React). API: spec/input-otp.json.
 * One real <input autocomplete="one-time-code">, drawn as separate boxes. Paste, SMS autofill,
 * password managers and screen readers all see a normal text field.
 */

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

export type InputOTPProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "onChange" | "size" | "maxLength" | "type"> & {
  /** Number of characters. Default: 6. */
  length?: number;
  /** Split the boxes into groups, e.g. [3, 3]. Default: one group. */
  groups?: number[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Called once every box is filled. */
  onComplete?: (value: string) => void;
  /** "numeric" (default) or "alphanumeric". */
  charset?: "numeric" | "alphanumeric";
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  ref?: React.Ref<HTMLInputElement>;
};

export function InputOTP({
  length = 6, groups, value, defaultValue = "", onValueChange, onComplete, charset = "numeric",
  label, hint, error, id, className, style, onFocus, onBlur, ...rest
}: InputOTPProps) {
  const auto = React.useId();
  const inputId = id ?? `vin-${auto.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const [inner, setInner] = React.useState(defaultValue);
  const [focused, setFocused] = React.useState(false);
  const current = (value ?? inner).slice(0, length);
  const re = charset === "numeric" ? /\D/g : /[^a-z0-9]/gi;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const sizes = groups ?? [length];

  const atEnd = (el: HTMLInputElement) => requestAnimationFrame(() => el.setSelectionRange(el.value.length, el.value.length));
  const change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value.replace(re, "").slice(0, length);
    if (value === undefined) setInner(next);
    onValueChange?.(next);
    if (next.length === length && current.length !== length) onComplete?.(next);
  };

  let n = 0;
  const control = (
    <div className={cx("vin-otp", !label && className)} style={label ? undefined : style}>
      <input
        {...rest}
        id={inputId}
        className="vin-otp__input"
        type="text"
        inputMode={charset === "numeric" ? "numeric" : "text"}
        autoComplete="one-time-code"
        pattern={charset === "numeric" ? "[0-9]*" : "[A-Za-z0-9]*"}
        maxLength={length}
        value={current}
        onChange={change}
        onFocus={(e) => { setFocused(true); atEnd(e.currentTarget); onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); onBlur?.(e); }}
        onClick={(e) => atEnd(e.currentTarget)}
        onKeyUp={(e) => atEnd(e.currentTarget)}
        aria-invalid={error ? true : rest["aria-invalid"]}
        aria-describedby={cx(rest["aria-describedby"], errorId, hintId) || undefined}
      />
      <div className="vin-otp__slots" aria-hidden="true">
        {sizes.map((count, g) => (
          <React.Fragment key={g}>
            {g > 0 && <span className="vin-otp__sep" />}
            {Array.from({ length: count }, () => {
              const i = n++;
              const active = focused && i === Math.min(current.length, length - 1);
              return <span key={i} className="vin-input vin-otp__slot" data-active={active ? "" : undefined}>{current[i] ?? ""}</span>;
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
  if (!label) return control;
  return (
    <div className={cx("vin-field", className)} style={style}>
      <label className="vin-label" htmlFor={inputId}>{label}</label>
      {control}
      {error && <p className="vin-error" id={errorId}>{error}</p>}
      {hint && <p className="vin-hint" id={hintId}>{hint}</p>}
    </div>
  );
}
