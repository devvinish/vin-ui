import * as React from "react";

/*
 * VinUI · Breadcrumb (React). API: spec/breadcrumb.json.
 * items: top first. The last one is this page and gets aria-current="page".
 */

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

export type BreadcrumbItem = { label: React.ReactNode; href?: string };

export type BreadcrumbProps = React.HTMLAttributes<HTMLElement> & {
  items: BreadcrumbItem[];
  separator?: "slash" | "chevron";
  /** Render your router's link component instead of <a>. */
  linkAs?: React.ElementType;
};

export function Breadcrumb({ items, separator = "slash", linkAs: LinkTag = "a", className, ...rest }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" {...rest} className={cx("vin-breadcrumb", separator === "chevron" && "vin-breadcrumb--chevron", className)}>
      <ol className="vin-breadcrumb__list">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          // Long names are cut with "…"; keep the full name in the title.
          const title = typeof item.label === "string" && item.label.length > 22 ? item.label : undefined;
          return (
            <li key={i} className="vin-breadcrumb__item">
              {last ? (
                <span className="vin-breadcrumb__page" aria-current="page" title={title}>{item.label}</span>
              ) : (
                <LinkTag className="vin-breadcrumb__link" href={item.href} title={title}>{item.label}</LinkTag>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
