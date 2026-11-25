import * as React from "react";

/*
 * VinUI · Kbd (React). API: spec/kbd.json.
 * <Kbd>K</Kbd> is one key; <KbdGroup> holds the keys of a shortcut.
 */

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

export function Kbd({ className, ...rest }: React.HTMLAttributes<HTMLElement>) {
  return <kbd {...rest} className={cx("vin-kbd", className)} />;
}

export function KbdGroup({ className, ...rest }: React.HTMLAttributes<HTMLElement>) {
  return <kbd {...rest} className={cx("vin-kbd-group", className)} />;
}
