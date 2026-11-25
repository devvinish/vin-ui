"use client";

import * as React from "react";

/*
 * VinUI · Pagination (React). API: spec/pagination.json.
 * With href, pages are links (good for SEO and new tabs). Without it, they're buttons and onPageChange is called.
 */

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

/** Pages to show: first, last, and `siblings` either side of `page`, with "…" for gaps. */
export function pageRange(page: number, count: number, siblings = 1): (number | "…")[] {
  if (count <= 1) return [1];
  const start = Math.max(2, page - siblings);
  const end = Math.min(count - 1, page + siblings);
  const out: (number | "…")[] = [1];
  // A gap of one page shows that page instead of "…".
  if (start === 3) out.push(2); else if (start > 3) out.push("…");
  for (let p = start; p <= end; p++) out.push(p);
  if (end === count - 2) out.push(count - 1); else if (end < count - 2) out.push("…");
  out.push(count);
  return out;
}

const svg = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;
const Left = () => <svg {...svg}><path d="m15 6-6 6 6 6" /></svg>;
const Right = () => <svg {...svg}><path d="m9 6 6 6-6 6" /></svg>;

export type PaginationProps = Omit<React.HTMLAttributes<HTMLElement>, "onChange"> & {
  page: number;
  count: number;
  href?: (page: number) => string;
  onPageChange?: (page: number) => void;
  siblings?: number;
  /** "Previous" and "Next" as words. */
  labels?: boolean;
  /** Previous, "Page 2 of 10", Next. */
  simple?: boolean;
};

export function Pagination({ page, count, href, onPageChange, siblings = 1, labels, simple, className, ...rest }: PaginationProps) {
  const go = (p: number, cls: string, children: React.ReactNode, extra: Record<string, unknown> = {}) => {
    const disabled = p < 1 || p > count;
    if (href) {
      return disabled
        ? <a className={cls} role="link" aria-disabled="true" {...extra}>{children}</a>
        : <a className={cls} href={href(p)} {...extra}>{children}</a>;
    }
    return <button type="button" className={cls} disabled={disabled} onClick={() => onPageChange?.(p)} {...extra}>{children}</button>;
  };
  const edge = simple ? "vin-btn vin-btn--outline vin-btn--sm" : labels ? "vin-btn vin-btn--ghost" : "vin-btn vin-btn--ghost vin-btn--icon";
  const prev = simple || labels
    ? go(page - 1, edge, <><Left /> Previous</>)
    : go(page - 1, edge, <Left />, { "aria-label": "Previous page" });
  const next = simple || labels
    ? go(page + 1, edge, <>Next <Right /></>)
    : go(page + 1, edge, <Right />, { "aria-label": "Next page" });
  return (
    <nav aria-label="Pagination" {...rest} className={cx("vin-pagination", className)}>
      <ul className="vin-pagination__list">
        <li>{prev}</li>
        {simple ? (
          <li><span className="vin-pagination__status">Page {page} of {count}</span></li>
        ) : (
          pageRange(page, count, siblings).map((p, i) => (
            <li key={i}>
              {p === "…" ? (
                <span className="vin-pagination__ellipsis" aria-hidden="true">…</span>
              ) : p === page ? (
                go(p, "vin-btn vin-btn--outline vin-pagination__page", p, { "aria-current": "page" })
              ) : (
                go(p, "vin-btn vin-btn--ghost vin-pagination__page", p)
              )}
            </li>
          ))
        )}
        <li>{next}</li>
      </ul>
    </nav>
  );
}
