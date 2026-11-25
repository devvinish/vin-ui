import * as React from "react";

/*
 * VinUI · Alert (React). API: spec/alert.json.
 * Each variant has a built-in icon. Pass onDismiss for a close button; focus then moves to the next control.
 */

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

type Variant = "neutral" | "primary" | "success" | "warning" | "danger";

const svg = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;
const PATHS: Record<Variant, React.ReactNode> = {
  neutral: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><path d="M12 8h.01" /></>,
  primary: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><path d="M12 8h.01" /></>,
  success: <><circle cx="12" cy="12" r="9" /><path d="m8.5 12 2.5 2.5 4.5-5" /></>,
  warning: <><path d="M10.3 4.2 2.8 17.5A2 2 0 0 0 4.5 20.5h15a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0z" /><path d="M12 9.5v4" /><path d="M12 17h.01" /></>,
  danger: <><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5" /><path d="M12 16h.01" /></>,
};

export type AlertProps = Omit<React.HTMLAttributes<HTMLDivElement>, "title"> & {
  variant?: Variant;
  title?: React.ReactNode;
  /** Your own icon, or false for none. Default: the variant's icon. */
  icon?: React.ReactNode | false;
  /** Buttons under the text. */
  actions?: React.ReactNode;
  /** Shows a close button. Remove the alert in this callback. */
  onDismiss?: () => void;
  /** The close button's name. Default: "Dismiss". */
  dismissLabel?: string;
};

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Alert({ variant = "neutral", title, icon, actions, onDismiss, dismissLabel = "Dismiss", className, children, ...rest }: AlertProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const dismiss = () => {
    const box = ref.current;
    if (box && box.contains(document.activeElement)) {
      // Focus the next control after the alert (or the one before it), so keyboard users stay in place.
      const all = [...document.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => !box.contains(el));
      const after = all.filter((el) => box.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING);
      (after[0] ?? all[all.length - after.length - 1])?.focus();
    }
    onDismiss?.();
  };
  const iconNode = icon === false ? null : icon ? icon : <svg {...svg}>{PATHS[variant]}</svg>;
  return (
    <div ref={ref} {...rest} className={cx("vin-alert", variant !== "neutral" && `vin-alert--${variant}`, className)}>
      {iconNode && (React.isValidElement<{ className?: string }>(iconNode)
        ? React.cloneElement(iconNode, { className: cx("vin-alert__icon", iconNode.props.className) })
        : iconNode)}
      <div className="vin-alert__content">
        {title != null && <p className="vin-alert__title">{title}</p>}
        {children != null && <p className="vin-alert__description">{children}</p>}
        {actions && <div className="vin-alert__actions">{actions}</div>}
      </div>
      {onDismiss && (
        <button type="button" className="vin-btn vin-btn--ghost vin-btn--icon vin-alert__close" aria-label={dismissLabel} onClick={dismiss}>
          <svg {...svg}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
        </button>
      )}
    </div>
  );
}
