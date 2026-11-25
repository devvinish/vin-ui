import * as React from "react";

/*
 * VinUI · Item (React). API: spec/item.json.
 * A row: media, title and description, actions. Pass href to make the whole row a link.
 */

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

export type ItemProps = Omit<React.HTMLAttributes<HTMLElement>, "title"> & {
  variant?: "default" | "outline" | "muted";
  media?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  /** Makes the whole row a link. Don't put buttons in actions then. */
  href?: string;
};

export function Item({ variant = "default", media, title, description, actions, href, className, children, ...rest }: ItemProps) {
  const Tag = (href ? "a" : "div") as React.ElementType;
  return (
    <Tag {...rest} href={href} className={cx("vin-item", variant !== "default" && `vin-item--${variant}`, className)}>
      {media != null && <div className="vin-item__media">{media}</div>}
      <div className="vin-item__content">
        {title != null && <p className="vin-item__title">{title}</p>}
        {description != null && <p className="vin-item__description">{description}</p>}
        {children}
      </div>
      {actions != null && <div className="vin-item__actions">{actions}</div>}
    </Tag>
  );
}

/** A bordered list of items. Each child becomes a list item for screen readers. */
export function ItemGroup({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div role="list" {...rest} className={cx("vin-item-group", className)}>
      {React.Children.map(children, (child) =>
        React.isValidElement<{ role?: string }>(child) ? React.cloneElement(child, { role: child.props.role ?? "listitem" }) : child,
      )}
    </div>
  );
}
