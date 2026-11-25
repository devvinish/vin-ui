import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/svelte";

import Calendar from "../src/calendar.svelte";
import DatePicker, { formatDate } from "../src/date-picker.svelte";
import Combobox from "../src/combobox.svelte";
import CalendarLimits from "../examples/calendar/limits.svelte";
import CalendarHarness from "./fixtures/calendar-harness.svelte";

const day = (date: string, root: ParentNode = document) => root.querySelector<HTMLButtonElement>(`[data-date="${date}"]`)!;
const title = (root: ParentNode = document) => root.querySelector(".vin-calendar__title")!.textContent;
const pad = (n: number) => String(n).padStart(2, "0");

describe("Calendar", () => {
  it("shows the chosen month with a named grid, and one day takes Tab", () => {
    render(Calendar, { props: { value: "2026-11-14" } });
    expect(title()).toBe("November 2026");
    const grid = screen.getByRole("grid");
    expect(document.getElementById(grid.getAttribute("aria-labelledby")!)!.textContent).toBe("November 2026");
    expect(grid.querySelectorAll("th")[0].textContent).toBe("Mon");
    expect(grid.querySelectorAll("th")[0].getAttribute("abbr")).toBe("Monday");
    expect(grid.querySelectorAll(".vin-calendar__day")).toHaveLength(42);
    expect(grid.querySelectorAll('[tabindex="0"]')).toHaveLength(1);
    expect(day("2026-11-14").tabIndex).toBe(0);
    expect(day("2026-11-14").getAttribute("aria-label")).toBe("Saturday, November 14, 2026");
    expect(day("2026-11-14").closest("td")!.getAttribute("aria-selected")).toBe("true");
    expect(day("2026-10-26").hasAttribute("data-outside")).toBe(true);
  });

  it("marks today once it runs in the browser", async () => {
    const n = new Date();
    const today = `${n.getFullYear()}-${pad(n.getMonth() + 1)}-${pad(n.getDate())}`;
    render(Calendar, { props: { month: today.slice(0, 7) } });
    await waitFor(() => expect(day(today).getAttribute("aria-current")).toBe("date"));
    expect(document.querySelectorAll('[aria-current="date"]')).toHaveLength(1);
  });

  it("a click chooses a day; the arrows change the month", async () => {
    const onValueChange = vi.fn();
    const onMonthChange = vi.fn();
    render(Calendar, { props: { value: "2026-11-14", onValueChange, onMonthChange } });
    await fireEvent.click(day("2026-11-20"));
    expect(onValueChange).toHaveBeenCalledWith("2026-11-20");
    expect(day("2026-11-20").closest("td")!.getAttribute("aria-selected")).toBe("true");
    expect(day("2026-11-14").closest("td")!.getAttribute("aria-selected")).toBe("false");

    await fireEvent.click(screen.getByRole("button", { name: "Next month" }));
    expect(title()).toBe("December 2026");
    expect(onMonthChange).toHaveBeenCalledWith("2026-12");
    await fireEvent.click(screen.getByRole("button", { name: "Previous month" }));
    await fireEvent.click(screen.getByRole("button", { name: "Previous month" }));
    expect(title()).toBe("October 2026");
  });

  it("moves focus with the keyboard, across months too", async () => {
    render(Calendar, { props: { value: "2026-11-14" } });
    day("2026-11-14").focus();
    await fireEvent.keyDown(day("2026-11-14"), { key: "ArrowRight" });
    await waitFor(() => expect(document.activeElement).toBe(day("2026-11-15")));
    await fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });
    await waitFor(() => expect(document.activeElement).toBe(day("2026-11-22")));
    await fireEvent.keyDown(document.activeElement!, { key: "Home" });
    await waitFor(() => expect(document.activeElement).toBe(day("2026-11-16")));
    await fireEvent.keyDown(document.activeElement!, { key: "End" });
    await waitFor(() => expect(document.activeElement).toBe(day("2026-11-22")));
    await fireEvent.keyDown(document.activeElement!, { key: "PageDown" });
    await waitFor(() => expect(document.activeElement).toBe(day("2026-12-22")));
    expect(title()).toBe("December 2026");
    await fireEvent.keyDown(document.activeElement!, { key: "PageUp", shiftKey: true });
    await waitFor(() => expect(document.activeElement).toBe(day("2025-12-22")));
    expect(title()).toBe("December 2025");
    expect(day("2025-12-22").tabIndex).toBe(0);
  });

  it("can't choose days outside min and max or ruled out by isDateDisabled", async () => {
    render(CalendarLimits);
    expect(screen.getAllByRole("columnheader")[0].textContent).toBe("Sun");
    expect(day("2026-11-04").getAttribute("aria-disabled")).toBe("true");
    expect(day("2026-11-21").getAttribute("aria-disabled")).toBe("true"); // a Saturday
    expect(day("2026-11-20").hasAttribute("aria-disabled")).toBe(false);
    await fireEvent.click(day("2026-11-21"));
    expect(day("2026-11-21").closest("td")!.getAttribute("aria-selected")).toBe("false");
    expect(day("2026-11-18").closest("td")!.getAttribute("aria-selected")).toBe("true");
  });

  it("range mode: the first click starts, the second ends, an earlier day swaps them", async () => {
    const onValueChange = vi.fn();
    render(Calendar, { props: { mode: "range", value: { from: "2026-11-09", to: "2026-11-15" }, onValueChange } });
    expect(day("2026-11-09").closest("td")!.dataset.range).toBe("start");
    expect(day("2026-11-12").closest("td")!.dataset.range).toBe("middle");
    expect(day("2026-11-15").closest("td")!.dataset.range).toBe("end");

    await fireEvent.click(day("2026-11-20"));
    expect(onValueChange).toHaveBeenLastCalledWith({ from: "2026-11-20" });
    expect(day("2026-11-12").closest("td")!.getAttribute("aria-selected")).toBe("false");
    await fireEvent.click(day("2026-11-17"));
    expect(onValueChange).toHaveBeenLastCalledWith({ from: "2026-11-17", to: "2026-11-20" });
    expect(day("2026-11-18").closest("td")!.dataset.range).toBe("middle");
  });

  it("bind:value and bind:month work", async () => {
    render(CalendarHarness);
    const cal = document.querySelector<HTMLElement>(".vin-calendar")!;
    expect(screen.getByTestId("month").textContent).toBe("2026-11");
    await fireEvent.click(day("2026-11-20", cal));
    expect(screen.getByTestId("value").textContent).toBe("2026-11-20");
    await fireEvent.click(within(cal).getByRole("button", { name: "Next month" }));
    expect(screen.getByTestId("month").textContent).toBe("2026-12");
    await fireEvent.click(screen.getByRole("button", { name: "Set from outside" }));
    expect(document.querySelector(".vin-date-picker__value")!.textContent).toBe("Nov 2, 2026");
  });
});

describe("DatePicker", () => {
  it("formats dates and ranges by hand", () => {
    expect(formatDate("2026-11-14")).toBe("Nov 14, 2026");
    expect(formatDate({ from: "2026-11-09", to: "2026-11-15" })).toBe("Nov 9 – Nov 15, 2026");
    expect(formatDate({ from: "2026-12-30", to: "2027-01-02" })).toBe("Dec 30, 2026 – Jan 2, 2027");
    expect(formatDate({ from: "2026-11-09" })).toBe("Nov 9, 2026");
  });

  it("opens a calendar on the chosen day; choosing closes it and updates the field", async () => {
    const onValueChange = vi.fn();
    const { container } = render(DatePicker, { props: { label: "Due date", value: "2026-11-14", name: "due", onValueChange } });
    const trigger = screen.getByRole("button", { name: /Due date/ });
    expect(trigger.textContent!.trim()).toBe("Nov 14, 2026");
    expect(trigger.getAttribute("aria-haspopup")).toBe("dialog");
    const pop = document.getElementById(trigger.getAttribute("popovertarget")!)!;
    expect(pop.getAttribute("aria-label")).toBe("Choose due date");

    pop.showPopover();
    await waitFor(() => expect(trigger.getAttribute("aria-expanded")).toBe("true"));
    expect(document.activeElement).toBe(day("2026-11-14", pop));

    await fireEvent.click(day("2026-11-20", pop));
    expect(onValueChange).toHaveBeenCalledWith("2026-11-20");
    expect(pop.matches(":popover-open")).toBe(false);
    expect(document.activeElement).toBe(trigger);
    expect(trigger.textContent!.trim()).toBe("Nov 20, 2026");
    expect(container.querySelector<HTMLInputElement>('input[name="due"]')!.value).toBe("2026-11-20");
  });

  it("range: the field changes only when the range is complete", async () => {
    const onValueChange = vi.fn();
    const { container } = render(DatePicker, { props: { mode: "range", label: "Trip dates", value: { from: "2026-11-09", to: "2026-11-15" }, name: "trip", onValueChange } });
    const trigger = screen.getByRole("button", { name: /Trip dates/ });
    const pop = document.getElementById(trigger.getAttribute("popovertarget")!)!;
    expect(trigger.textContent!.trim()).toBe("Nov 9 – Nov 15, 2026");
    pop.showPopover();
    await fireEvent.click(day("2026-11-03", pop));
    expect(pop.matches(":popover-open")).toBe(true);
    expect(onValueChange).not.toHaveBeenCalled();
    expect(trigger.textContent!.trim()).toBe("Nov 9 – Nov 15, 2026");
    expect(day("2026-11-03", pop).closest("td")!.getAttribute("aria-selected")).toBe("true");

    await fireEvent.click(day("2026-11-06", pop));
    expect(onValueChange).toHaveBeenCalledWith({ from: "2026-11-03", to: "2026-11-06" });
    expect(pop.matches(":popover-open")).toBe(false);
    expect(trigger.textContent!.trim()).toBe("Nov 3 – Nov 6, 2026");
    expect(container.querySelector<HTMLInputElement>('input[name="trip"]')!.value).toBe("2026-11-03/2026-11-06");
  });

  it("shows a placeholder, an error, and can be disabled", () => {
    render(DatePicker, { props: { label: "Start date", error: "Choose a start date.", disabled: true } });
    const trigger = screen.getByRole("button", { name: /Start date/ });
    const valueEl = trigger.querySelector(".vin-date-picker__value")!;
    expect(valueEl.textContent).toBe("Pick a date");
    expect(valueEl.hasAttribute("data-placeholder")).toBe(true);
    expect(trigger.getAttribute("aria-invalid")).toBe("true");
    expect(document.getElementById(trigger.getAttribute("aria-describedby")!)!.textContent).toBe("Choose a start date.");
    expect((trigger as HTMLButtonElement).disabled).toBe(true);
  });
});

const frameworks = [
  { value: "astro", label: "Astro" },
  { value: "angular", label: "Angular" },
  { value: "next", label: "Next.js" },
  { value: "solid", label: "SolidStart", disabled: true },
  { value: "sveltekit", label: "SvelteKit" },
];
const zones = [
  { value: "Asia/Tokyo", label: "Tokyo", group: "Asia" },
  { value: "Europe/London", label: "London", group: "Europe" },
  { value: "America/Sao_Paulo", label: "São Paulo", group: "Americas" },
];
const visible = (list: HTMLElement) => [...list.querySelectorAll<HTMLElement>('[role="option"]')].filter((o) => !o.hidden).map((o) => o.textContent!.trim());

describe("Combobox", () => {
  it("typing filters the list; Enter chooses the active option", async () => {
    const onValueChange = vi.fn();
    const { container } = render(Combobox, { props: { label: "Framework", options: frameworks, name: "framework", onValueChange } });
    const input = screen.getByRole("combobox", { name: "Framework" }) as HTMLInputElement;
    const list = document.getElementById(input.getAttribute("aria-controls")!)!;
    expect(input.getAttribute("aria-expanded")).toBe("false");

    await fireEvent.input(input, { target: { value: "an" } });
    expect(input.getAttribute("aria-expanded")).toBe("true");
    expect(visible(list)).toEqual(["Angular"]);
    expect(input.getAttribute("aria-activedescendant")).toBe(list.querySelector('[data-value="angular"]')!.id);

    await fireEvent.keyDown(input, { key: "Enter" });
    expect(onValueChange).toHaveBeenCalledWith("angular");
    expect(input.value).toBe("Angular");
    expect(input.getAttribute("aria-expanded")).toBe("false");
    expect(container.querySelector<HTMLInputElement>('input[name="framework"]')!.value).toBe("angular");
  });

  it("arrows skip disabled options; a click chooses; Esc restores, then clears", async () => {
    const onValueChange = vi.fn();
    render(Combobox, { props: { "aria-label": "Framework", options: frameworks, value: "next", onValueChange } });
    const input = screen.getByRole("combobox", { name: "Framework" }) as HTMLInputElement;
    const list = document.getElementById(input.getAttribute("aria-controls")!)!;
    const activeValue = () => document.getElementById(input.getAttribute("aria-activedescendant")!)?.dataset.value;
    expect(input.value).toBe("Next.js");

    await fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(visible(list)).toHaveLength(5); // not filtering yet: everything shows
    expect(activeValue()).toBe("next");
    await fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(activeValue()).toBe("sveltekit");

    await fireEvent.input(input, { target: { value: "xyz" } });
    expect(visible(list)).toEqual([]);
    expect(screen.getByRole("status").hidden).toBe(false);
    await fireEvent.keyDown(input, { key: "Escape" });
    expect(input.value).toBe("Next.js");
    expect(input.getAttribute("aria-expanded")).toBe("false");

    await fireEvent.keyDown(input, { key: "Escape" });
    expect(input.value).toBe("");
    expect(onValueChange).toHaveBeenLastCalledWith("");

    await fireEvent.click(input);
    await fireEvent.click(list.querySelector('[data-value="solid"]')!);
    expect(onValueChange).toHaveBeenCalledTimes(1);
    await fireEvent.click(list.querySelector('[data-value="astro"]')!);
    expect(onValueChange).toHaveBeenLastCalledWith("astro");
    expect(input.value).toBe("Astro");
  });

  it("matches without accents and hides groups with no matches", async () => {
    render(Combobox, { props: { label: "Time zone", options: zones, value: "Europe/London" } });
    const input = screen.getByRole("combobox", { name: "Time zone" }) as HTMLInputElement;
    const list = document.getElementById(input.getAttribute("aria-controls")!)!;
    expect(input.value).toBe("London");
    const groups = [...list.querySelectorAll<HTMLElement>('[role="group"]')];
    expect(groups.map((g) => document.getElementById(g.getAttribute("aria-labelledby")!)!.textContent)).toEqual(["Asia", "Europe", "Americas"]);

    await fireEvent.input(input, { target: { value: "sao" } });
    expect(visible(list)).toEqual(["São Paulo"]);
    expect(groups.map((g) => g.hidden)).toEqual([true, true, false]);
  });

  it("an error is read with the field; disabled can't open", async () => {
    render(Combobox, { props: { label: "Country", options: ["Canada"], error: "Choose your country.", disabled: true } });
    const input = screen.getByRole("combobox", { name: "Country" }) as HTMLInputElement;
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(document.getElementById(input.getAttribute("aria-describedby")!)!.textContent).toBe("Choose your country.");
    expect(input.disabled).toBe(true);
    await fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(input.getAttribute("aria-expanded")).toBe("false");
  });
});
