import * as React from "react";

/*
 * VinUI · Card (React)
 * API: spec/card.json. Every part is optional; styling comes from @vinui/styles.
 */

type DivProps = React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> };
const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

export function Card({ className, ...rest }: DivProps) {
  return <div {...rest} className={cx("vin-card", className)} />;
}
export function CardHeader({ className, ...rest }: DivProps) {
  return <div {...rest} className={cx("vin-card__header", className)} />;
}

export type CardTitleProps = React.HTMLAttributes<HTMLHeadingElement> & {
  /** Heading level, so the title fits your page outline. Default: "h3". */
  as?: "h2" | "h3" | "h4" | "p";
};
export function CardTitle({ as: Tag = "h3", className, ...rest }: CardTitleProps) {
  return <Tag {...rest} className={cx("vin-card__title", className)} />;
}

export function CardDescription({ className, ...rest }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p {...rest} className={cx("vin-card__desc", className)} />;
}
export function CardBody({ className, ...rest }: DivProps) {
  return <div {...rest} className={cx("vin-card__body", className)} />;
}
export function CardFooter({ className, ...rest }: DivProps) {
  return <div {...rest} className={cx("vin-card__footer", className)} />;
}
