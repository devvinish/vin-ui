import * as React from "react";

/*
 * VinUI · Dialog (React). API: spec/dialog.json.
 * The browser's modal <dialog>: it traps focus, Escape closes it, focus returns to the trigger.
 *   <Dialog trigger={<Button>Edit profile</Button>} title="Edit profile" footer={<DialogClose><Button>Done</Button></DialogClose>}>…</Dialog>
 */

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");
const CloseContext = React.createContext<() => void>(() => {});

type TriggerEl = React.ReactElement<React.ButtonHTMLAttributes<HTMLButtonElement>>;

export type DialogProps = Omit<React.DialogHTMLAttributes<HTMLDialogElement>, "title" | "open" | "onSubmit"> & {
  /** The button that opens it. */
  trigger?: TriggerEl;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Actions at the end. Wrap a button in <DialogClose> to make it close the dialog. */
  footer?: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Wraps the body and footer in a form. A submit button sends it and closes the dialog. */
  onSubmit?: (data: FormData, event: React.FormEvent<HTMLFormElement>) => void;
  /** Close on a click outside. Default true. */
  dismissible?: boolean;
  /** Show the X button. Default true. */
  showClose?: boolean;
  /** Label for the X button. Default "Close". */
  closeLabel?: string;
  /** An icon before the title (Alert Dialog uses it for a warning). */
  icon?: React.ReactNode;
  /** Make the footer a form[method=dialog]: a submit button in it closes the dialog and sets returnValue to its value. */
  footerForm?: boolean;
};

export function Dialog({
  trigger, title, description, footer, open, defaultOpen = false, onOpenChange, onSubmit, dismissible = true, showClose = true,
  closeLabel = "Close", icon, footerForm = false, className, children, ...rest
}: DialogProps) {
  const id = "vin-dlg-" + React.useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const ref = React.useRef<HTMLDialogElement>(null);
  const [inner, setInner] = React.useState(defaultOpen);
  const isOpen = open ?? inner;
  const setOpen = (v: boolean) => { if (open === undefined) setInner(v); onOpenChange?.(v); };
  const close = React.useCallback(() => ref.current?.close(), []);

  // Open or close the native dialog to match the state.
  React.useEffect(() => {
    const el = ref.current;
    if (!el?.showModal) return;
    // Focus starts on the first field; put data-autofocus on something else to start there.
    if (isOpen && !el.open) { el.showModal(); el.querySelector<HTMLElement>("[data-autofocus]")?.focus(); }
    if (!isOpen && el.open) el.close();
  }, [isOpen]);

  const onClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    rest.onClick?.(e);
    if (!dismissible || e.target !== e.currentTarget) return;
    const r = e.currentTarget.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) close();
  };

  const body = children != null && <div className="vin-dialog__body">{children}</div>;
  const foot = footer != null && (footerForm
    ? <form method="dialog" className="vin-dialog__footer">{footer}</form>
    : <div className="vin-dialog__footer">{footer}</div>);

  return (
    <CloseContext.Provider value={close}>
      {trigger && React.cloneElement(trigger, {
        "aria-haspopup": "dialog",
        onClick: (e: React.MouseEvent<HTMLButtonElement>) => { trigger.props.onClick?.(e); if (!e.defaultPrevented) setOpen(true); },
      } as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      <dialog
        {...rest}
        ref={ref}
        id={rest.id ?? id}
        className={cx("vin-dialog", className)}
        aria-labelledby={`${id}-title`}
        aria-describedby={description != null ? `${id}-desc` : undefined}
        onClose={(e) => { rest.onClose?.(e); if (isOpen) setOpen(false); }}
        onClick={onClick}
      >
        <div className="vin-dialog__header">
          {icon}
          <h2 className="vin-dialog__title" id={`${id}-title`}>{title}</h2>
          {description != null && <p className="vin-dialog__description" id={`${id}-desc`}>{description}</p>}
        </div>
        {onSubmit ? (
          <form method="dialog" onSubmit={(e) => onSubmit(new FormData(e.currentTarget), e)}>{body}{foot}</form>
        ) : (<>{body}{foot}</>)}
        {showClose && (
          <button type="button" className="vin-btn vin-btn--ghost vin-btn--icon vin-dialog__close" aria-label={closeLabel} onClick={close}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>
        )}
      </dialog>
    </CloseContext.Provider>
  );
}

/** Makes its child button close the dialog it's in. */
export function DialogClose({ children }: { children: TriggerEl }) {
  const close = React.useContext(CloseContext);
  return React.cloneElement(children, {
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => { children.props.onClick?.(e); if (!e.defaultPrevented) close(); },
  } as React.ButtonHTMLAttributes<HTMLButtonElement>);
}
