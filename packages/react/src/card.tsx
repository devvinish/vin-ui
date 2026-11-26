import * as React from "react";

/*
 * VinUI · Card (React)
 * API: spec/card.json. Every part is optional; styling comes from @vinui/styles.
 */

type DivProps = React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> };
const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

// forwardRef so `ref` works on React 18 as well as 19.
const part = (name: string, base: string) => {
  const C = React.forwardRef<HTMLDivElement, DivProps>(({ className, ...rest }, ref) => <div {...rest} ref={ref} className={cx(base, className)} />);
  C.displayName = name;
  return C;
};

export const Card = part("Card", "vin-card");
export const CardHeader = part("CardHeader", "vin-card__header");

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
export const CardBody = part("CardBody", "vin-card__body");
export const CardFooter = part("CardFooter", "vin-card__footer");
