import * as React from "react";

/*
 * VinUI · Separator (React). API: spec/separator.json.
 * An <hr> (a separator to screen readers), a hidden decorative line, or a line with a word in the middle.
 */

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

export type SeparatorProps = React.HTMLAttributes<HTMLElement> & {
  orientation?: "horizontal" | "vertical";
  /** Only visual: hidden from screen readers. */
  decorative?: boolean;
  /** A word in the middle of the line, like "or". */
  label?: React.ReactNode;
};

export function Separator({ orientation = "horizontal", decorative, label, className, ...rest }: SeparatorProps) {
  const classes = cx("vin-separator", orientation === "vertical" && "vin-separator--vertical", label != null && "vin-separator--label", className);
  if (label != null) return <div {...rest} className={classes}>{label}</div>;
  if (decorative) return <div aria-hidden="true" {...rest} className={classes} />;
  return <hr aria-orientation={orientation === "vertical" ? "vertical" : undefined} {...rest} className={classes} />;
}
