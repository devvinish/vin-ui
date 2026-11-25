import { describe, it, expect, vi, afterEach } from "vitest";
import { mount, flushPromises, type VueWrapper } from "@vue/test-utils";
import { defineComponent, h, nextTick } from "vue";
import Button from "../src/button.vue";
import Dialog, { DialogClose } from "../src/dialog.vue";
import AlertDialog from "../src/alert-dialog.vue";
import Sheet, { SheetClose } from "../src/sheet.vue";
import DropdownMenu, {
  DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator,
} from "../src/dropdown-menu.vue";
import Popover from "../src/popover.vue";
import Tooltip from "../src/tooltip.vue";
import Toaster, { Toast, toast, dismissToast } from "../src/toast.vue";

const mounted: VueWrapper[] = [];
const attach = <T extends VueWrapper>(w: T) => { mounted.push(w); return w; };
afterEach(() => { mounted.splice(0).forEach((w) => w.unmount()); document.body.innerHTML = ""; vi.useRealTimers(); });
const key = (el: Element, k: string) => el.dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true, cancelable: true }));

describe("Dialog", () => {
  const Demo = (props: Record<string, unknown> = {}) =>
    defineComponent({
      setup: () => () =>
        h(Dialog, { title: "Edit profile", description: "Your details", ...props }, {
          trigger: () => h(Button, null, () => "Open"),
          default: () => h("input", { name: "name", value: "Ada", "data-autofocus": "" }),
          footer: () => [h(DialogClose, null, () => h(Button, { variant: "outline" }, () => "Cancel")), h(Button, { type: "submit" }, () => "Save")],
        }),
    });

  it("labels the dialog and opens it from the trigger", async () => {
    const w = attach(mount(Demo(), { attachTo: document.body }));
    const dlg = w.get<HTMLDialogElement>("dialog");
    expect(dlg.attributes("aria-labelledby")).toBe(w.get(".vin-dialog__title").attributes("id"));
    expect(dlg.attributes("aria-describedby")).toBe(w.get(".vin-dialog__description").attributes("id"));
    const trigger = w.findAll("button")[0];
    expect(trigger.attributes("aria-haspopup")).toBe("dialog");
    expect(dlg.element.open).toBe(false);
    await trigger.trigger("click");
    expect(dlg.element.open).toBe(true);
    expect(document.activeElement).toBe(w.get("input").element);
  });

  it("DialogClose and the X button close it and emit update:open", async () => {
    const onOpen = vi.fn();
    const w = attach(mount(Demo({ defaultOpen: true, "onUpdate:open": onOpen }), { attachTo: document.body }));
    const dlg = w.get<HTMLDialogElement>("dialog");
    await nextTick();
    expect(dlg.element.open).toBe(true);
    await w.get(".vin-dialog__footer .vin-btn--outline").trigger("click");
    expect(dlg.element.open).toBe(false);
    expect(onOpen).toHaveBeenLastCalledWith(false);
    await w.findAll("button")[0].trigger("click");
    expect(dlg.element.open).toBe(true);
    await w.get(".vin-dialog__close").trigger("click");
    expect(dlg.element.open).toBe(false);
  });

  it("follows v-model:open", async () => {
    const w = attach(mount(Dialog, { props: { title: "T", open: false }, attachTo: document.body }));
    const dlg = w.get<HTMLDialogElement>("dialog");
    await w.setProps({ open: true });
    expect(dlg.element.open).toBe(true);
    await w.setProps({ open: false });
    expect(dlg.element.open).toBe(false);
  });

  it("@submit wraps the content in a form and gets its data", async () => {
    const onSubmit = vi.fn();
    const w = attach(mount(Demo({ onSubmit }), { attachTo: document.body }));
    const form = w.get("form");
    expect(form.attributes("method")).toBe("dialog");
    await form.trigger("submit");
    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit.mock.calls[0][0]).toBeInstanceOf(FormData);
  });
});

describe("AlertDialog", () => {
  it("is an alertdialog that can't be dismissed by clicking outside, and reports the choice", async () => {
    const w = attach(mount(AlertDialog, {
      props: { title: "Delete?", action: "Delete", defaultOpen: true },
      slots: { trigger: () => h(Button, { variant: "danger" }, () => "Delete") },
      attachTo: document.body,
    }));
    await nextTick();
    const dlg = w.get<HTMLDialogElement>("dialog");
    expect(dlg.attributes("role")).toBe("alertdialog");
    expect(dlg.classes()).toEqual(expect.arrayContaining(["vin-dialog", "vin-alert-dialog"]));
    expect(w.find(".vin-dialog__close").exists()).toBe(false);
    expect(document.activeElement?.getAttribute("value")).toBe("cancel");
    expect(w.get(".vin-dialog__footer").element.tagName).toBe("FORM");
    expect(w.get('[value="action"]').classes()).toContain("vin-btn--danger");

    dlg.element.close("action");
    await flushPromises();
    expect(w.emitted("action")).toHaveLength(1);
    expect(w.emitted("update:open")!.at(-1)).toEqual([false]);

    dlg.element.showModal();
    dlg.element.close();
    await flushPromises();
    expect(w.emitted("cancel")).toHaveLength(1);
  });
});

describe("Sheet", () => {
  it("is a dialog with a side, and SheetClose closes it", async () => {
    const w = attach(mount(Sheet, {
      props: { side: "left" },
      attrs: { title: "Menu", defaultOpen: true },
      slots: { default: () => h(SheetClose, null, () => h("button", { class: "x" }, "Done")) },
      attachTo: document.body,
    }));
    await nextTick();
    const dlg = w.get<HTMLDialogElement>("dialog");
    expect(dlg.classes()).toEqual(expect.arrayContaining(["vin-dialog", "vin-sheet"]));
    expect(dlg.attributes("data-side")).toBe("left");
    expect(dlg.element.open).toBe(true);
    await w.get(".x").trigger("click");
    expect(dlg.element.open).toBe(false);
  });
});

describe("DropdownMenu", () => {
  const onSelect = vi.fn();
  const Menu = defineComponent({
    setup: () => () =>
      h(DropdownMenu, null, {
        trigger: () => h(Button, null, () => "Account"),
        default: () => [
          h(DropdownMenuItem, { shortcut: "⌘P", onSelect }, () => "Profile"),
          h(DropdownMenuItem, { disabled: true }, () => "Billing"),
          h(DropdownMenuItem, { onSelect: (e: MouseEvent) => e.preventDefault() }, () => "Settings"),
          h(DropdownMenuSeparator),
          h(DropdownMenuCheckboxItem, { defaultChecked: true }, () => "Toolbar"),
          h(DropdownMenuRadioGroup, { label: "Sort", defaultValue: "name" }, () => [
            h(DropdownMenuRadioItem, { value: "name" }, () => "Name"),
            h(DropdownMenuRadioItem, { value: "size" }, () => "Size"),
          ]),
        ],
      }),
  });

  it("wires the trigger to the menu", () => {
    const w = mount(Menu);
    const btn = w.get("button");
    const menu = w.get('[role="menu"]');
    expect(btn.attributes("aria-haspopup")).toBe("menu");
    expect(btn.attributes("aria-expanded")).toBe("false");
    expect(btn.attributes("popovertarget")).toBe(menu.attributes("id"));
    expect(menu.attributes("aria-labelledby")).toBe(btn.attributes("id"));
    expect(menu.attributes("popover")).toBe("auto");
    expect(w.findAll('[role="menuitem"]').every((i) => i.attributes("tabindex") === "-1")).toBe(true);
  });

  it("ArrowDown opens it and focuses the first item; arrows skip disabled items; typing jumps", async () => {
    const w = attach(mount(Menu, { attachTo: document.body }));
    const btn = w.get("button");
    const items = w.findAll('[role^="menuitem"]');
    (btn.element as HTMLElement).focus();
    key(btn.element, "ArrowDown");
    await nextTick();
    expect(btn.attributes("aria-expanded")).toBe("true");
    expect(document.activeElement).toBe(items[0].element);
    key(items[0].element, "ArrowDown");
    expect(document.activeElement).toBe(items[2].element);
    key(items[2].element, "End");
    expect(document.activeElement).toBe(items.at(-1)!.element);
    key(document.activeElement!, "ArrowDown");
    expect(document.activeElement).toBe(items[0].element);
    key(items[0].element, "t");
    expect(document.activeElement).toBe(items[3].element);
  });

  it("choosing an item emits select and closes; preventDefault keeps it open", async () => {
    const w = attach(mount(Menu, { attachTo: document.body }));
    const btn = w.get("button");
    const menu = w.get('[role="menu"]');
    await btn.trigger("click");
    expect(menu.element.matches(":popover-open")).toBe(true);
    await w.findAll('[role="menuitem"]')[2].trigger("click");
    expect(menu.element.matches(":popover-open")).toBe(true);
    await w.findAll('[role="menuitem"]')[0].trigger("click");
    expect(onSelect).toHaveBeenCalledOnce();
    expect(menu.element.matches(":popover-open")).toBe(false);
    expect(document.activeElement).toBe(btn.element);
  });

  it("checkbox and radio items keep the menu open and update aria-checked", async () => {
    const w = attach(mount(Menu, { attachTo: document.body }));
    await w.get("button").trigger("click");
    const check = w.get('[role="menuitemcheckbox"]');
    expect(check.attributes("aria-checked")).toBe("true");
    await check.trigger("click");
    expect(check.attributes("aria-checked")).toBe("false");
    const radios = w.findAll('[role="menuitemradio"]');
    expect(radios.map((r) => r.attributes("aria-checked"))).toEqual(["true", "false"]);
    await radios[1].trigger("click");
    expect(radios.map((r) => r.attributes("aria-checked"))).toEqual(["false", "true"]);
    expect(w.get('[role="menu"]').element.matches(":popover-open")).toBe(true);
  });
});

describe("Popover", () => {
  it("links trigger and popover and reports open changes", async () => {
    const w = attach(mount(Popover, {
      props: { title: "Plan", description: "Details" },
      slots: { trigger: () => h(Button, null, () => "About"), default: "Body" },
      attachTo: document.body,
    }));
    const btn = w.get("button");
    const pop = w.get(".vin-popover");
    expect(pop.attributes("role")).toBe("dialog");
    expect(pop.attributes("aria-labelledby")).toBe(w.get(".vin-popover__title").attributes("id"));
    expect(btn.attributes("popovertarget")).toBe(pop.attributes("id"));
    await btn.trigger("click");
    expect(w.emitted("update:open")![0]).toEqual([true]);
    expect(btn.attributes("aria-expanded")).toBe("true");
    (pop.element as HTMLElement).hidePopover();
    await nextTick();
    expect(w.emitted("update:open")![1]).toEqual([false]);
  });

  it("follows v-model:open", async () => {
    const w = attach(mount(Popover, { props: { open: false }, slots: { trigger: () => h("button", "T") }, attachTo: document.body }));
    await w.setProps({ open: true });
    expect(w.get(".vin-popover").element.matches(":popover-open")).toBe(true);
  });
});

describe("Tooltip", () => {
  it("describes its trigger, shows after the delay on hover and hides on Escape", async () => {
    vi.useFakeTimers();
    const w = attach(mount(Tooltip, { props: { content: "Save to library" }, slots: { default: () => h(Button, null, () => "Save") }, attachTo: document.body }));
    const btn = w.get("button");
    const tip = w.get('[role="tooltip"]');
    expect(btn.attributes("aria-describedby")).toBe(tip.attributes("id"));
    expect(tip.attributes("popover")).toBe("manual");
    btn.element.dispatchEvent(new PointerEvent("pointerenter", { pointerType: "mouse" }));
    vi.advanceTimersByTime(200);
    expect(tip.element.matches(":popover-open")).toBe(false);
    vi.advanceTimersByTime(150);
    expect(tip.element.matches(":popover-open")).toBe(true);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    vi.advanceTimersByTime(0);
    expect(tip.element.matches(":popover-open")).toBe(false);
  });

  it("label names the trigger instead", () => {
    const w = mount(Tooltip, { props: { content: "Bold", label: true }, slots: { default: () => h("button", "B") } });
    expect(w.get("button").attributes("aria-labelledby")).toBe(w.get('[role="tooltip"]').attributes("id"));
  });
});

describe("Toast", () => {
  it("toast() shows in the Toaster, as a status or an alert, and goes away", async () => {
    vi.useFakeTimers();
    const w = attach(mount(Toaster, { attachTo: document.body }));
    await nextTick();
    const id = toast({ title: "Saved", description: "All good", duration: 1000 });
    toast({ title: "Failed", variant: "danger" });
    await nextTick();
    const region = document.querySelector(".vin-toaster")!;
    expect(region.getAttribute("aria-label")).toBe("Notifications");
    vi.advanceTimersToNextFrame();
    await nextTick();
    const toasts = region.querySelectorAll(".vin-toast");
    expect(toasts).toHaveLength(2);
    expect(toasts[0].getAttribute("role")).toBe("status");
    expect(toasts[1].getAttribute("role")).toBe("alert");
    expect(toasts[0].querySelector(".vin-toast__title")!.textContent).toBe("Saved");
    vi.advanceTimersByTime(1000);
    await nextTick();
    expect(region.querySelector('[data-leaving]')).not.toBeNull();
    vi.advanceTimersByTime(200);
    await nextTick();
    expect(region.querySelectorAll(".vin-toast")).toHaveLength(1);
    dismissToast(id);
    (region.querySelector(".vin-toast__close") as HTMLElement).click();
    vi.advanceTimersByTime(200);
    await nextTick();
    expect(region.querySelectorAll(".vin-toast")).toHaveLength(0);
    w.unmount();
  });

  it("Toast renders inline with an action button", async () => {
    const onClick = vi.fn();
    const w = mount(Toast, { props: { title: "Archived", variant: "success", action: { label: "Undo", onClick } } });
    expect(w.classes()).toContain("vin-toast--success");
    expect(w.find(".vin-toast__icon").exists()).toBe(true);
    await w.get(".vin-toast__actions button").trigger("click");
    expect(onClick).toHaveBeenCalledOnce();
    await w.get(".vin-toast__close").trigger("click");
    expect(w.emitted("close")).toHaveLength(1);
  });
});
