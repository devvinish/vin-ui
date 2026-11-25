import { describe, it, expect, vi, afterEach } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import { defineComponent, h, nextTick } from "vue";
import Menubar, { MenubarMenu } from "../src/menubar.vue";
import { DropdownMenuItem } from "../src/dropdown-menu.vue";
import NavigationMenu, { NavigationMenuItem, NavigationMenuLink, NavigationMenuGrid, NavigationMenuCard } from "../src/navigation-menu.vue";
import SidebarLayout, { Sidebar, SidebarContent, SidebarGroup, SidebarItem, SidebarSub, SidebarInset, SidebarTrigger } from "../src/sidebar.vue";

const mounted: VueWrapper[] = [];
const attach = <T extends VueWrapper>(w: T) => { mounted.push(w); return w; };
afterEach(() => { mounted.splice(0).forEach((w) => w.unmount()); document.body.innerHTML = ""; vi.useRealTimers(); vi.unstubAllGlobals(); });
const key = (el: Element, k: string) => el.dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true, cancelable: true }));
const pointer = (el: Element, type: string) => el.dispatchEvent(new PointerEvent(type, { pointerType: "mouse" }));
const isOpen = (el: Element) => el.matches(":popover-open");

describe("Menubar", () => {
  const onSelect = vi.fn();
  const Demo = defineComponent({
    setup: () => () =>
      h(Menubar, { label: "Editor" }, () => [
        h(MenubarMenu, { label: "File" }, () => [h(DropdownMenuItem, { onSelect }, () => "New tab"), h(DropdownMenuItem, null, () => "Print")]),
        h(MenubarMenu, { label: "Edit" }, () => [h(DropdownMenuItem, null, () => "Undo"), h(DropdownMenuItem, null, () => "Redo")]),
        h(MenubarMenu, { label: "View" }, () => [h(DropdownMenuItem, null, () => "Zoom in")]),
      ]),
  });
  const make = () => {
    const w = attach(mount(Demo, { attachTo: document.body }));
    return { w, triggers: w.findAll(".vin-menubar__trigger").map((t) => t.element as HTMLButtonElement), menus: w.findAll('[role="menu"]').map((m) => m.element as HTMLElement) };
  };

  it("is a labelled menubar with one tab stop that arrows move", async () => {
    const { w, triggers } = make();
    expect(w.get('[role="menubar"]').attributes("aria-label")).toBe("Editor");
    expect(triggers.map((t) => t.tabIndex)).toEqual([0, -1, -1]);
    expect(triggers[0].getAttribute("aria-haspopup")).toBe("menu");
    triggers[0].focus();
    key(triggers[0], "ArrowRight");
    await nextTick();
    expect(document.activeElement).toBe(triggers[1]);
    expect(triggers.map((t) => t.tabIndex)).toEqual([-1, 0, -1]);
    key(triggers[1], "End");
    await nextTick();
    expect(document.activeElement).toBe(triggers[2]);
    key(triggers[2], "ArrowRight");
    await nextTick();
    expect(document.activeElement).toBe(triggers[0]);
  });

  it("Down Arrow opens a menu on its first item; Right moves to the next menu", async () => {
    const { triggers, menus } = make();
    triggers[0].focus();
    key(triggers[0], "ArrowDown");
    await nextTick();
    expect(isOpen(menus[0])).toBe(true);
    expect(triggers[0].getAttribute("aria-expanded")).toBe("true");
    expect(document.activeElement?.textContent).toContain("New tab");
    key(document.activeElement!, "ArrowRight");
    await nextTick();
    expect(isOpen(menus[1])).toBe(true);
    expect(document.activeElement?.textContent).toContain("Undo");
    key(document.activeElement!, "ArrowLeft");
    await nextTick();
    expect(document.activeElement?.textContent).toContain("New tab");
  });

  it("Up Arrow opens on the last item", async () => {
    const { triggers, menus } = make();
    triggers[1].focus();
    key(triggers[1], "ArrowUp");
    await nextTick();
    expect(isOpen(menus[1])).toBe(true);
    expect(document.activeElement?.textContent).toContain("Redo");
  });

  it("hovering another trigger while a menu is open switches to it", async () => {
    const { triggers, menus } = make();
    pointer(triggers[1], "pointerenter");
    expect(isOpen(menus[1])).toBe(false);
    triggers[0].click();
    expect(isOpen(menus[0])).toBe(true);
    pointer(triggers[1], "pointerenter");
    await nextTick();
    expect(isOpen(menus[1])).toBe(true);
  });

  it("choosing an item closes the menu and returns focus to its button", async () => {
    onSelect.mockClear();
    const { triggers, menus } = make();
    triggers[0].click();
    (menus[0].querySelector('[role="menuitem"]') as HTMLElement).click();
    await nextTick();
    expect(onSelect).toHaveBeenCalled();
    expect(isOpen(menus[0])).toBe(false);
    expect(document.activeElement).toBe(triggers[0]);
  });
});

describe("NavigationMenu", () => {
  const Demo = defineComponent({
    setup: () => () =>
      h(NavigationMenu, { label: "Main" }, () => [
        h(NavigationMenuItem, { trigger: "Products" }, () =>
          h(NavigationMenuGrid, null, () => [
            h(NavigationMenuCard, { href: "#a", title: "Analytics" }, () => "See what's working."),
            h(NavigationMenuCard, { href: "#b", title: "Automation" }),
          ])),
        h(NavigationMenuLink, { href: "#docs", active: true }, () => "Docs"),
      ]),
  });
  const make = () => {
    const w = attach(mount(Demo, { attachTo: document.body }));
    return { w, btn: w.get(".vin-nav-menu__trigger").element as HTMLButtonElement, panel: w.get(".vin-nav-menu__panel").element as HTMLElement };
  };

  it("renders a labelled nav with a disclosure button and an active link", () => {
    const { w, btn, panel } = make();
    expect(w.get("nav").attributes("aria-label")).toBe("Main");
    expect(btn.getAttribute("aria-controls")).toBe(panel.id);
    expect(btn.getAttribute("aria-expanded")).toBe("false");
    expect(w.get(".vin-nav-menu__link").attributes("aria-current")).toBe("page");
    expect(w.findAll(".vin-nav-menu__card-text")).toHaveLength(1);
  });

  it("opens 120ms after hover and closes 200ms after leaving", async () => {
    vi.useFakeTimers();
    const { btn, panel } = make();
    pointer(btn, "pointerenter");
    vi.advanceTimersByTime(100);
    expect(isOpen(panel)).toBe(false);
    vi.advanceTimersByTime(30);
    expect(isOpen(panel)).toBe(true);
    await nextTick();
    expect(btn.getAttribute("aria-expanded")).toBe("true");
    pointer(btn, "pointerleave");
    vi.advanceTimersByTime(150);
    pointer(panel, "pointerenter");
    vi.advanceTimersByTime(300);
    expect(isOpen(panel)).toBe(true);
    pointer(panel, "pointerleave");
    vi.advanceTimersByTime(210);
    expect(isOpen(panel)).toBe(false);
  });

  it("a click pins it open; a second click closes", () => {
    vi.useFakeTimers();
    const { btn, panel } = make();
    btn.click();
    expect(isOpen(panel)).toBe(true);
    pointer(btn, "pointerleave");
    vi.advanceTimersByTime(500);
    expect(isOpen(panel)).toBe(true);
    btn.click();
    expect(isOpen(panel)).toBe(false);
  });

  it("Down Arrow opens on the first link, arrows move, Escape closes and focuses the trigger", async () => {
    const { btn, panel } = make();
    btn.focus();
    key(btn, "ArrowDown");
    await nextTick();
    expect(isOpen(panel)).toBe(true);
    const links = panel.querySelectorAll("a");
    expect(document.activeElement).toBe(links[0]);
    key(links[0], "ArrowDown");
    expect(document.activeElement).toBe(links[1]);
    key(links[1], "Escape");
    expect(isOpen(panel)).toBe(false);
    expect(document.activeElement).toBe(btn);
  });

  it("Right Arrow moves between top-level items", () => {
    const { w, btn } = make();
    btn.focus();
    key(btn, "ArrowRight");
    expect(document.activeElement).toBe(w.get(".vin-nav-menu__link").element);
  });
});

describe("Sidebar", () => {
  const stubPhone = (phone: boolean) =>
    vi.stubGlobal("matchMedia", (q: string) => ({ matches: phone, media: q, addEventListener() {}, removeEventListener() {} }));
  const Demo = (props: Record<string, unknown> = {}) => defineComponent({
    setup: () => () =>
      h(SidebarLayout, props, () => [
        h(Sidebar, { label: "App" }, () =>
          h(SidebarContent, null, () =>
            h(SidebarGroup, { label: "Platform" }, () => [
              h(SidebarItem, { href: "#home" }, { icon: () => h("svg"), default: () => "Home" }),
              h(SidebarItem, { href: "#inbox", active: true, badge: 12 }, { icon: () => h("svg"), default: () => "Inbox" }),
              h(SidebarSub, { label: "Projects" }, () => h(SidebarItem, { href: "#web" }, () => "Website")),
            ]))),
        h(SidebarInset, null, () => h(SidebarTrigger)),
      ]),
  });
  const make = async (props: Record<string, unknown> = {}) => {
    const w = attach(mount(Demo(props), { attachTo: document.body }));
    await nextTick();
    return { w, layout: w.get(".vin-sidebar-layout"), nav: w.get("nav").element as HTMLElement, trigger: w.get(".vin-sidebar__trigger").element as HTMLButtonElement };
  };

  it("labels the navigation, groups and marks the current page", async () => {
    stubPhone(false);
    const { w, nav, trigger } = await make();
    expect(nav.getAttribute("aria-label")).toBe("App");
    expect(nav.getAttribute("popover")).toBe("auto");
    expect(trigger.getAttribute("aria-controls")).toBe(nav.id);
    expect(trigger.getAttribute("aria-label")).toBe("Toggle sidebar");
    const menu = w.get(".vin-sidebar__group ul");
    expect(menu.attributes("aria-labelledby")).toBe(w.get(".vin-sidebar__label").attributes("id"));
    const active = w.findAll('[aria-current="page"]');
    expect(active).toHaveLength(1);
    expect(active[0].text()).toContain("Inbox");
    expect(w.get(".vin-sidebar__badge").text()).toBe("12");
  });

  it("on wide screens the trigger folds it to icons, with tooltips", async () => {
    stubPhone(false);
    const { w, layout, trigger } = await make();
    expect(layout.attributes("data-state")).toBeUndefined();
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(w.get(".vin-sidebar__item").attributes("title")).toBeUndefined();
    trigger.click();
    await nextTick();
    expect(layout.attributes("data-state")).toBe("collapsed");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(w.findAll("a.vin-sidebar__item").map((a) => a.attributes("title"))).toEqual(["Home", "Inbox", "Website"]);
    expect(w.get("summary").attributes("title")).toBe("Projects");
    trigger.click();
    await nextTick();
    expect(layout.attributes("data-state")).toBeUndefined();
  });

  it("supports v-model:collapsed", async () => {
    stubPhone(false);
    const onUpdate = vi.fn();
    const { layout, trigger } = await make({ collapsed: true, "onUpdate:collapsed": onUpdate });
    expect(layout.attributes("data-state")).toBe("collapsed");
    trigger.click();
    expect(onUpdate).toHaveBeenCalledWith(false);
  });

  it("folded, a nested list's button unfolds the sidebar and opens the list", async () => {
    stubPhone(false);
    const { w, layout } = await make({ defaultCollapsed: true });
    const summary = w.get("summary").element as HTMLElement;
    summary.click();
    await nextTick();
    expect(layout.attributes("data-state")).toBeUndefined();
    expect((summary.parentElement as HTMLDetailsElement).open).toBe(true);
  });

  it("on phones the trigger opens it as a popover on the current page", async () => {
    stubPhone(true);
    const { w, layout, nav, trigger } = await make();
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    trigger.click();
    await nextTick();
    expect(isOpen(nav)).toBe(true);
    expect(layout.attributes("data-state")).toBeUndefined();
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(document.activeElement).toBe(w.get('[aria-current="page"]').element);
    // Following a link closes it.
    (w.get('a[href="#home"]').element as HTMLElement).click();
    expect(isOpen(nav)).toBe(false);
  });
});
