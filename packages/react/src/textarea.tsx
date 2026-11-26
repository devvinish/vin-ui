"use client";

import * as React from "react";

/*
 * VinUI · Textarea (React). API: spec/textarea.json.
 * Multi-line text with label, hint, error, a character count (from maxLength) and optional auto-grow.
 */

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");
const canFieldSize = () => typeof CSS !== "undefined" && !!CSS.supports?.("field-sizing", "content");

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  /** Visible label. Without it, pass an aria-label. */
  label?: React.ReactNode;
  hint?: React.ReactNode;
  /** Error message. Also marks the textarea invalid. */
  error?: React.ReactNode;
  /** Grow with the content instead of scrolling (up to 260px, then it scrolls). */
  autoResize?: boolean;
  /** Show "12 / 280" under the field. On by default when maxLength is set. */
  showCount?: boolean;
  ref?: React.Ref<HTMLTextAreaElement>;
};

// forwardRef so `ref` works on React 18 as well as 19.
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ label, hint, error, autoResize = false, showCount, id, className, style, onChange, ...rest }, ref) {
  const auto = React.useId();
  const taId = id ?? `vin-${auto.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const inner = React.useRef<HTMLTextAreaElement | null>(null);
  const [typed, setTyped] = React.useState(String(rest.defaultValue ?? "").length);
  const length = rest.value !== undefined ? String(rest.value).length : typed;
  const max = rest.maxLength;
  const counted = (showCount ?? max !== undefined) && max !== undefined;

  const grow = React.useCallback(() => {
    const el = inner.current;
    if (!autoResize || !el || canFieldSize()) return;
    el.style.height = "auto";
    const cs = getComputedStyle(el);
    el.style.height = `${el.scrollHeight + parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth)}px`;
  }, [autoResize]);
  React.useLayoutEffect(grow, [grow, rest.value]);

  const setRef = (el: HTMLTextAreaElement | null) => {
    inner.current = el;
    if (typeof ref === "function") ref(el);
    else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
  };
  const cls = cx("vin-input", "vin-textarea", autoResize && "vin-textarea--auto");
  const handle = (e: React.ChangeEvent<HTMLTextAreaElement>) => { setTyped(e.target.value.length); grow(); onChange?.(e); };

  if (!label) {
    return <textarea {...rest} ref={setRef} id={id} className={cx(cls, className)} style={style} onChange={handle} />;
  }
  const hintId = hint ? `${taId}-hint` : undefined;
  const errorId = error ? `${taId}-error` : undefined;
  const countId = counted ? `${taId}-count` : undefined;
  return (
    <div className={cx("vin-field", className)} style={style}>
      <label className="vin-label" htmlFor={taId}>{label}</label>
      <textarea
        {...rest}
        ref={setRef}
        id={taId}
        className={cls}
        onChange={handle}
        aria-invalid={error ? true : rest["aria-invalid"]}
        aria-describedby={cx(rest["aria-describedby"], errorId, hintId, countId) || undefined}
      />
      {error && <p className="vin-error" id={errorId}>{error}</p>}
      {(hint || counted) && (
        <div className="vin-textarea__foot">
          {hint && <p className="vin-hint" id={hintId}>{hint}</p>}
          {counted && <p className="vin-textarea__count" id={countId} data-over={length >= max! ? "" : undefined}>{length} / {max}</p>}
        </div>
      )}
    </div>
  );
});
