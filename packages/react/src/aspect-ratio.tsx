import * as React from "react";

/*
 * VinUI · Aspect Ratio (React). API: spec/aspect-ratio.json.
 * <AspectRatio ratio={16 / 9}><img … /></AspectRatio>
 */

export type AspectRatioProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Width ÷ height: 16 / 9, 4 / 3, 1 … or a CSS string like "16 / 9". Default 16 / 9. */
  ratio?: number | string;
};

export function AspectRatio({ ratio = "16 / 9", className, style, ...rest }: AspectRatioProps) {
  return (
    <div
      {...rest}
      className={["vin-aspect", className].filter(Boolean).join(" ")}
      style={{ ["--vin-ratio" as string]: String(ratio), ...style }}
    />
  );
}
