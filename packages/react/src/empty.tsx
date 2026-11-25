import * as React from "react";

/*
 * VinUI · Empty (React). API: spec/empty.json.
 * What to show when there's nothing yet, with the next step.
 */

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

export type EmptyProps = Omit<React.HTMLAttributes<HTMLDivElement>, "title"> & {
  variant?: "default" | "outline";
  icon?: React.ReactNode;
  title?: React.ReactNode;
  /** Tag for the title. Use h2/h3 when it heads a section. Default: p. */
  titleAs?: React.ElementType;
  description?: React.ReactNode;
  actions?: React.ReactNode;
};

export function Empty({ variant = "default", icon, title, titleAs: Title = "p", description, actions, className, children, ...rest }: EmptyProps) {
  return (
    <div {...rest} className={cx("vin-empty", variant === "outline" && "vin-empty--outline", className)}>
      {icon != null && <div className="vin-empty__media">{icon}</div>}
      {title != null && <Title className="vin-empty__title">{title}</Title>}
      {description != null && <p className="vin-empty__description">{description}</p>}
      {children}
      {actions != null && <div className="vin-empty__actions">{actions}</div>}
    </div>
  );
}
