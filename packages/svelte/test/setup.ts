// jsdom has no popover API and no modal <dialog>: add just enough for the components to run.
export {};

const open = new WeakSet<Element>();

if (!("showPopover" in HTMLElement.prototype)) {
  const fire = (el: HTMLElement, newState: "open" | "closed") => {
    const e = new Event("toggle");
    Object.assign(e, { newState, oldState: newState === "open" ? "closed" : "open" });
    el.dispatchEvent(e);
  };
  // jsdom hides every [popover]; show the open ones, so they can be focused and found by role.
  const style = document.createElement("style");
  style.textContent = "[popover][data-test-open] { display: block; }";
  document.head.append(style);
  Object.assign(HTMLElement.prototype, {
    showPopover(this: HTMLElement) {
      if (open.has(this)) return;
      open.add(this);
      this.setAttribute("data-test-open", "");
      fire(this, "open");
    },
    hidePopover(this: HTMLElement) {
      if (!open.has(this)) return;
      open.delete(this);
      this.removeAttribute("data-test-open");
      fire(this, "closed");
    },
    togglePopover(this: HTMLElement) {
      if (open.has(this)) this.hidePopover();
      else this.showPopover();
    },
  });
  const matches = Element.prototype.matches;
  Element.prototype.matches = function (this: Element, selector: string): boolean {
    if (selector === ":popover-open") return open.has(this);
    if (selector === ":focus-visible") return this === document.activeElement;
    return matches.call(this, selector);
  } as typeof matches;
}

const dialog = HTMLDialogElement.prototype;
dialog.showModal = function (this: HTMLDialogElement) {
  this.setAttribute("open", "");
};
dialog.close = function (this: HTMLDialogElement, returnValue?: string) {
  if (!this.hasAttribute("open")) return;
  if (returnValue !== undefined) this.returnValue = returnValue;
  this.removeAttribute("open");
  this.dispatchEvent(new Event("close"));
};

Element.prototype.scrollIntoView ??= function () {};
Element.prototype.setPointerCapture ??= function () {};
