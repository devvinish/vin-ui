/*
 * happy-dom has no Popover API yet. This test-only stand-in covers what the components use:
 * showPopover / hidePopover / togglePopover, the "toggle" event (with newState), :popover-open,
 * and popovertarget buttons. Light dismiss and the top layer are not simulated.
 */
export {};

const shown = new WeakSet<Element>();

function setState(el: HTMLElement, next: boolean) {
  if (shown.has(el) === next) return;
  if (next) shown.add(el); else shown.delete(el);
  const e = new Event("toggle") as Event & { oldState: string; newState: string };
  Object.assign(e, { oldState: next ? "closed" : "open", newState: next ? "open" : "closed" });
  el.dispatchEvent(e);
}

const proto = HTMLElement.prototype as unknown as Record<string, unknown>;
if (!("showPopover" in proto)) {
  proto.showPopover = function (this: HTMLElement) { setState(this, true); };
  proto.hidePopover = function (this: HTMLElement) { setState(this, false); };
  proto.togglePopover = function (this: HTMLElement, force?: boolean) { setState(this, force ?? !shown.has(this)); return shown.has(this); };

  const matches = Element.prototype.matches;
  Element.prototype.matches = function (this: Element, selector: string) {
    if (selector === ":popover-open") return shown.has(this);
    return matches.call(this, selector);
  } as typeof matches;

  // A click on a button[popovertarget] toggles its popover, as browsers do.
  document.addEventListener("click", (e) => {
    const btn = (e.target as Element | null)?.closest?.("[popovertarget]");
    const target = btn && document.getElementById(btn.getAttribute("popovertarget")!);
    if (target && !e.defaultPrevented) setState(target as HTMLElement, !shown.has(target));
  });
}
