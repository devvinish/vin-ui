import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/svelte";
import { flushSync } from "svelte";

import MenubarBasic from "../examples/menubar/basic.svelte";
import MenubarOptions from "../examples/menubar/options.svelte";
import NavigationMenuBasic from "../examples/navigation-menu/basic.svelte";
import SidebarBasic from "../examples/sidebar/basic.svelte";
import SidebarCollapsed from "../examples/sidebar/collapsed.svelte";
import SidebarHarness from "./fixtures/sidebar-harness.svelte";

const isOpen = (el: Element | null) => !!el?.matches(":popover-open");
const menuOf = (t: HTMLElement) => document.getElementById(t.getAttribute("popovertarget")!)!;
const trigger = (name: string) => screen.getByRole("menuitem", { name }) as HTMLButtonElement;

describe("Menubar", () => {
  it("is one tab stop: Left, Right, Home and End move it between the triggers, wrapping round", async () => {
    render(MenubarBasic);
    expect(screen.getByRole("menubar", { name: "Editor" })).toBeTruthy();
    const [file, edit, view] = ["File", "Edit", "View"].map(trigger);
    expect([file, edit, view].map((t) => t.tabIndex)).toEqual([0, -1, -1]);

    file.focus();
    await fireEvent.keyDown(file, { key: "ArrowRight" });
    expect(document.activeElement).toBe(edit);
    expect([file, edit, view].map((t) => t.tabIndex)).toEqual([-1, 0, -1]);

    await fireEvent.keyDown(edit, { key: "End" });
    expect(document.activeElement).toBe(view);
    await fireEvent.keyDown(view, { key: "ArrowRight" });
    expect(document.activeElement).toBe(file);
    await fireEvent.keyDown(file, { key: "ArrowLeft" });
    expect(document.activeElement).toBe(view);
    await fireEvent.keyDown(view, { key: "Home" });
    expect(document.activeElement).toBe(file);
    expect([file, edit, view].map((t) => t.tabIndex)).toEqual([0, -1, -1]);
  });

  it("Down Arrow opens a menu on its first item, Up Arrow on its last", async () => {
    render(MenubarBasic);
    const file = trigger("File");
    file.focus();
    await fireEvent.keyDown(file, { key: "ArrowDown" });
    expect(isOpen(menuOf(file))).toBe(true);
    expect(file.getAttribute("aria-expanded")).toBe("true");
    expect(document.activeElement?.textContent).toContain("New tab");

    // Disabled items are skipped.
    await fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });
    await fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });
    expect(document.activeElement?.textContent).toContain("Print…");

    menuOf(file).hidePopover();
    const edit = trigger("Edit");
    edit.focus();
    await fireEvent.keyDown(edit, { key: "ArrowUp" });
    expect(isOpen(menuOf(edit))).toBe(true);
    expect(document.activeElement?.textContent?.trim()).toBe("Paste");
  });

  it("Left and Right inside an open menu move to the next menu and open it", async () => {
    render(MenubarBasic);
    const [file, edit, view] = ["File", "Edit", "View"].map(trigger);
    file.focus();
    await fireEvent.keyDown(file, { key: "ArrowDown" });

    await fireEvent.keyDown(document.activeElement!, { key: "ArrowRight" });
    expect(isOpen(menuOf(file))).toBe(false);
    expect(isOpen(menuOf(edit))).toBe(true);
    expect(document.activeElement?.textContent).toContain("Undo");
    expect(edit.tabIndex).toBe(0);

    await fireEvent.keyDown(document.activeElement!, { key: "ArrowLeft" });
    await fireEvent.keyDown(document.activeElement!, { key: "ArrowLeft" });
    expect(isOpen(menuOf(edit))).toBe(false);
    expect(isOpen(menuOf(view))).toBe(true);
    expect(document.activeElement?.textContent).toContain("Zoom in");
    expect([file, edit, view].map((t) => t.tabIndex)).toEqual([-1, -1, 0]);
  });

  it("pointing at another trigger switches menus, but only while one is open", async () => {
    render(MenubarBasic);
    const [file, edit, view] = ["File", "Edit", "View"].map(trigger);
    await fireEvent.pointerEnter(edit);
    expect(isOpen(menuOf(edit))).toBe(false);

    menuOf(file).showPopover();
    await fireEvent.pointerEnter(view);
    expect(isOpen(menuOf(file))).toBe(false);
    expect(isOpen(menuOf(view))).toBe(true);
    expect(view.getAttribute("aria-expanded")).toBe("true");
    expect(file.getAttribute("aria-expanded")).toBe("false");
  });

  it("choosing an item closes the menu and puts focus back on its trigger; Tab closes it too", async () => {
    render(MenubarBasic);
    const file = trigger("File");
    file.focus();
    await fireEvent.keyDown(file, { key: "ArrowDown" });
    await fireEvent.click(document.activeElement!);
    expect(isOpen(menuOf(file))).toBe(false);
    expect(document.activeElement).toBe(file);

    await fireEvent.keyDown(file, { key: "ArrowDown" });
    await fireEvent.keyDown(document.activeElement!, { key: "Tab" });
    expect(isOpen(menuOf(file))).toBe(false);
    expect(document.activeElement).toBe(file);
  });

  it("holds checkbox and radio items", async () => {
    render(MenubarOptions);
    const show = trigger("Show");
    menuOf(show).showPopover();
    const bookmarks = screen.getByRole("menuitemcheckbox", { name: "Bookmarks bar" });
    expect(bookmarks.getAttribute("aria-checked")).toBe("true");
    await fireEvent.click(bookmarks);
    expect(bookmarks.getAttribute("aria-checked")).toBe("false");

    const profiles = trigger("Profiles");
    menuOf(profiles).showPopover();
    const grace = screen.getByRole("menuitemradio", { name: "Grace" });
    await fireEvent.click(grace);
    expect(grace.getAttribute("aria-checked")).toBe("true");
    expect(screen.getByRole("menuitemradio", { name: "Ada" }).getAttribute("aria-checked")).toBe("false");
  });
});

describe("Navigation Menu", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  const setup = () => {
    render(NavigationMenuBasic);
    const products = screen.getByRole("button", { name: "Products" }) as HTMLButtonElement;
    const panel = document.getElementById(products.getAttribute("aria-controls")!)!;
    return { products, panel };
  };

  it("pointing opens the panel after 120ms; leaving closes it 200ms later", async () => {
    vi.useFakeTimers();
    const { products, panel } = setup();
    await fireEvent.pointerEnter(products);
    vi.advanceTimersByTime(119);
    expect(isOpen(panel)).toBe(false);
    vi.advanceTimersByTime(1);
    flushSync();
    expect(isOpen(panel)).toBe(true);
    expect(products.getAttribute("aria-expanded")).toBe("true");

    // Moving from the button onto the panel keeps it open.
    await fireEvent.pointerLeave(products);
    vi.advanceTimersByTime(150);
    await fireEvent.pointerEnter(panel);
    vi.advanceTimersByTime(500);
    expect(isOpen(panel)).toBe(true);

    await fireEvent.pointerLeave(panel);
    vi.advanceTimersByTime(199);
    expect(isOpen(panel)).toBe(true);
    vi.advanceTimersByTime(1);
    flushSync();
    expect(isOpen(panel)).toBe(false);
    expect(products.getAttribute("aria-expanded")).toBe("false");
  });

  it("a quick pass over the button doesn't open it", async () => {
    vi.useFakeTimers();
    const { products, panel } = setup();
    await fireEvent.pointerEnter(products);
    vi.advanceTimersByTime(60);
    await fireEvent.pointerLeave(products);
    vi.advanceTimersByTime(1000);
    expect(isOpen(panel)).toBe(false);
  });

  it("a click keeps a hovered panel open; a second click closes it", async () => {
    vi.useFakeTimers();
    const { products, panel } = setup();
    await fireEvent.pointerEnter(products);
    vi.advanceTimersByTime(120);
    await fireEvent.click(products);
    await fireEvent.pointerLeave(products);
    vi.advanceTimersByTime(1000);
    expect(isOpen(panel)).toBe(true);
    await fireEvent.click(products);
    expect(isOpen(panel)).toBe(false);
  });

  it("Down Arrow opens the panel on its first link; arrows move through the links", async () => {
    const { products, panel } = setup();
    products.focus();
    await fireEvent.keyDown(products, { key: "ArrowDown" });
    expect(isOpen(panel)).toBe(true);
    expect(document.activeElement?.getAttribute("href")).toBe("#analytics");
    await fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });
    expect(document.activeElement?.getAttribute("href")).toBe("#automation");
    await fireEvent.keyDown(document.activeElement!, { key: "End" });
    expect(document.activeElement?.getAttribute("href")).toBe("#integrations");
    await fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });
    expect(document.activeElement?.getAttribute("href")).toBe("#analytics");
  });

  it("Escape closes the panel and puts focus back on its button", async () => {
    const { products, panel } = setup();
    products.focus();
    await fireEvent.keyDown(products, { key: "ArrowDown" });
    await fireEvent.keyDown(document.activeElement!, { key: "Escape" });
    expect(isOpen(panel)).toBe(false);
    expect(document.activeElement).toBe(products);
    expect(products.getAttribute("aria-expanded")).toBe("false");
  });

  it("Left, Right, Home and End move between the top-level items; the current page is marked", async () => {
    const { products } = setup();
    const resources = screen.getByRole("button", { name: "Resources" });
    const docs = screen.getByRole("link", { name: "Docs" });
    const pricing = screen.getByRole("link", { name: "Pricing" });
    expect(docs.getAttribute("aria-current")).toBe("page");
    expect(pricing.hasAttribute("aria-current")).toBe(false);

    products.focus();
    await fireEvent.keyDown(products, { key: "ArrowRight" });
    expect(document.activeElement).toBe(resources);
    await fireEvent.keyDown(resources, { key: "ArrowRight" });
    expect(document.activeElement).toBe(docs);
    await fireEvent.keyDown(docs, { key: "End" });
    expect(document.activeElement).toBe(pricing);
    await fireEvent.keyDown(pricing, { key: "ArrowRight" });
    expect(document.activeElement).toBe(products);
    await fireEvent.keyDown(products, { key: "ArrowLeft" });
    expect(document.activeElement).toBe(pricing);
  });
});

/** Stand in for matchMedia: `phone` says whether the screen is under 768px. */
function screenWidth(phone: boolean) {
  const listeners = new Set<() => void>();
  const mq = {
    matches: phone,
    addEventListener: (_: string, f: () => void) => listeners.add(f),
    removeEventListener: (_: string, f: () => void) => listeners.delete(f),
  };
  window.matchMedia = vi.fn(() => mq) as unknown as typeof window.matchMedia;
  return {
    set(on: boolean) {
      mq.matches = on;
      listeners.forEach((f) => f());
      flushSync();
    },
  };
}

describe("Sidebar", () => {
  afterEach(() => {
    delete (window as { matchMedia?: unknown }).matchMedia;
  });

  const parts = () => {
    const layout = document.querySelector<HTMLElement>(".vin-sidebar-layout")!;
    const nav = document.querySelector<HTMLElement>("nav.vin-sidebar")!;
    const btn = screen.getByRole("button", { name: "Toggle sidebar" });
    return { layout, nav, btn };
  };

  it("marks the active item with aria-current=page, and only that one", () => {
    screenWidth(false);
    render(SidebarBasic);
    const current = document.querySelectorAll('[aria-current="page"]');
    expect(current).toHaveLength(1);
    expect(current[0].getAttribute("href")).toBe("#dashboard");
    // The sidebar is a popover, hidden from the accessibility tree in jsdom, so look it up by selector.
    expect(document.querySelector("nav.vin-sidebar")!.getAttribute("aria-label")).toBe("App");
    const label = [...document.querySelectorAll(".vin-sidebar__label")].find((p) => p.textContent === "Platform")!;
    expect(document.querySelector(`ul[aria-labelledby="${label.id}"]`)!.classList.contains("vin-sidebar__menu")).toBe(true);
  });

  it("768px and wider, the trigger folds it to icons (data-state=collapsed) and back", async () => {
    screenWidth(false);
    render(SidebarHarness);
    const { layout, nav, btn } = parts();
    expect(btn.getAttribute("aria-controls")).toBe(nav.id);
    expect(btn.getAttribute("aria-expanded")).toBe("true");
    expect(layout.hasAttribute("data-state")).toBe(false);

    await fireEvent.click(btn);
    expect(layout.getAttribute("data-state")).toBe("collapsed");
    expect(btn.getAttribute("aria-expanded")).toBe("false");
    expect(isOpen(nav)).toBe(false);
    // Folded, each item's name is its tooltip.
    expect(document.querySelector('a[href="#dashboard"]')!.getAttribute("title")).toBe("Dashboard");

    await fireEvent.click(btn);
    expect(layout.hasAttribute("data-state")).toBe(false);
    expect(document.querySelector('a[href="#dashboard"]')!.hasAttribute("title")).toBe(false);
    expect(screen.getByTestId("changes").textContent).toBe("true,false");
  });

  it("folded, opening a nested list unfolds the sidebar", async () => {
    screenWidth(false);
    render(SidebarHarness, { props: { collapsed: true } });
    const { layout } = parts();
    expect(layout.getAttribute("data-state")).toBe("collapsed");
    const summary = document.querySelector("summary")!;
    expect(summary.getAttribute("title")).toBe("Projects");
    await fireEvent.click(summary);
    expect(layout.hasAttribute("data-state")).toBe(false);
    expect(document.querySelector("details")!.open).toBe(true);
  });

  it("starts folded with bind:collapsed", () => {
    screenWidth(false);
    render(SidebarCollapsed);
    expect(parts().layout.getAttribute("data-state")).toBe("collapsed");
    expect(parts().btn.getAttribute("aria-expanded")).toBe("false");
  });

  it("under 768px it's an off-canvas popover: the trigger opens it on the current page, a link closes it", async () => {
    screenWidth(true);
    render(SidebarHarness);
    const { layout, nav, btn } = parts();
    expect(btn.getAttribute("aria-expanded")).toBe("false");

    await fireEvent.click(btn);
    expect(isOpen(nav)).toBe(true);
    expect(layout.hasAttribute("data-state")).toBe(false);
    expect(btn.getAttribute("aria-expanded")).toBe("true");
    expect(document.activeElement?.getAttribute("href")).toBe("#inbox");

    await fireEvent.click(screen.getByRole("link", { name: "Dashboard" }));
    expect(isOpen(nav)).toBe(false);
    expect(btn.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(btn);
  });

  it("growing past a phone closes the off-canvas sidebar", async () => {
    const width = screenWidth(true);
    render(SidebarHarness);
    const { nav, btn } = parts();
    await fireEvent.click(btn);
    expect(isOpen(nav)).toBe(true);
    width.set(false);
    expect(isOpen(nav)).toBe(false);
    expect(btn.getAttribute("aria-expanded")).toBe("true");
  });
});
