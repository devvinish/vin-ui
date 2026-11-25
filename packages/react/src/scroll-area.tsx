import * as React from "react";

/*
 * VinUI · Scroll Area (React). API: spec/scroll-area.json.
 * Native scrolling with thin, themed scrollbars. The box is in the Tab order (tabIndex 0),
 * so keyboard users can scroll it; with a label it is a named region for screen readers.
 */

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

export type ScrollAreaProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Which way the content scrolls. */
  orientation?: "vertical" | "horizontal" | "both";
  /** A name for the region, read by screen readers. */
  label?: string;
};

export const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(function ScrollArea(
  { orientation = "vertical", label, className, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      role={label ? "region" : undefined}
      aria-label={label}
      tabIndex={0}
      {...rest}
      className={cx(
        "vin-scroll-area",
        orientation === "horizontal" && "vin-scroll-area--horizontal",
        orientation === "both" && "vin-scroll-area--both",
        className,
      )}
    >
      {children}
    </div>
  );
});
