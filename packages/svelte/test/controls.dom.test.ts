import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";

import TabsLine from "../examples/tabs/line.svelte";
import ToggleGroupSingle from "../examples/toggle-group/single.svelte";
import ToggleGroupMultiple from "../examples/toggle-group/multiple.svelte";
import AlertActions from "../examples/alert/actions.svelte";
import ItemGroupExample from "../examples/item/group.svelte";
import BindHarness from "./fixtures/bind-harness.svelte";
import ToggleGroupHarness from "./fixtures/toggle-group-harness.svelte";

import Switch from "../src/switch.svelte";
import Checkbox from "../src/checkbox.svelte";
import RadioGroup from "../src/radio-group.svelte";
import Toggle from "../src/toggle.svelte";
import Select from "../src/select.svelte";
import Slider from "../src/slider.svelte";
import Accordion from "../src/accordion.svelte";
import Collapsible from "../src/collapsible.svelte";
import InputOTP from "../src/input-otp.svelte";
import Textarea from "../src/textarea.svelte";
import Pagination from "../src/pagination.svelte";
import Avatar from "../src/avatar.svelte";
import Field from "../src/input-field.svelte";
import InputGroup from "../src/input-group.svelte";

describe("Tabs", () => {
  it("links tabs to panels and keeps only the open tab in the Tab order", () => {
    render(TabsLine);
    const tabs = screen.getAllByRole("tab");
    expect(tabs.map((t) => t.getAttribute("aria-selected"))).toEqual(["true", "false", "false", "false"]);
    expect(tabs.map((t) => t.tabIndex)).toEqual([0, -1, -1, -1]);
    const panel = document.getElementById(tabs[0].getAttribute("aria-controls")!)!;
    expect(panel.getAttribute("role")).toBe("tabpanel");
    expect(panel.getAttribute("aria-labelledby")).toBe(tabs[0].id);
    expect(panel.hidden).toBe(false);
  });

  it("opens a tab on click, and arrow keys, Home and End move between enabled tabs", async () => {
    render(TabsLine);
    const [overview, activity, files] = screen.getAllByRole("tab");
    await fireEvent.click(activity);
    expect(activity.getAttribute("aria-selected")).toBe("true");
    expect(screen.getByText("Latest changes from your team.").hidden).toBe(false);
    expect(screen.getByText("12 open tasks, 3 due this week.").hidden).toBe(true);

    activity.focus();
    await fireEvent.keyDown(activity, { key: "ArrowRight" });
    expect(document.activeElement).toBe(files);
    expect(files.getAttribute("aria-selected")).toBe("true");
    // The disabled Archive tab is skipped, so the next step wraps to the first tab.
    await fireEvent.keyDown(files, { key: "ArrowRight" });
    expect(document.activeElement).toBe(overview);
    await fireEvent.keyDown(overview, { key: "End" });
    expect(document.activeElement).toBe(files);
    await fireEvent.keyDown(files, { key: "Home" });
    expect(document.activeElement).toBe(overview);
    await fireEvent.keyDown(overview, { key: "ArrowLeft" });
    expect(document.activeElement).toBe(files);
  });
});

describe("Two-way binding", () => {
  it("bind:value, bind:checked, bind:pressed and bind:open follow the user and the parent", async () => {
    const user = userEvent.setup();
    render(BindHarness);
    const state = screen.getByTestId("state");
    expect(state.textContent).toBe("a|false|false|apple|false");

    await user.click(screen.getByRole("tab", { name: "B" }));
    await user.click(screen.getByRole("switch", { name: "Wi-Fi" }));
    await user.click(screen.getByRole("button", { name: "Bold" }));
    expect(state.textContent).toBe("b|true|true|apple|false");

    const combo = screen.getByRole("combobox", { name: "Fruit" });
    await user.click(combo);
    await user.click(screen.getByRole("option", { name: "banana" }));
    expect(state.textContent).toBe("b|true|true|banana|false");

    const details = document.querySelector("details")!;
    details.open = true;
    details.dispatchEvent(new Event("toggle"));
    await waitFor(() => expect(state.textContent).toBe("b|true|true|banana|true"));
  });

  it("the parent can change a bound value", async () => {
    render(BindHarness);
    await fireEvent.click(screen.getByRole("tab", { name: "A" }));
    await fireEvent.click(screen.getByRole("button", { name: "Show B" }));
    expect(screen.getByRole("tab", { name: "B" }).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByText("Panel B").hidden).toBe(false);
  });
});

describe("Switch and Checkbox", () => {
  it("Switch is a labelled checkbox with role=switch and a description", async () => {
    const onchange = vi.fn();
    render(Switch, { props: { label: "Wi-Fi", description: "Saves battery", onchange } });
    const sw = screen.getByRole("switch", { name: "Wi-Fi" }) as HTMLInputElement;
    expect(sw.type).toBe("checkbox");
    expect(document.getElementById(sw.getAttribute("aria-describedby")!)!.textContent).toBe("Saves battery");
    await fireEvent.click(sw);
    expect(sw.checked).toBe(true);
    expect(onchange).toHaveBeenCalledOnce();
  });

  it("Checkbox toggles, and shows the indeterminate state", async () => {
    const { rerender } = render(Checkbox, { props: { label: "Select all", indeterminate: true } });
    const box = screen.getByRole("checkbox", { name: "Select all" }) as HTMLInputElement;
    expect(box.indeterminate).toBe(true);
    await rerender({ label: "Select all", indeterminate: false });
    expect(box.indeterminate).toBe(false);
    await fireEvent.click(box);
    expect(box.checked).toBe(true);
  });

  it("warns when there is no label at all", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(Checkbox);
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });
});

describe("RadioGroup", () => {
  it("is a fieldset of native radios that reports the choice", async () => {
    const onValueChange = vi.fn();
    render(RadioGroup, {
      props: { label: "Size", options: ["S", "M", { value: "L", label: "Large", disabled: true }], value: "S", onValueChange, error: "Pick one" },
    });
    expect(screen.getByRole("group", { name: "Size" }).tagName).toBe("FIELDSET");
    const [s, m, l] = screen.getAllByRole("radio") as HTMLInputElement[];
    expect(s.checked).toBe(true);
    expect(s.name).toBe(m.name);
    expect(l.disabled).toBe(true);
    expect(m.getAttribute("aria-invalid")).toBe("true");
    await fireEvent.click(m);
    expect(m.checked).toBe(true);
    expect(onValueChange).toHaveBeenCalledWith("M");
  });
});

describe("Toggle and ToggleGroup", () => {
  it("Toggle flips aria-pressed and reports it", async () => {
    const onPressedChange = vi.fn();
    render(Toggle, { props: { "aria-label": "Bold", onPressedChange } });
    const btn = screen.getByRole("button", { name: "Bold" });
    expect(btn.getAttribute("aria-pressed")).toBe("false");
    await fireEvent.click(btn);
    expect(btn.getAttribute("aria-pressed")).toBe("true");
    expect(onPressedChange).toHaveBeenCalledWith(true);
  });

  it("single: a radio group with one Tab stop; arrows move and choose", async () => {
    render(ToggleGroupSingle);
    expect(screen.getByRole("radiogroup", { name: "View" })).toBeTruthy();
    const [list, grid, board] = screen.getAllByRole("radio");
    expect([list, grid, board].map((b) => b.getAttribute("aria-checked"))).toEqual(["false", "true", "false"]);
    expect([list, grid, board].map((b) => b.tabIndex)).toEqual([-1, 0, -1]);
    grid.focus();
    await fireEvent.keyDown(grid, { key: "ArrowRight" });
    expect(document.activeElement).toBe(board);
    expect(board.getAttribute("aria-checked")).toBe("true");
    expect([list, grid, board].map((b) => b.tabIndex)).toEqual([-1, -1, 0]);
    await fireEvent.keyDown(board, { key: "ArrowRight" });
    expect(document.activeElement).toBe(list);
    await fireEvent.click(grid);
    expect(grid.getAttribute("aria-checked")).toBe("true");
    expect(list.getAttribute("aria-checked")).toBe("false");
  });

  it("with nothing pressed, the first enabled item is the Tab stop", () => {
    render(ToggleGroupHarness);
    expect(screen.getAllByRole("radio").map((b) => b.tabIndex)).toEqual([-1, 0, -1]);
  });

  it("multiple: toggles aria-pressed, and arrows only move focus", async () => {
    render(ToggleGroupMultiple);
    const bold = screen.getByRole("button", { name: "Bold" });
    const italic = screen.getByRole("button", { name: "Italic" });
    expect(bold.getAttribute("aria-pressed")).toBe("true");
    await fireEvent.click(italic);
    expect(italic.getAttribute("aria-pressed")).toBe("true");
    expect(bold.getAttribute("aria-pressed")).toBe("true");
    await fireEvent.click(bold);
    expect(bold.getAttribute("aria-pressed")).toBe("false");
    italic.focus();
    await fireEvent.keyDown(italic, { key: "ArrowRight" });
    const underline = screen.getByRole("button", { name: "Underline" });
    expect(document.activeElement).toBe(underline);
    expect(underline.getAttribute("aria-pressed")).toBe("false");
    expect(underline.tabIndex).toBe(0);
  });
});

describe("Select", () => {
  const options = ["Apple", "Banana", { value: "cherry", label: "Cherry", disabled: true }, "Damson"];

  it("opens with the keyboard, moves past disabled options and chooses with Enter", async () => {
    const onValueChange = vi.fn();
    render(Select, { props: { label: "Fruit", options, name: "fruit", onValueChange } });
    const combo = screen.getByRole("combobox", { name: "Fruit" });
    expect(combo.getAttribute("aria-expanded")).toBe("false");
    combo.focus();
    await fireEvent.keyDown(combo, { key: "ArrowDown" });
    expect(combo.getAttribute("aria-expanded")).toBe("true");
    const listbox = screen.getByRole("listbox");
    expect(listbox.matches(":popover-open")).toBe(true);
    expect(combo.getAttribute("aria-activedescendant")).toBe(screen.getByRole("option", { name: "Apple" }).id);
    await fireEvent.keyDown(combo, { key: "ArrowDown" });
    await fireEvent.keyDown(combo, { key: "ArrowDown" });
    expect(combo.getAttribute("aria-activedescendant")).toBe(screen.getByRole("option", { name: "Damson" }).id);
    await fireEvent.keyDown(combo, { key: "Enter" });
    expect(onValueChange).toHaveBeenCalledWith("Damson");
    expect(combo.getAttribute("aria-expanded")).toBe("false");
    expect(combo.textContent?.trim()).toBe("Damson");
    expect((document.querySelector('input[name="fruit"]') as HTMLInputElement).value).toBe("Damson");
    expect(screen.getByRole("option", { name: "Damson", hidden: true }).getAttribute("aria-selected")).toBe("true");
  });

  it("closes on Escape, and typing a letter jumps to a match", async () => {
    render(Select, { props: { "aria-label": "Fruit", options } });
    const combo = screen.getByRole("combobox", { name: "Fruit" });
    await fireEvent.click(combo);
    expect(combo.getAttribute("aria-expanded")).toBe("true");
    await fireEvent.keyDown(combo, { key: "Escape" });
    expect(combo.getAttribute("aria-expanded")).toBe("false");
    await fireEvent.keyDown(combo, { key: "b" });
    expect(combo.textContent?.trim()).toBe("Banana");
  });

  it("shows the placeholder and marks errors", () => {
    render(Select, { props: { label: "Fruit", options, placeholder: "Pick a fruit", error: "Required" } });
    const combo = screen.getByRole("combobox", { name: "Fruit" });
    expect(combo.textContent?.trim()).toBe("Pick a fruit");
    expect(combo.getAttribute("aria-invalid")).toBe("true");
    expect(document.getElementById(combo.getAttribute("aria-describedby")!)!.textContent).toBe("Required");
  });
});

describe("Slider", () => {
  it("one value: a native range input that reports changes", async () => {
    const onValueChange = vi.fn();
    render(Slider, { props: { label: "Volume", value: 40, showValue: true, onValueChange } });
    const input = screen.getByRole("slider", { name: "Volume" }) as HTMLInputElement;
    expect(input.type).toBe("range");
    expect(input.style.getPropertyValue("--vin-fill")).toBe("40%");
    await fireEvent.input(input, { target: { value: "70" } });
    expect(onValueChange).toHaveBeenCalledWith(70);
    expect(document.querySelector("output")!.textContent).toBe("70");
  });

  it("range: two labelled thumbs that the keyboard moves without crossing", async () => {
    const onValueChange = vi.fn();
    render(Slider, {
      props: { label: "Price", value: [20, 60], step: 10, thumbLabels: ["Min", "Max"], formatValue: (v: number) => `₹${v}`, name: "price", onValueChange },
    });
    expect(screen.getByRole("group", { name: "Price" })).toBeTruthy();
    const min = screen.getByRole("slider", { name: "Min" });
    const max = screen.getByRole("slider", { name: "Max" });
    expect(min.getAttribute("aria-valuemax")).toBe("60");
    expect(max.getAttribute("aria-valuetext")).toBe("₹60");
    await fireEvent.keyDown(min, { key: "ArrowRight" });
    expect(onValueChange).toHaveBeenLastCalledWith([30, 60]);
    expect(min.getAttribute("aria-valuenow")).toBe("30");
    await fireEvent.keyDown(min, { key: "End" });
    expect(min.getAttribute("aria-valuenow")).toBe("60");
    await fireEvent.keyDown(max, { key: "Home" });
    expect(max.getAttribute("aria-valuenow")).toBe("60");
    await fireEvent.keyDown(max, { key: "End" });
    expect(max.getAttribute("aria-valuenow")).toBe("100");
    expect((document.querySelector('input[name="price-max"]') as HTMLInputElement).value).toBe("100");
  });
});

describe("Accordion and Collapsible", () => {
  const items = [
    { value: "a", title: "First", content: "One" },
    { value: "b", title: "Second", content: "Two" },
  ];
  const toggle = (el: HTMLDetailsElement, open: boolean) => {
    el.open = open;
    el.dispatchEvent(new Event("toggle"));
  };

  it("single: opening one item closes the other", async () => {
    const onValueChange = vi.fn();
    render(Accordion, { props: { items, value: ["a"], onValueChange } });
    const [a, b] = [...document.querySelectorAll("details")];
    expect(a.open).toBe(true);
    expect(a.getAttribute("name")).toBe(b.getAttribute("name"));
    toggle(b, true);
    await waitFor(() => expect(onValueChange).toHaveBeenCalledWith(["b"]));
    await waitFor(() => expect(a.open).toBe(false));
  });

  it("multiple: items open independently", async () => {
    const onValueChange = vi.fn();
    render(Accordion, { props: { items, type: "multiple", onValueChange } });
    const [a, b] = [...document.querySelectorAll("details")];
    expect(a.hasAttribute("name")).toBe(false);
    toggle(a, true);
    toggle(b, true);
    await waitFor(() => expect(onValueChange).toHaveBeenLastCalledWith(["a", "b"]));
    toggle(a, false);
    await waitFor(() => expect(onValueChange).toHaveBeenLastCalledWith(["b"]));
  });

  it("Collapsible reports open and close", async () => {
    const onOpenChange = vi.fn();
    render(Collapsible, { props: { trigger: "More", onOpenChange } });
    const details = document.querySelector("details")!;
    toggle(details, true);
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(true));
  });
});

describe("Text fields", () => {
  it("Field links its label, hint and error to the input", () => {
    render(Field, { props: { label: "Email", hint: "Never shared", error: "Required", id: "mail" } });
    const input = screen.getByLabelText("Email");
    expect(input.id).toBe("mail");
    expect(input.getAttribute("aria-describedby")).toBe("mail-error mail-hint");
    expect(input.getAttribute("aria-invalid")).toBe("true");
  });

  it("Field generates a valid id when none is given", () => {
    render(Field, { props: { label: "Name" } });
    expect(screen.getByLabelText("Name").id).toMatch(/^[a-zA-Z][\w-]*$/);
  });

  it("InputGroup focuses the input when its addon text is pressed", async () => {
    render(InputGroup, { props: { label: "Website", start: "https://" } });
    await fireEvent.pointerDown(screen.getByText("https://"));
    expect(document.activeElement).toBe(screen.getByLabelText("Website"));
  });

  it("InputOTP keeps only digits, fills the boxes and calls onComplete once", async () => {
    const onComplete = vi.fn();
    render(InputOTP, { props: { label: "Code", length: 4, onComplete } });
    const input = screen.getByLabelText("Code") as HTMLInputElement;
    expect(input.autocomplete).toBe("one-time-code");
    await fireEvent.input(input, { target: { value: "1a2b" } });
    expect(input.value).toBe("12");
    const slots = [...document.querySelectorAll(".vin-otp__slot")].map((s) => s.textContent);
    expect(slots).toEqual(["1", "2", "", ""]);
    await fireEvent.input(input, { target: { value: "123456" } });
    expect(input.value).toBe("1234");
    expect(onComplete).toHaveBeenCalledExactlyOnceWith("1234");
  });

  it("Textarea counts characters against maxlength", async () => {
    render(Textarea, { props: { label: "Bio", maxlength: 10, value: "Hi" } });
    const ta = screen.getByLabelText("Bio");
    const count = document.querySelector(".vin-textarea__count")!;
    expect(count.textContent).toBe("2 / 10");
    expect(ta.getAttribute("aria-describedby")).toBe(count.id);
    await fireEvent.input(ta, { target: { value: "0123456789" } });
    expect(count.textContent).toBe("10 / 10");
    expect(count.hasAttribute("data-over")).toBe(true);
  });
});

describe("Small parts", () => {
  it("Pagination without href uses buttons and reports the page", async () => {
    const onPageChange = vi.fn();
    render(Pagination, { props: { page: 1, count: 5, onPageChange } });
    expect((screen.getByRole("button", { name: "Previous page" }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByRole("button", { name: "1" }).getAttribute("aria-current")).toBe("page");
    await fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("Alert's dismiss button moves focus on and removes the alert", async () => {
    render(AlertActions);
    const close = screen.getByRole("button", { name: "Dismiss" });
    close.focus();
    await fireEvent.click(close);
    expect(document.querySelector(".vin-alert")).toBeNull();
  });

  it("Avatar falls back to initials when the picture fails", async () => {
    render(Avatar, { props: { name: "Ada Lovelace", src: "/missing.png", status: "online" } });
    expect(screen.getByRole("img", { name: "Ada Lovelace (online)" })).toBeTruthy();
    const img = document.querySelector("img")!;
    await fireEvent.error(img);
    expect(document.querySelector("img")).toBeNull();
    expect(document.querySelector(".vin-avatar__fallback")!.textContent).toBe("AL");
  });

  it("Items in an ItemGroup are list items", () => {
    render(ItemGroupExample);
    expect(screen.getByRole("list").querySelectorAll('[role="listitem"]').length).toBe(3);
  });
});
