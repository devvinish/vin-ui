import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/svelte";

import SheetLeft from "../examples/sheet/left.svelte";
import ToastAppearance from "../examples/toast/appearance.svelte";
import DialogHarness from "./fixtures/dialog-harness.svelte";
import AlertDialogHarness from "./fixtures/alert-dialog-harness.svelte";
import PopoverHarness from "./fixtures/popover-harness.svelte";
import MenuHarness from "./fixtures/menu-harness.svelte";
import TooltipHarness from "./fixtures/tooltip-harness.svelte";
import Toaster from "../src/toast-toaster.svelte";
import { toast, dismissToast, toasts } from "../src/toast.svelte";

const isOpen = (el: Element) => el.matches(":popover-open");

describe("Dialog", () => {
  it("opens from its trigger, is named by its title, and closes from a footer button", async () => {
    const onOpenChange = vi.fn();
    render(DialogHarness, { props: { onOpenChange } });
    const trigger = screen.getByRole("button", { name: "Open" });
    expect(trigger.getAttribute("aria-haspopup")).toBe("dialog");
    const dialog = document.querySelector("dialog")!;
    expect(dialog.open).toBe(false);

    await fireEvent.click(trigger);
    expect(dialog.open).toBe(true);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(document.getElementById(dialog.getAttribute("aria-labelledby")!)!.textContent).toBe("Edit profile");
    expect(document.getElementById(dialog.getAttribute("aria-describedby")!)!.textContent).toBe("Change your details.");
    expect(screen.getByTestId("state").textContent).toBe("open");

    await fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(dialog.open).toBe(false);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(screen.getByTestId("state").textContent).toBe("closed");
  });

  it("the X button closes it, and onSubmit gets the form data", async () => {
    const onSubmit = vi.fn();
    render(DialogHarness, { props: { onSubmit } });
    const dialog = document.querySelector("dialog")!;
    await fireEvent.click(screen.getByRole("button", { name: "Open" }));
    await fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(dialog.open).toBe(false);

    await fireEvent.click(screen.getByRole("button", { name: "Open" }));
    await fireEvent.submit(dialog.querySelector("form")!);
    expect(onSubmit).toHaveBeenCalledOnce();
    expect((onSubmit.mock.calls[0][0] as FormData).get("name")).toBe("Ada");
  });

  it("a click on the backdrop closes it", async () => {
    render(DialogHarness);
    const dialog = document.querySelector("dialog")!;
    await fireEvent.click(screen.getByRole("button", { name: "Open" }));
    dialog.getBoundingClientRect = () => ({ left: 100, right: 300, top: 100, bottom: 300, width: 200, height: 200, x: 100, y: 100, toJSON() {} });
    await fireEvent.click(dialog, { clientX: 10, clientY: 10 });
    expect(dialog.open).toBe(false);
  });
});

describe("Alert Dialog", () => {
  it("is an alertdialog that starts on Cancel and reports the choice", async () => {
    const onAction = vi.fn();
    const onCancel = vi.fn();
    render(AlertDialogHarness, { props: { onAction, onCancel } });
    await fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    const dialog = document.querySelector("dialog")!;
    expect(dialog.getAttribute("role")).toBe("alertdialog");
    expect(dialog.open).toBe(true);
    expect(document.activeElement?.textContent).toBe("Cancel");
    expect(dialog.querySelector(".vin-alert-dialog__icon")).toBeTruthy();
    expect(dialog.querySelector(".vin-dialog__close")).toBeNull();

    dialog.close("action");
    expect(onAction).toHaveBeenCalledOnce();
    expect(dialog.returnValue).toBe("");

    await fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    dialog.close("cancel");
    expect(onCancel).toHaveBeenCalledOnce();
  });
});

describe("Sheet", () => {
  it("is a dialog that slides from the side it is given", async () => {
    render(SheetLeft);
    await fireEvent.click(screen.getByRole("button", { name: "Menu" }));
    const dialog = document.querySelector("dialog")!;
    expect(dialog.open).toBe(true);
    expect(dialog.className).toContain("vin-sheet");
    expect(dialog.dataset.side).toBe("left");
  });
});

describe("Dropdown Menu", () => {
  it("opens from the keyboard with focus on the first item, and arrows skip disabled items", async () => {
    render(MenuHarness);
    const trigger = screen.getByRole("button", { name: "Actions" });
    const menu = document.querySelector('[role="menu"]')!;
    expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
    expect(trigger.getAttribute("popovertarget")).toBe(menu.id);
    expect(menu.getAttribute("aria-labelledby")).toBe(trigger.id);

    await fireEvent.keyDown(trigger, { key: "ArrowDown" });
    expect(isOpen(menu)).toBe(true);
    await waitFor(() => expect(trigger.getAttribute("aria-expanded")).toBe("true"));
    expect(document.activeElement?.textContent?.trim()).toBe("Profile");
    await fireEvent.keyDown(menu, { key: "ArrowDown" });
    await fireEvent.keyDown(menu, { key: "ArrowDown" });
    expect(document.activeElement?.textContent?.trim()).toBe("Settings");
    await fireEvent.keyDown(menu, { key: "Home" });
    expect(document.activeElement?.textContent?.trim()).toBe("Profile");
    await fireEvent.keyDown(menu, { key: "s" });
    expect(document.activeElement?.textContent?.trim()).toBe("Settings");
  });

  it("ArrowUp on the trigger focuses the last item; Tab closes and returns focus", async () => {
    render(MenuHarness);
    const trigger = screen.getByRole("button", { name: "Actions" });
    const menu = document.querySelector('[role="menu"]')!;
    await fireEvent.keyDown(trigger, { key: "ArrowUp" });
    expect(document.activeElement?.textContent?.trim()).toBe("Size");
    await fireEvent.keyDown(menu, { key: "Tab" });
    expect(isOpen(menu)).toBe(false);
    expect(document.activeElement).toBe(trigger);
  });

  it("choosing an item calls onSelect and closes; checkbox and radio items keep it open", async () => {
    const onSelect = vi.fn();
    const onCheckedChange = vi.fn();
    const onValueChange = vi.fn();
    render(MenuHarness, { props: { onSelect, onCheckedChange, onValueChange } });
    const trigger = screen.getByRole("button", { name: "Actions" });
    const menu = document.querySelector('[role="menu"]')!;

    await fireEvent.keyDown(trigger, { key: "ArrowDown" });
    const box = screen.getByRole("menuitemcheckbox", { name: "Toolbar" });
    await fireEvent.click(box);
    expect(box.getAttribute("aria-checked")).toBe("true");
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    const size = screen.getByRole("menuitemradio", { name: "Size" });
    await fireEvent.click(size);
    expect(size.getAttribute("aria-checked")).toBe("true");
    expect(screen.getByRole("menuitemradio", { name: "Name" }).getAttribute("aria-checked")).toBe("false");
    expect(onValueChange).toHaveBeenCalledWith("size");
    expect(isOpen(menu)).toBe(true);

    await fireEvent.click(screen.getByRole("menuitem", { name: "Profile" }));
    expect(onSelect).toHaveBeenCalledOnce();
    expect(isOpen(menu)).toBe(false);
    expect(document.activeElement).toBe(trigger);
  });
});

describe("Popover", () => {
  it("follows bind:open both ways and is named by its title", async () => {
    const onOpenChange = vi.fn();
    render(PopoverHarness, { props: { onOpenChange } });
    const trigger = screen.getByRole("button", { name: "Dimensions" });
    const pop = document.querySelector(".vin-popover")!;
    expect(trigger.getAttribute("popovertarget")).toBe(pop.id);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(document.getElementById(pop.getAttribute("aria-labelledby")!)!.textContent).toBe("Dimensions");

    await fireEvent.click(screen.getByRole("button", { name: "Toggle from outside" }));
    await waitFor(() => expect(isOpen(pop)).toBe(true));
    expect(trigger.getAttribute("aria-expanded")).toBe("true");

    // The browser closes it (Escape or a click outside): the state follows.
    (pop as HTMLElement).hidePopover();
    await waitFor(() => expect(trigger.getAttribute("aria-expanded")).toBe("false"));
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });
});

describe("Tooltip", () => {
  it("describes its trigger, shows on keyboard focus and hides on Escape", async () => {
    render(TooltipHarness);
    const btn = screen.getByRole("button", { name: "Save" });
    const tip = screen.getByRole("tooltip", { hidden: true });
    expect(btn.getAttribute("aria-describedby")).toBe(tip.id);
    btn.focus();
    await waitFor(() => expect(isOpen(tip)).toBe(true));
    await fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(isOpen(tip)).toBe(false));
  });

  it("names an icon button with label, and hides when the pointer leaves", async () => {
    render(TooltipHarness, { props: { label: true } });
    const btn = screen.getByRole("button", { name: "Add to your library" });
    const tip = screen.getByRole("tooltip", { hidden: true });
    expect(btn.getAttribute("aria-labelledby")).toBe(tip.id);
    await fireEvent.pointerEnter(btn, { pointerType: "mouse" });
    await waitFor(() => expect(isOpen(tip)).toBe(true));
    await fireEvent.pointerLeave(btn);
    await waitFor(() => expect(isOpen(tip)).toBe(false));
  });
});

describe("Toast", () => {
  afterEach(() => {
    toasts.entries = [];
  });

  it("toast() shows a live message at the end of the page; danger ones are alerts", async () => {
    render(Toaster);
    toast("Changes saved");
    const region = await waitFor(() => screen.getByRole("region", { name: "Notifications" }));
    expect(region.parentElement).toBe(document.body);
    await waitFor(() => expect(screen.getByRole("status").textContent).toContain("Changes saved"));
    toast({ title: "Upload failed", variant: "danger" });
    await waitFor(() => expect(screen.getByRole("alert").textContent).toContain("Upload failed"));
  });

  it("closes from its button, from dismissToast, and after its duration", async () => {
    const onClick = vi.fn();
    render(Toaster);
    toast({ title: "Archived", action: { label: "Undo", onClick } });
    const undo = await waitFor(() => screen.getByRole("button", { name: "Undo" }));
    await fireEvent.click(undo);
    expect(onClick).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByText("Archived")).toBeNull());

    const id = toast("Second");
    await waitFor(() => screen.getByText("Second"));
    dismissToast(id);
    await waitFor(() => expect(screen.queryByText("Second")).toBeNull());

    toast({ title: "Short", duration: 50 });
    await waitFor(() => screen.getByText("Short"));
    await waitFor(() => expect(screen.queryByText("Short")).toBeNull());

    toast("Closable");
    await fireEvent.click(await waitFor(() => screen.getByRole("button", { name: "Close" })));
    await waitFor(() => expect(screen.queryByText("Closable")).toBeNull());
  });

  it("only one Toaster renders", async () => {
    render(Toaster);
    render(Toaster);
    toast("Once");
    await waitFor(() => expect(document.querySelectorAll(".vin-toaster").length).toBe(1));
  });

  it("<Toast> can be shown inline", () => {
    render(ToastAppearance);
    expect(document.querySelectorAll(".vin-toast").length).toBe(2);
    expect(document.querySelector(".vin-toast--success .vin-toast__icon")).toBeTruthy();
  });
});
