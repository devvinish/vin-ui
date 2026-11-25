import * as React from "react";

/*
 * VinUI · Typography (React). API: spec/typography.json.
 * The look (level, variant) and the tag (as) are separate, so headings can follow your page outline.
 */

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");
type As = { as?: React.ElementType };

export type HeadingProps = React.HTMLAttributes<HTMLHeadingElement> & As & {
  /** The size: 1 is the largest. Default 2. */
  level?: 1 | 2 | 3 | 4;
};

/** A heading. `level` sets the look; `as` sets the tag (default h1–h4 to match). */
export function Heading({ level = 2, as, className, ...rest }: HeadingProps) {
  const Tag = as ?? (`h${level}` as React.ElementType);
  return <Tag {...rest} className={cx(`vin-h${level}`, className)} />;
}

export type TextProps = React.HTMLAttributes<HTMLElement> & As & {
  variant?: "p" | "lead" | "muted" | "small";
};

export function Text({ variant = "p", as: Tag = "p", className, ...rest }: TextProps) {
  return <Tag {...rest} className={cx(`vin-${variant}`, className)} />;
}

export function Blockquote({ className, ...rest }: React.BlockquoteHTMLAttributes<HTMLQuoteElement>) {
  return <blockquote {...rest} className={cx("vin-blockquote", className)} />;
}

export type ListProps = React.HTMLAttributes<HTMLUListElement | HTMLOListElement> & { ordered?: boolean };

export function List({ ordered, className, ...rest }: ListProps) {
  const Tag = ordered ? "ol" : "ul";
  return <Tag {...rest} className={cx("vin-list", className)} />;
}

export function Code({ className, ...rest }: React.HTMLAttributes<HTMLElement>) {
  return <code {...rest} className={cx("vin-code", className)} />;
}

export function Link({ className, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a {...rest} className={cx("vin-link", className)} />;
}

/** Styles the plain tags inside: Markdown or CMS output. */
export function Prose({ as: Tag = "div", className, ...rest }: React.HTMLAttributes<HTMLElement> & As) {
  return <Tag {...rest} className={cx("vin-prose", className)} />;
}
