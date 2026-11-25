import * as React from "react";
import { Dialog, type DialogProps } from "./dialog";

/*
 * VinUI · Alert Dialog (React). API: spec/alert-dialog.json. Needs dialog.tsx next to it.
 * Asks before something that can't be undone. Focus starts on Cancel; Escape cancels.
 *   <AlertDialog trigger={<Button variant="danger">Delete</Button>} title="Delete this project?" action="Delete project" onAction={remove} />
 */

export type AlertDialogProps = Omit<DialogProps, "footer" | "footerForm" | "dismissible" | "showClose" | "onSubmit" | "children" | "icon" | "onCancel"> & {
  /** The confirm button's text. Default "Continue". */
  action?: string;
  /** The cancel button's text. Default "Cancel". */
  cancel?: string;
  /** The confirm button's look. Default "danger". */
  variant?: "default" | "danger";
  /** A warning icon beside the title: true for the built-in one, or your own svg.vin-alert-dialog__icon. */
  icon?: React.ReactNode | true;
  /** Called when the user confirms. */
  onAction?: () => void;
  /** Called when the user cancels, with a button or Escape. */
  onCancel?: () => void;
};

const WARNING = (
  <svg className="vin-alert-dialog__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4" /><path d="M12 17h.01" />
  </svg>
);

export function AlertDialog({ action = "Continue", cancel = "Cancel", variant = "danger", icon, onAction, onCancel, title, className, onClose, ...rest }: AlertDialogProps) {
  return (
    <Dialog
      {...rest}
      role="alertdialog"
      className={["vin-alert-dialog", className].filter(Boolean).join(" ")}
      dismissible={false}
      showClose={false}
      title={title}
      icon={icon === true ? WARNING : icon}
      footerForm
      onClose={(e) => {
        onClose?.(e);
        if (e.currentTarget.returnValue === "action") onAction?.(); else onCancel?.();
        e.currentTarget.returnValue = "";
      }}
      footer={
        <>
          <button type="submit" className="vin-btn vin-btn--outline" value="cancel" data-autofocus>{cancel}</button>
          <button type="submit" className={variant === "danger" ? "vin-btn vin-btn--danger" : "vin-btn"} value="action">{action}</button>
        </>
      }
    />
  );
}
