"use client";

import * as React from "react";

/** Dev-only warnings, without needing Node's `process` (Vite and the browser don't have it). */
const isDev = () => (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV !== "production";

/*
 * VinUI · Toggle (React). API: spec/toggle.json.
 * A button that stays pressed: aria-pressed tells screen readers its state.
 */

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

export type ToggleProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type"> & {
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  variant?: "default" | "outline";
  /** "icon" is square, for icon-only toggles (give them an aria-label). */
  size?: "sm" | "md" | "lg" | "icon";
  ref?: React.Ref<HTMLButtonElement>;
};

/** The class list for a toggle. */
export function toggleClasses({ variant = "default", size = "md", className }: Pick<ToggleProps, "variant" | "size" | "className"> = {}) {
  return cx("vin-toggle", variant === "outline" && "vin-toggle--outline", size !== "md" && `vin-toggle--${size}`, className);
}

export function Toggle({ pressed, defaultPressed = false, onPressedChange, variant, size, className, onClick, ...rest }: ToggleProps) {
  const [inner, setInner] = React.useState(defaultPressed);
  const on = pressed ?? inner;
  if (isDev() && size === "icon" && !rest["aria-label"] && !rest["aria-labelledby"]) {
    console.warn("VinUI Toggle: icon-only toggles need an aria-label.");
  }
  return (
    <button
      {...rest}
      type="button"
      aria-pressed={on}
      className={toggleClasses({ variant, size, className })}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        if (pressed === undefined) setInner(!on);
        onPressedChange?.(!on);
      }}
    />
  );
}
