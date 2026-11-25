import { describe, it, expect, vi, afterEach } from "vitest";
import { mount, flushPromises, type VueWrapper } from "@vue/test-utils";
import { createSSRApp, defineComponent, h, nextTick } from "vue";
import { renderToString } from "@vue/server-renderer";
import Button from "../src/button.vue";
import Calendar, { monthDays } from "../src/calendar.vue";
import DatePicker, { formatDate } from "../src/date-picker.vue";
import Combobox from "../src/combobox.vue";
import Drawer, { DrawerClose } from "../src/drawer.vue";
import HoverCard from "../src/hover-card.vue";
import ContextMenu from "../src/context-menu.vue";
import { DropdownMenuItem } from "../src/dropdown-menu.vue";
import Command, { CommandDialog, type CommandGroup } from "../src/command.vue";

const mounted: VueWrapper[] = [];
const attach = <T extends VueWrapper>(w: T) => { mounted.push(w); return w; };
afterEach(() => { mounted.splice(0).forEach((w) => w.unmount()); document.body.innerHTML = ""; vi.useRealTimers(); });
const key = (el: Element, k: string, init: KeyboardEventInit = {}) =>
  el.dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true, cancelable: true, ...init }));
const isOpen = (el: Element) => el.matches(":popover-open");

describe("Calendar", () => {
  it("lays out 6 weeks starting on Monday (or Sunday)", () => {
    const days = monthDays("2026-11");
    expect(days).toHaveLength(42);
    expect(days[0]).toBe("2026-10-26");
    expect(monthDays("2026-11", 0)[0]).toBe("2026-11-01");
  });

  it("marks today only on the client, so server HTML doesn't depend on the clock", async () => {
    const ssr = await renderToString(createSSRApp({ render: () => h(Calendar, { defaultMonth: "2026-11" }) }));
    expect(ssr).not.toContain('aria-current="date"');
    const w = attach(mount(Calendar));
    await nextTick();
    expect(w.findAll('[aria-current="date"]')).toHaveLength(1);
  });

  it("selects a day with v-model and gives it the tab stop", async () => {
    const onChange = vi.fn(), onDay = vi.fn();
    const w = attach(mount(Calendar, { props: { defaultValue: "2026-11-14", "onUpdate:modelValue": onChange, "onDayClick": onDay } }));
    expect(w.get(".vin-calendar__title").text()).toBe("November 2026");
    expect(w.get('[data-date="2026-11-14"]').attributes("tabindex")).toBe("0");
    expect(w.get('[data-date="2026-11-14"]').element.parentElement!.getAttribute("aria-selected")).toBe("true");
    expect(w.get('[data-date="2026-11-14"]').attributes("aria-label")).toBe("Saturday, November 14, 2026");
    await w.get('[data-date="2026-11-20"]').trigger("click");
    expect(onChange).toHaveBeenLastCalledWith("2026-11-20");
    expect(onDay).toHaveBeenLastCalledWith("2026-11-20");
    expect(w.get('[data-date="2026-11-20"]').attributes("tabindex")).toBe("0");
  });

  it("moves focus with the arrow keys and PageDown, changing month", async () => {
    const onMonth = vi.fn();
    const w = attach(mount(Calendar, { props: { defaultValue: "2026-11-30", "onUpdate:month": onMonth }, attachTo: document.body }));
    const day = w.get<HTMLButtonElement>('[data-date="2026-11-30"]').element;
    day.focus();
    key(day, "ArrowRight");
    await flushPromises();
    expect(onMonth).toHaveBeenLastCalledWith("2026-12");
    expect(w.get(".vin-calendar__title").text()).toBe("December 2026");
    expect((document.activeElement as HTMLElement).dataset.date).toBe("2026-12-01");
    key(document.activeElement!, "PageDown", { shiftKey: true });
    await flushPromises();
    expect((document.activeElement as HTMLElement).dataset.date).toBe("2027-12-01");
  });

  it("blocks days outside min/max and those isDateDisabled rejects", async () => {
    const onChange = vi.fn();
    const w = attach(mount(Calendar, {
      props: { defaultMonth: "2026-11", min: "2026-11-05", isDateDisabled: (d: string) => d === "2026-11-10", "onUpdate:modelValue": onChange },
    }));
    expect(w.get('[data-date="2026-11-04"]').attributes("aria-disabled")).toBe("true");
    await w.get('[data-date="2026-11-04"]').trigger("click");
    await w.get('[data-date="2026-11-10"]').trigger("click");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("chooses a range in two clicks, in either order", async () => {
    const onChange = vi.fn();
    const w = attach(mount(Calendar, { props: { mode: "range", defaultMonth: "2026-11", "onUpdate:modelValue": onChange } }));
    await w.get('[data-date="2026-11-15"]').trigger("click");
    expect(onChange).toHaveBeenLastCalledWith({ from: "2026-11-15" });
    await w.get('[data-date="2026-11-09"]').trigger("click");
    expect(onChange).toHaveBeenLastCalledWith({ from: "2026-11-09", to: "2026-11-15" });
    expect(w.get('[data-date="2026-11-09"]').element.parentElement!.dataset.range).toBe("start");
    expect(w.get('[data-date="2026-11-12"]').element.parentElement!.dataset.range).toBe("middle");
    expect(w.get('[data-date="2026-11-15"]').element.parentElement!.dataset.range).toBe("end");
  });
});

describe("DatePicker", () => {
  it("formats dates and ranges by hand, in UTC", () => {
    expect(formatDate("2026-11-14")).toBe("Nov 14, 2026");
    expect(formatDate({ from: "2026-11-09", to: "2026-11-15" })).toBe("Nov 9 – Nov 15, 2026");
    expect(formatDate({ from: "2026-12-28", to: "2027-01-03" })).toBe("Dec 28, 2026 – Jan 3, 2027");
  });

  it("links the trigger to its popover and shows the placeholder when empty", () => {
    const w = attach(mount(DatePicker, { props: { label: "Start date", error: "Pick one" } }));
    const btn = w.get(".vin-date-picker__trigger"), pop = w.get(".vin-date-picker__content");
    expect(btn.attributes("popovertarget")).toBe(pop.attributes("id"));
    expect(btn.attributes("aria-labelledby")).toBe(`${w.get(".vin-label").attributes("id")} ${btn.attributes("id")}`);
    expect(btn.attributes("aria-invalid")).toBe("true");
    expect(pop.attributes("aria-label")).toBe("Choose start date");
    expect(w.get(".vin-date-picker__value").attributes("data-placeholder")).toBe("");
    expect(w.get(".vin-date-picker__value").text()).toBe("Pick a date");
  });

  it("opens, picks a day, closes and updates the value and hidden input", async () => {
    const onChange = vi.fn();
    const w = attach(mount(DatePicker, { props: { label: "Due", defaultValue: "2026-11-14", name: "due", "onUpdate:modelValue": onChange }, attachTo: document.body }));
    const pop = w.get(".vin-date-picker__content").element;
    await w.get(".vin-date-picker__trigger").trigger("click");
    expect(isOpen(pop)).toBe(true);
    expect(w.get(".vin-date-picker__trigger").attributes("aria-expanded")).toBe("true");
    expect((document.activeElement as HTMLElement).dataset.date).toBe("2026-11-14");
    await w.get('[data-date="2026-11-20"]').trigger("click");
    expect(onChange).toHaveBeenLastCalledWith("2026-11-20");
    expect(isOpen(pop)).toBe(false);
    expect(w.get(".vin-date-picker__value").text()).toBe("Nov 20, 2026");
    expect(w.get<HTMLInputElement>('input[type="hidden"]').element.value).toBe("2026-11-20");
    expect(document.activeElement).toBe(w.get(".vin-date-picker__trigger").element);
  });

  it("keeps a half-chosen range as a draft until the second day", async () => {
    const onChange = vi.fn();
    const w = attach(mount(DatePicker, {
      props: { label: "Trip", mode: "range", defaultValue: { from: "2026-11-09", to: "2026-11-15" }, name: "trip", "onUpdate:modelValue": onChange },
      attachTo: document.body,
    }));
    expect(w.get(".vin-date-picker__value").text()).toBe("Nov 9 – Nov 15, 2026");
    const pop = w.get(".vin-date-picker__content").element;
    await w.get(".vin-date-picker__trigger").trigger("click");
    await w.get('[data-date="2026-11-20"]').trigger("click");
    expect(onChange).not.toHaveBeenCalled();
    expect(isOpen(pop)).toBe(true);
    expect(w.get(".vin-date-picker__value").text()).toBe("Nov 9 – Nov 15, 2026");
    await w.get('[data-date="2026-11-24"]').trigger("click");
    expect(onChange).toHaveBeenLastCalledWith({ from: "2026-11-20", to: "2026-11-24" });
    expect(isOpen(pop)).toBe(false);
    expect(w.get<HTMLInputElement>('input[type="hidden"]').element.value).toBe("2026-11-20/2026-11-24");
  });

  it("puts class on the picker itself without a label", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const w = attach(mount(DatePicker, { attrs: { class: "x", "aria-label": "Date" } }));
    expect(w.get(".vin-date-picker").classes()).toEqual(["vin-date-picker", "x"]);
    expect(w.find(".vin-field").exists()).toBe(false);
    expect(w.get("button").attributes("aria-label")).toBe("Date");
  });
});

describe("Combobox", () => {
  const options = [
    { value: "au", label: "Australia" },
    { value: "at", label: "Österreich" },
    { value: "jp", label: "Japan", disabled: true },
    { value: "gb", label: "United Kingdom" },
  ];
  const make = (props: Record<string, unknown> = {}) =>
    attach(mount(Combobox, { props: { label: "Country", options, name: "country", ...props }, attachTo: document.body }));

  it("filters as you type, ignoring case and accents, and chooses with Enter", async () => {
    const onChange = vi.fn();
    const w = make({ "onUpdate:modelValue": onChange });
    const input = w.get<HTMLInputElement>('input[role="combobox"]');
    expect(w.get("label").attributes("for")).toBe(input.attributes("id"));
    await input.setValue("oster");
    expect(isOpen(w.get(".vin-combobox__content").element)).toBe(true);
    expect(input.attributes("aria-expanded")).toBe("true");
    const visible = w.findAll(".vin-select__item").filter((o) => o.attributes("hidden") === undefined);
    expect(visible.map((o) => o.text())).toEqual(["Österreich"]);
    expect(input.attributes("aria-activedescendant")).toBe(visible[0].attributes("id"));
    key(input.element, "Enter");
    await nextTick();
    expect(onChange).toHaveBeenLastCalledWith("at");
    expect(input.element.value).toBe("Österreich");
    expect(w.get<HTMLInputElement>('input[type="hidden"]').element.value).toBe("at");
    expect(input.attributes("aria-expanded")).toBe("false");
  });

  it("shows the empty message when nothing matches", async () => {
    const w = make({ emptyText: "Nothing here." });
    await w.get('input[role="combobox"]').setValue("zzz");
    const empty = w.get(".vin-combobox__empty");
    expect(empty.attributes("hidden")).toBeUndefined();
    expect(empty.text()).toBe("Nothing here.");
  });

  it("skips disabled options with the arrow keys", async () => {
    const w = make({ defaultValue: "at" });
    const input = w.get('input[role="combobox"]');
    key(input.element, "ArrowDown");
    await nextTick();
    expect(input.attributes("aria-activedescendant")).toBe(w.findAll(".vin-select__item")[1].attributes("id"));
    key(input.element, "ArrowDown");
    await nextTick();
    expect(input.attributes("aria-activedescendant")).toBe(w.findAll(".vin-select__item")[3].attributes("id"));
  });

  it("Escape restores the text while open, and clears the value when closed", async () => {
    const onChange = vi.fn();
    const w = make({ defaultValue: "gb", "onUpdate:modelValue": onChange });
    const input = w.get<HTMLInputElement>('input[role="combobox"]');
    expect(input.element.value).toBe("United Kingdom");
    await input.setValue("Aus");
    key(input.element, "Escape");
    await nextTick();
    expect(input.element.value).toBe("United Kingdom");
    key(input.element, "Escape");
    await nextTick();
    expect(input.element.value).toBe("");
    expect(onChange).toHaveBeenLastCalledWith("");
  });

  it("chooses an option by click and groups options under headings", async () => {
    const onChange = vi.fn();
    const w = make({
      options: [{ value: "a", label: "Apple", group: "Fruit" }, { value: "c", label: "Carrot", group: "Veg" }],
      "onUpdate:modelValue": onChange,
    });
    const groups = w.findAll(".vin-combobox__group");
    expect(groups.map((g) => g.get(".vin-combobox__label").text())).toEqual(["Fruit", "Veg"]);
    expect(groups[0].attributes("aria-labelledby")).toBe(groups[0].get(".vin-combobox__label").attributes("id"));
    await w.get('input[role="combobox"]').trigger("click");
    await w.findAll(".vin-select__item")[1].trigger("click");
    expect(onChange).toHaveBeenLastCalledWith("c");
  });

  it("follows v-model", async () => {
    const w = make({ modelValue: "au" });
    await w.setProps({ modelValue: "gb" });
    expect(w.get<HTMLInputElement>('input[role="combobox"]').element.value).toBe("United Kingdom");
  });
});

describe("Drawer", () => {
  const Demo = defineComponent({
    setup: () => () =>
      h(Drawer, { title: "Daily goal" }, {
        trigger: () => h(Button, null, () => "Open"),
        default: () => h("p", "Body"),
        footer: () => h(DrawerClose, null, () => h(Button, { variant: "outline" }, () => "Cancel")),
      }),
  });

  it("is a bottom sheet with the drawer class, and DrawerClose closes it", async () => {
    const w = attach(mount(Demo, { attachTo: document.body }));
    const dlg = w.get<HTMLDialogElement>("dialog");
    expect(dlg.classes()).toEqual(expect.arrayContaining(["vin-dialog", "vin-sheet", "vin-drawer"]));
    expect(dlg.attributes("data-side")).toBe("bottom");
    await w.findAll("button")[0].trigger("click");
    expect(dlg.element.open).toBe(true);
    await w.get(".vin-dialog__footer .vin-btn--outline").trigger("click");
    expect(dlg.element.open).toBe(false);
  });

  it("closes when the handle is dragged far enough down", async () => {
    const w = attach(mount(Demo, { attachTo: document.body }));
    const dlg = w.get<HTMLDialogElement>("dialog").element;
    await w.findAll("button")[0].trigger("click");
    const ev = (type: string, y: number) => new PointerEvent(type, { clientY: y, button: 0, bubbles: true });
    dlg.dispatchEvent(ev("pointerdown", 10));
    dlg.dispatchEvent(ev("pointermove", 100));
    expect(dlg.style.transform).toBe("translateY(90px)");
    dlg.dispatchEvent(ev("pointerup", 300));
    expect(dlg.style.transform).toBe("");
    expect(dlg.open).toBe(false);
  });
});

describe("HoverCard", () => {
  const make = (props: Record<string, unknown> = {}) =>
    attach(mount(HoverCard, {
      props,
      slots: { trigger: () => h("a", { href: "#", class: "vin-link" }, "@ada"), default: () => h("p", "Ada Lovelace") },
      attachTo: document.body,
    }));

  it("opens after the delay on hover and closes after the pointer leaves", async () => {
    vi.useFakeTimers();
    const onOpen = vi.fn();
    const w = make({ "onUpdate:open": onOpen });
    const card = w.get(".vin-hover-card").element, link = w.get("a").element;
    expect(card.getAttribute("popover")).toBe("manual");
    link.dispatchEvent(new PointerEvent("pointerenter", { pointerType: "mouse" }));
    vi.advanceTimersByTime(400);
    expect(isOpen(card)).toBe(false);
    vi.advanceTimersByTime(100);
    expect(isOpen(card)).toBe(true);
    expect(onOpen).toHaveBeenLastCalledWith(true);
    link.dispatchEvent(new PointerEvent("pointerleave"));
    card.dispatchEvent(new PointerEvent("pointerenter")); // moving onto the card keeps it open
    vi.advanceTimersByTime(500);
    expect(isOpen(card)).toBe(true);
    card.dispatchEvent(new PointerEvent("pointerleave"));
    vi.advanceTimersByTime(300);
    expect(isOpen(card)).toBe(false);
    expect(onOpen).toHaveBeenLastCalledWith(false);
  });

  it("closes on Escape, and sets data-side unless bottom", async () => {
    vi.useFakeTimers();
    const w = make({ side: "top", openDelay: 0 });
    const card = w.get(".vin-hover-card").element;
    expect(card.getAttribute("data-side")).toBe("top");
    w.get("a").element.dispatchEvent(new PointerEvent("pointerenter", { pointerType: "mouse" }));
    vi.advanceTimersByTime(0);
    expect(isOpen(card)).toBe(true);
    key(document.body, "Escape");
    vi.advanceTimersByTime(0);
    expect(isOpen(card)).toBe(false);
  });

  it("does not open on touch", () => {
    vi.useFakeTimers();
    const w = make();
    w.get("a").element.dispatchEvent(new PointerEvent("pointerenter", { pointerType: "touch" }));
    vi.advanceTimersByTime(1000);
    expect(isOpen(w.get(".vin-hover-card").element)).toBe(false);
  });
});

describe("ContextMenu", () => {
  const make = (onSelect = vi.fn()) =>
    attach(mount(ContextMenu, {
      props: { label: "File actions" },
      attrs: { class: "area" },
      slots: {
        default: () => "Right-click here",
        content: () => [h(DropdownMenuItem, { onSelect }, () => "Rename"), h(DropdownMenuItem, null, () => "Delete")],
      },
      attachTo: document.body,
    }));

  it("opens on right-click, focuses the first item, and an item closes it", async () => {
    const onSelect = vi.fn();
    const w = make(onSelect);
    const area = w.get(".vin-context-menu"), menu = w.get('[role="menu"]');
    expect(area.classes()).toContain("area");
    expect(area.attributes("tabindex")).toBe("0");
    expect(menu.attributes("aria-label")).toBe("File actions");
    const e = new MouseEvent("contextmenu", { clientX: 40, clientY: 50, bubbles: true, cancelable: true });
    area.element.dispatchEvent(e);
    expect(e.defaultPrevented).toBe(true);
    expect(isOpen(menu.element)).toBe(true);
    expect(document.activeElement?.textContent).toBe("Rename");
    key(document.activeElement!, "ArrowDown");
    expect(document.activeElement?.textContent).toBe("Delete");
    await w.findAll('[role="menuitem"]')[0].trigger("click");
    expect(onSelect).toHaveBeenCalledOnce();
    expect(isOpen(menu.element)).toBe(false);
    expect(document.activeElement).toBe(area.element);
  });

  it("opens with Shift+F10 and the Menu key", () => {
    const w = make();
    const area = w.get(".vin-context-menu").element, menu = w.get<HTMLDivElement>('[role="menu"]').element;
    key(area, "F10", { shiftKey: true });
    expect(isOpen(menu)).toBe(true);
    menu.hidePopover();
    key(area, "ContextMenu");
    expect(isOpen(menu)).toBe(true);
  });

  it("opens after a touch long-press", () => {
    vi.useFakeTimers();
    const w = make();
    const area = w.get(".vin-context-menu").element, menu = w.get<HTMLDivElement>('[role="menu"]').element;
    area.dispatchEvent(new PointerEvent("pointerdown", { pointerType: "touch", clientX: 10, clientY: 10, bubbles: true }));
    vi.advanceTimersByTime(549);
    expect(isOpen(menu)).toBe(false);
    vi.advanceTimersByTime(1);
    expect(isOpen(menu)).toBe(true);
  });
});

describe("Command", () => {
  const groups: CommandGroup[] = [
    { heading: "Suggestions", items: [{ value: "calendar", label: "Calendar" }, { value: "emoji", label: "Search emoji", keywords: "smiley" }, { value: "calc", label: "Calculator", disabled: true }] },
    { heading: "Settings", items: [{ value: "billing", label: "Billing", shortcut: "⌘B", keywords: "payment invoice" }] },
  ];
  const visible = (w: VueWrapper) => w.findAll(".vin-command__item").filter((i) => i.attributes("hidden") === undefined).map((i) => i.attributes("data-value"));

  it("filters by every typed word in the label or keywords, and hides empty groups", async () => {
    const w = attach(mount(Command, { props: { groups } }));
    const input = w.get('input[role="combobox"]');
    expect(input.attributes("aria-controls")).toBe(w.get('[role="listbox"]').attributes("id"));
    expect(w.get(".vin-command__shortcut").attributes("aria-hidden")).toBe("true");
    await input.setValue("pay inv");
    expect(visible(w)).toEqual(["billing"]);
    expect(w.findAll(".vin-command__group")[0].attributes("hidden")).toBeDefined();
    expect(w.get(".vin-command__separator").attributes("hidden")).toBeDefined();
    await input.setValue("nope");
    expect(w.get(".vin-command__empty").attributes("hidden")).toBeUndefined();
  });

  it("moves with the arrows (wrapping, skipping disabled) and runs with Enter", async () => {
    const onSelect = vi.fn(), itemSelect = vi.fn();
    const g: CommandGroup[] = [{ items: [{ value: "a", label: "A", onSelect: itemSelect }, { value: "b", label: "B", disabled: true }, { value: "c", label: "C" }] }];
    const w = attach(mount(Command, { props: { groups: g, onSelect } }));
    const input = w.get('input[role="combobox"]');
    const activeValue = () => w.get(`#${input.attributes("aria-activedescendant")}`).attributes("data-value");
    expect(activeValue()).toBe("a");
    key(input.element, "ArrowDown");
    await nextTick();
    expect(activeValue()).toBe("c");
    key(input.element, "ArrowDown");
    await nextTick();
    expect(activeValue()).toBe("a");
    expect(w.get('[data-value="a"]').attributes("aria-selected")).toBe("true");
    key(input.element, "Enter");
    expect(itemSelect).toHaveBeenCalledOnce();
    expect(onSelect).toHaveBeenLastCalledWith("a");
    await w.get('[data-value="b"]').trigger("click");
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("renders an icon slot for each item", () => {
    const w = attach(mount(Command, { props: { groups }, slots: { icon: ({ item }: { item: { value: string } }) => h("i", { class: "ic" }, item.value) } }));
    expect(w.findAll(".ic").map((i) => i.text())).toEqual(["calendar", "emoji", "calc", "billing"]);
  });
});

describe("CommandDialog", () => {
  const groups: CommandGroup[] = [{ heading: "Pages", items: [{ value: "home", label: "Home" }, { value: "docs", label: "Docs" }] }];
  const make = (props: Record<string, unknown> = {}) =>
    attach(mount(CommandDialog, { props: { groups, ...props }, slots: { trigger: () => h(Button, null, () => "Search") }, attachTo: document.body }));

  it("opens from the trigger, focuses the search, and closes after running a command", async () => {
    const onSelect = vi.fn(), onOpen = vi.fn();
    const w = make({ title: "Search docs", onSelect, "onUpdate:open": onOpen });
    const btn = w.get("button"), dlg = w.get<HTMLDialogElement>("dialog");
    expect(btn.attributes("aria-haspopup")).toBe("dialog");
    expect(btn.attributes("aria-keyshortcuts")).toBe("Meta+K Control+K");
    expect(dlg.classes()).toEqual(["vin-dialog", "vin-command-dialog"]);
    expect(dlg.attributes("aria-label")).toBe("Search docs");
    await btn.trigger("click");
    await flushPromises();
    expect(dlg.element.open).toBe(true);
    expect(onOpen).toHaveBeenLastCalledWith(true);
    expect(document.activeElement).toBe(w.get("input").element);
    await w.get("input").setValue("doc");
    key(w.get("input").element, "Enter");
    await flushPromises();
    expect(onSelect).toHaveBeenLastCalledWith("docs");
    expect(dlg.element.open).toBe(false);
    expect(onOpen).toHaveBeenLastCalledWith(false);
  });

  it("starts fresh each time it opens", async () => {
    const w = make();
    const dlg = w.get<HTMLDialogElement>("dialog");
    await w.get("button").trigger("click");
    await w.get("input").setValue("doc");
    dlg.element.close();
    await flushPromises();
    await w.get("button").trigger("click");
    await flushPromises();
    expect(w.get<HTMLInputElement>("input").element.value).toBe("");
  });

  it("toggles with Ctrl+K, but never on top of another open dialog", async () => {
    const w = make();
    const dlg = w.get<HTMLDialogElement>("dialog").element;
    key(document.body, "k", { ctrlKey: true });
    await flushPromises();
    expect(dlg.open).toBe(true);
    key(document.body, "k", { metaKey: true });
    await flushPromises();
    expect(dlg.open).toBe(false);
    const other = document.createElement("dialog");
    document.body.append(other);
    other.showModal();
    key(document.body, "k", { ctrlKey: true });
    await flushPromises();
    expect(dlg.open).toBe(false);
  });
});
