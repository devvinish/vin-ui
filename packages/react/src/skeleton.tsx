import * as React from "react";

/*
 * VinUI · Skeleton (React). API: spec/skeleton.json.
 * Size each shape with style. Wrap them in one element with role="status" and an aria-label.
 */

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement> & {
  shape?: "block" | "text" | "circle";
};

export function Skeleton({ shape = "block", className, ...rest }: SkeletonProps) {
  return <div {...rest} className={cx("vin-skeleton", shape !== "block" && `vin-skeleton--${shape}`, className)} />;
}
