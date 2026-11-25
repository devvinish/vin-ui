import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/svelte";

import Command from "../src/command.svelte";
import ContextMenuOptions from "../examples/context-menu/options.svelte";
import DrawerHarness from "./fixtures/drawer-harness.svelte";
import HoverCardHarness from "./fixtures/hover-card-harness.svelte";
import ContextMenuHarness from "./fixtures/context-menu-harness.svelte";
import CommandDialogHarness from "./fixtures/command-dialog-harness.svelte";

const isOpen = (el: Element) => el.matches(":popover-open");

describe("Drawer", () => {
  it("is a bottom sheet that opens from its trigger and closes from the footer", async () => {
    render(DrawerHarness);
    const dialog = document.querySelector("dialog")!;
    expect(dialog.className.split(" ")).toEqual(expect.arrayContaining(["vin-dialog", "vin-sheet", "vin-drawer"]));
    expect(dialog.dataset.side).toBe("bottom");
    await fireEvent.click(screen.getByRole("button", { name: "Set goal" }));
    expect(dialog.open).toBe(true);
    expect(screen.getByTestId("state").textContent).toBe("open");
    await fireEvent.click(screen.getByRole("button", { name: "Save goal" }));
    expect(dialog.open).toBe(false);
    expect(screen.getByTestId("state").textContent).toBe("closed");
  });

  it("dragging the header down closes it; a drag in the body does nothing", async () => {
    render(DrawerHarness);
    const dialog = document.querySelector("dialog")!;
    dialog.getBoundingClientRect = () => ({ left: 0, right: 400, top: 300, bottom: 600, width: 400, height: 300, x: 0, y: 300, toJSON() {} });
    await fireEvent.click(screen.getByRole("button", { name: "Set goal" }));

    const body = screen.getByText("Body");
    await fireEvent.pointerDown(body, { clientY: 400, button: 0, pointerId: 1 });
    await fireEvent.pointerMove(dialog, { clientY: 600, pointerId: 1 });
    expect(dialog.style.transform).toBe("");
    await fireEvent.pointerUp(dialog, { clientY: 600, pointerId: 1 });
    expect(dialog.open).toBe(true);

    const title = screen.getByText("Daily goal");
    await fireEvent.pointerDown(title, { clientY: 320, button: 0, pointerId: 1 });
    await fireEvent.pointerMove(dialog, { clientY: 400, pointerId: 1 });
    expect(dialog.style.transform).toBe("translateY(80px)");
    await fireEvent.pointerUp(dialog, { clientY: 400, pointerId: 1 });
    expect(dialog.style.transform).toBe("");
    expect(dialog.open).toBe(false);
    expect(screen.getByTestId("state").textContent).toBe("closed");
  });

  it("dismissible={false} keeps it open after a drag", async () => {
    render(DrawerHarness, { props: { dismissible: false } });
    const dialog = document.querySelector("dialog")!;
    await fireEvent.click(screen.getByRole("button", { name: "Set goal" }));
    await fireEvent.pointerDown(screen.getByText("Daily goal"), { clientY: 10, button: 0, pointerId: 1 });
    await fireEvent.pointerMove(dialog, { clientY: 300, pointerId: 1 });
    await fireEvent.pointerUp(dialog, { clientY: 300, pointerId: 1 });
    expect(dialog.open).toBe(true);
  });
});

describe("HoverCard", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("opens after the delay on hover and closes after the pointer leaves", async () => {
    vi.useFakeTimers();
    const onOpenChange = vi.fn();
    render(HoverCardHarness, { props: { onOpenChange } });
    const link = screen.getByRole("link", { name: "@ada" });
    const card = document.querySelector<HTMLElement>(".vin-hover-card")!;
    expect(card.getAttribute("popover")).toBe("manual");

    await fireEvent.pointerEnter(link, { pointerType: "mouse" });
    vi.advanceTimersByTime(400);
    expect(isOpen(card)).toBe(false);
    vi.advanceTimersByTime(100);
    expect(isOpen(card)).toBe(true);
    expect(onOpenChange).toHaveBeenCalledWith(true);

    // Moving onto the card keeps it open.
    await fireEvent.pointerLeave(link, { pointerType: "mouse" });
    await fireEvent.pointerEnter(card, { pointerType: "mouse" });
    vi.advanceTimersByTime(1000);
    expect(isOpen(card)).toBe(true);

    await fireEvent.pointerLeave(card, { pointerType: "mouse" });
    vi.advanceTimersByTime(300);
    expect(isOpen(card)).toBe(false);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("touch doesn't open it; keyboard focus does, and Escape closes it", async () => {
    vi.useFakeTimers();
    render(HoverCardHarness);
    const link = screen.getByRole("link", { name: "@ada" });
    const card = document.querySelector<HTMLElement>(".vin-hover-card")!;
    await fireEvent.pointerEnter(link, { pointerType: "touch" });
    vi.advanceTimersByTime(1000);
    expect(isOpen(card)).toBe(false);

    link.focus();
    vi.advanceTimersByTime(0);
    expect(isOpen(card)).toBe(true);
    await fireEvent.keyDown(document, { key: "Escape" });
    vi.advanceTimersByTime(0);
    expect(isOpen(card)).toBe(false);
  });
});

describe("ContextMenu", () => {
  it("right-click opens the menu at the pointer and focuses the first item", async () => {
    const onOpenChange = vi.fn();
    render(ContextMenuHarness, { props: { onOpenChange } });
    const area = screen.getByText("Right-click here");
    const menu = document.querySelector<HTMLElement>(".vin-menu")!;
    expect(area.tabIndex).toBe(0);
    expect(menu.getAttribute("aria-label")).toBe("File actions");

    // jsdom lays nothing out: give the page a width so the menu isn't pushed to the margin.
    Object.defineProperty(document.documentElement, "clientWidth", { configurable: true, value: 1024 });
    await fireEvent.contextMenu(area, { clientX: 120, clientY: 80 });
    delete (document.documentElement as { clientWidth?: number }).clientWidth;
    expect(isOpen(menu)).toBe(true);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(menu.style.left).toBe("120px");
    expect(menu.style.top).toBe("80px");
    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "Rename" }));
  });

  it("arrows skip disabled items; choosing closes it and focus returns to the area", async () => {
    const onSelect = vi.fn();
    render(ContextMenuHarness, { props: { onSelect } });
    const area = screen.getByText("Right-click here");
    const menu = document.querySelector<HTMLElement>(".vin-menu")!;
    area.focus();
    await fireEvent.keyDown(area, { key: "F10", shiftKey: true });
    expect(isOpen(menu)).toBe(true);
    await fireEvent.keyDown(menu, { key: "ArrowDown" });
    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "Duplicate" }));
    await fireEvent.keyDown(menu, { key: "End" });
    expect(document.activeElement).toBe(screen.getByRole("menuitemcheckbox", { name: "Pinned" }));
    await fireEvent.keyDown(menu, { key: "r" });
    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "Rename" }));

    await fireEvent.click(screen.getByRole("menuitem", { name: "Rename" }));
    expect(onSelect).toHaveBeenCalledOnce();
    expect(isOpen(menu)).toBe(false);
    expect(document.activeElement).toBe(area);
  });

  it("the Menu key opens it, and checkbox items in the options example toggle", async () => {
    render(ContextMenuOptions);
    const area = screen.getByText("Right-click for view options");
    const menu = document.querySelector<HTMLElement>(".vin-menu")!;
    area.focus();
    await fireEvent.keyDown(area, { key: "ContextMenu" });
    expect(isOpen(menu)).toBe(true);
    const urls = screen.getByRole("menuitemcheckbox", { name: "Full URLs" });
    expect(urls.getAttribute("aria-checked")).toBe("false");
    await fireEvent.click(urls);
    expect(urls.getAttribute("aria-checked")).toBe("true");
  });
});

const groups = [
  {
    heading: "Suggestions",
    items: [
      { value: "calendar", label: "Calendar" },
      { value: "calculator", label: "Calculator", disabled: true },
      { value: "emoji", label: "Search emoji", keywords: "smiley face" },
    ],
  },
  {
    heading: "Settings",
    items: [
      { value: "profile", label: "Profile", shortcut: "⌘P" },
      { value: "billing", label: "Billing", keywords: "payment invoice" },
    ],
  },
];

describe("Command", () => {
  it("the first command is active; arrows skip disabled ones and wrap; Enter runs it", async () => {
    const onSelect = vi.fn();
    render(Command, { props: { groups, onSelect } });
    const input = screen.getByRole("combobox", { name: "Search commands" });
    const active = () => document.getElementById(input.getAttribute("aria-activedescendant")!)!.dataset.value;
    expect(input.getAttribute("aria-expanded")).toBe("true");
    expect(active()).toBe("calendar");
    expect(screen.getByRole("option", { name: /Calendar/ }).getAttribute("aria-selected")).toBe("true");

    await fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(active()).toBe("emoji");
    await fireEvent.keyDown(input, { key: "End", ctrlKey: true });
    expect(active()).toBe("billing");
    await fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(active()).toBe("calendar");
    await fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(active()).toBe("billing");
    await fireEvent.keyDown(input, { key: "Enter" });
    expect(onSelect).toHaveBeenCalledWith("billing");
  });

  it("filters by label and keywords, hides empty groups, and says when nothing matches", async () => {
    const onSelect = vi.fn();
    render(Command, { props: { groups, onSelect } });
    const input = screen.getByRole("combobox", { name: "Search commands" });
    const list = screen.getByRole("listbox", { name: "Commands" });
    const shown = () => [...list.querySelectorAll<HTMLElement>('[role="option"]')].filter((o) => !o.hidden).map((o) => o.dataset.value);
    const [first, second] = list.querySelectorAll<HTMLElement>('[role="group"]');

    await fireEvent.input(input, { target: { value: "smiley" } });
    expect(shown()).toEqual(["emoji"]);
    expect(second.hidden).toBe(true);
    expect(list.querySelector<HTMLElement>(".vin-command__separator")!.hidden).toBe(true);

    await fireEvent.input(input, { target: { value: "pay inv" } });
    expect(shown()).toEqual(["billing"]);
    expect(first.hidden).toBe(true);
    expect(document.querySelector<HTMLElement>(".vin-command__empty")!.hidden).toBe(true);

    await fireEvent.input(input, { target: { value: "nothing here" } });
    expect(shown()).toEqual([]);
    expect(document.querySelector<HTMLElement>(".vin-command__empty")!.hidden).toBe(false);
    expect(document.querySelector<HTMLElement>(".vin-command__empty")!.textContent).toBe("No results found.");

    await fireEvent.input(input, { target: { value: "" } });
    await fireEvent.click(screen.getByRole("option", { name: /Calculator/ }));
    expect(onSelect).not.toHaveBeenCalled();
    await fireEvent.click(screen.getByRole("option", { name: /Profile/ }));
    expect(onSelect).toHaveBeenCalledWith("profile");
  });
});

describe("CommandDialog", () => {
  it("opens from its trigger or Ctrl+K, closes when a command runs, and starts fresh", async () => {
    const onSelect = vi.fn();
    render(CommandDialogHarness, { props: { onSelect } });
    const trigger = screen.getByRole("button", { name: "Search docs" });
    const dialog = document.querySelector("dialog")!;
    expect(dialog.getAttribute("aria-label")).toBe("Search docs");
    expect(trigger.getAttribute("aria-haspopup")).toBe("dialog");
    expect(trigger.getAttribute("aria-keyshortcuts")).toBe("Meta+K Control+K");

    await fireEvent.click(trigger);
    expect(dialog.open).toBe(true);
    const input = screen.getByRole("combobox") as HTMLInputElement;
    await waitFor(() => expect(document.activeElement).toBe(input));

    await fireEvent.input(input, { target: { value: "accent" } });
    await fireEvent.keyDown(input, { key: "Enter" });
    expect(onSelect).toHaveBeenCalledWith("theming");
    expect(dialog.open).toBe(false);
    expect(screen.getByTestId("state").textContent).toBe("closed");

    await fireEvent.keyDown(document, { key: "k", ctrlKey: true });
    expect(dialog.open).toBe(true);
    await waitFor(() => expect(input.value).toBe(""));
    await fireEvent.keyDown(document, { key: "K", metaKey: true });
    expect(dialog.open).toBe(false);
  });
});
