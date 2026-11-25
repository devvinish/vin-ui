"use client";

import * as React from "react";
import { Sheet, SheetClose, type SheetProps } from "./sheet";

/*
 * VinUI · Drawer (React). API: spec/drawer.json. Needs sheet.tsx and dialog.tsx next to it.
 * A bottom Sheet with a handle: drag the handle strip or the header down to close it.
 *   <Drawer trigger={<Button>Set goal</Button>} title="Daily goal" footer={…}>…</Drawer>
 */

export type DrawerProps = Omit<SheetProps, "side">;

export function Drawer({ className, onPointerDown, onPointerMove, onPointerUp, onPointerCancel, dismissible = true, ...rest }: DrawerProps) {
  const drag = React.useRef({ on: false, y: 0, dy: 0, t: 0 });
  const end = (el: HTMLDialogElement) => {
    const d = drag.current;
    if (!d.on) return;
    d.on = false;
    const fast = d.dy > 40 && d.dy / Math.max(1, Date.now() - d.t) > 0.6;
    el.style.transition = "";
    el.style.transform = "";
    if (dismissible && (d.dy > Math.min(140, el.offsetHeight * 0.35) || fast)) el.close();
  };
  return (
    <Sheet
      {...rest}
      side="bottom"
      dismissible={dismissible}
      className={["vin-drawer", className].filter(Boolean).join(" ")}
      onPointerDown={(e) => {
        onPointerDown?.(e);
        const el = e.currentTarget, t = e.target as HTMLElement;
        if (e.button !== 0 || !el.open) return;
        const top = e.clientY - el.getBoundingClientRect().top;
        if (!t.closest(".vin-dialog__header") && top > 28) return; // only the handle strip and the header
        if (t.closest("button, a, input, textarea, select")) return;
        drag.current = { on: true, y: e.clientY, dy: 0, t: Date.now() };
        el.setPointerCapture(e.pointerId);
        el.style.transition = "none";
      }}
      onPointerMove={(e) => {
        onPointerMove?.(e);
        const d = drag.current;
        if (!d.on) return;
        d.dy = Math.max(0, e.clientY - d.y);
        e.currentTarget.style.transform = `translateY(${d.dy}px)`;
      }}
      onPointerUp={(e) => { onPointerUp?.(e); end(e.currentTarget); }}
      onPointerCancel={(e) => { onPointerCancel?.(e); end(e.currentTarget); }}
    />
  );
}

/** Makes its child button close the drawer it's in. */
export const DrawerClose = SheetClose;
