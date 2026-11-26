"use client";

import * as React from "react";

/** Dev-only warnings, without needing Node's `process` (Vite and the browser don't have it). */
const isDev = () => (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV !== "production";

/*
 * VinUI · Button (React)
 * API: spec/button.json. Styling comes from @vinui/styles (the vin-btn classes),
 * so this file is the same for all 8 styles.
 */

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

type BaseProps = {
  /** Visual weight. Default: "primary". */
  variant?: ButtonVariant;
  /** Height and padding. "icon" makes a square button: give it an aria-label. Default: "md". */
  size?: ButtonSize;
};

export type ButtonAsButton = BaseProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined; ref?: React.Ref<HTMLButtonElement> };
export type ButtonAsLink = BaseProps &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; disabled?: boolean; ref?: React.Ref<HTMLAnchorElement> };
export type ButtonProps = ButtonAsButton | ButtonAsLink;

/** The class list for a button. Useful when you style a router's Link component. */
export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}): string {
  return [
    "vin-btn",
    variant !== "primary" && `vin-btn--${variant}`,
    size !== "md" && `vin-btn--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

// forwardRef so `ref` works on React 18 as well as 19. The cast keeps the button/link prop types apart.
export const Button = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(function Button(props, ref) {
  const { variant, size, className, children, ...rest } = props;
  const classes = buttonClasses({ variant, size, className });

  if (isDev() && size === "icon" && !rest["aria-label"] && !rest["aria-labelledby"]) {
    console.warn("VinUI Button: icon-only buttons need an aria-label so screen readers can name them.");
  }

  if (typeof rest.href === "string") {
    const { disabled, onClick, ...anchor } = rest as ButtonAsLink;
    return (
      <a
        {...anchor}
        ref={ref as React.Ref<HTMLAnchorElement>}
        className={classes}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : anchor.tabIndex}
        onClick={disabled ? (e) => e.preventDefault() : onClick}
      >
        {children}
      </a>
    );
  }

  const { type, ...button } = rest as ButtonAsButton;
  return (
    <button {...button} ref={ref as React.Ref<HTMLButtonElement>} type={type ?? "button"} className={classes}>
      {children}
    </button>
  );
}) as (props: ButtonProps) => React.ReactElement;
