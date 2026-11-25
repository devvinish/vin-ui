import * as React from "react";
import { Dialog, DialogClose, type DialogProps } from "./dialog";

/*
 * VinUI · Sheet (React). API: spec/sheet.json. Needs dialog.tsx next to it.
 * A Dialog that slides in from an edge.
 *   <Sheet side="left" trigger={<Button>Menu</Button>} title="VinUI">…</Sheet>
 */

export type SheetProps = DialogProps & {
  /** The edge it comes from. Default "right". */
  side?: "right" | "left" | "top" | "bottom";
};

export function Sheet({ side = "right", className, ...rest }: SheetProps) {
  return <Dialog {...rest} data-side={side === "right" ? undefined : side} className={["vin-sheet", className].filter(Boolean).join(" ")} />;
}

/** Makes its child button close the sheet it's in. */
export const SheetClose = DialogClose;
