import * as React from "react";

/** Dev-only warnings, without needing Node's `process` (Vite and the browser don't have it). */
const isDev = () => (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV !== "production";

/*
 * VinUI · Button Group (React). API: spec/button-group.json.
 * Joins Buttons into one control. Name the group with aria-label.
 */

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

export type ButtonGroupProps = React.HTMLAttributes<HTMLDivElement> & { orientation?: "horizontal" | "vertical" };

export function ButtonGroup({ orientation = "horizontal", className, ...rest }: ButtonGroupProps) {
  if (isDev() && !rest["aria-label"] && !rest["aria-labelledby"]) {
    console.warn("VinUI ButtonGroup: give the group an aria-label.");
  }
  return <div role="group" {...rest} className={cx("vin-btn-group", orientation === "vertical" && "vin-btn-group--vertical", className)} />;
}
