import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/svelte";

import ResizableHorizontal from "../examples/resizable/horizontal.svelte";
import ResizableVertical from "../examples/resizable/vertical.svelte";
import ResizableNested from "../examples/resizable/nested.svelte";
import DataTableBasic from "../examples/data-table/basic.svelte";
import DataTableSelection from "../examples/data-table/selection.svelte";
import DataTableSorting from "../examples/data-table/sorting.svelte";
import CarouselHarness from "./fixtures/carousel-harness.svelte";
import ChartBar from "../examples/chart/bar.svelte";
import ChartArea from "../examples/chart/area.svelte";
import CodeBlock, { copyText } from "../src/code-block.svelte";
import { niceTicks } from "../src/chart.svelte";
import { dataTableStatus } from "../src/data-table.svelte";

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("Resizable", () => {
  const size = (el: Element) => (el as HTMLElement).style.getPropertyValue("--vin-size");

  it("arrow keys, Home and End move the handle; Enter collapses and restores", async () => {
    render(ResizableHorizontal);
    const handle = screen.getByRole("separator", { name: "Resize mailboxes" });
    const [first, second] = document.querySelectorAll(".vin-resizable__panel");
    await waitFor(() => expect(handle.getAttribute("aria-valuenow")).toBe("30"));
    expect(handle.getAttribute("aria-valuemin")).toBe("20");
    expect(handle.getAttribute("aria-valuemax")).toBe("70");
    expect(handle.getAttribute("aria-orientation")).toBe("vertical");
    expect(handle.getAttribute("aria-controls")).toBe(first.id);

    await fireEvent.keyDown(handle, { key: "ArrowRight" });
    expect(handle.getAttribute("aria-valuenow")).toBe("35");
    expect(size(first)).toBe("35");
    expect(size(second)).toBe("65");
    await fireEvent.keyDown(handle, { key: "ArrowLeft" });
    await fireEvent.keyDown(handle, { key: "ArrowLeft" });
    expect(handle.getAttribute("aria-valuenow")).toBe("25");
    await fireEvent.keyDown(handle, { key: "Home" });
    expect(handle.getAttribute("aria-valuenow")).toBe("20");
    await fireEvent.keyDown(handle, { key: "End" });
    expect(handle.getAttribute("aria-valuenow")).toBe("70");
    expect(size(second)).toBe("30");

    await fireEvent.keyDown(handle, { key: "Enter" });
    expect(handle.getAttribute("aria-valuenow")).toBe("20");
    await fireEvent.keyDown(handle, { key: "Enter" });
    expect(handle.getAttribute("aria-valuenow")).toBe("70");
  });

  it("dragging the handle resizes by the share of the group's width", async () => {
    render(ResizableHorizontal);
    const handle = screen.getByRole("separator", { name: "Resize mailboxes" });
    const group = document.querySelector<HTMLElement>(".vin-resizable")!;
    Object.defineProperty(group, "clientWidth", { configurable: true, value: 500 });
    await waitFor(() => expect(handle.getAttribute("aria-valuenow")).toBe("30"));

    await fireEvent.pointerDown(handle, { button: 0, clientX: 100, pointerId: 1 });
    expect(document.activeElement).toBe(handle);
    expect(group.hasAttribute("data-dragging")).toBe(true);
    expect(handle.hasAttribute("data-dragging")).toBe(true);
    await fireEvent.pointerMove(handle, { clientX: 150, pointerId: 1 });
    expect(handle.getAttribute("aria-valuenow")).toBe("40");
    await fireEvent.pointerMove(handle, { clientX: 600, pointerId: 1 });
    expect(handle.getAttribute("aria-valuenow")).toBe("70"); // stops at the other panel's minimum
    await fireEvent.pointerUp(handle, { pointerId: 1 });
    expect(group.hasAttribute("data-dragging")).toBe(false);
    await fireEvent.pointerMove(handle, { clientX: 100, pointerId: 1 });
    expect(handle.getAttribute("aria-valuenow")).toBe("70");
  });

  it("vertical groups use the up and down arrows; nested groups are separate", async () => {
    render(ResizableVertical);
    const handle = screen.getByRole("separator", { name: "Resize editor" });
    await waitFor(() => expect(handle.getAttribute("aria-valuenow")).toBe("60"));
    expect(handle.getAttribute("aria-orientation")).toBe("horizontal");
    await fireEvent.keyDown(handle, { key: "ArrowDown" });
    expect(handle.getAttribute("aria-valuenow")).toBe("65");
    await fireEvent.keyDown(handle, { key: "ArrowRight" });
    expect(handle.getAttribute("aria-valuenow")).toBe("65");
  });

  it("nested groups keep their own sizes", async () => {
    render(ResizableNested);
    const outer = screen.getByRole("separator", { name: "Resize files" });
    const inner = screen.getByRole("separator", { name: "Resize preview" });
    await waitFor(() => expect(inner.getAttribute("aria-valuenow")).toBe("65"));
    expect(outer.getAttribute("aria-valuenow")).toBe("25");
    await fireEvent.keyDown(inner, { key: "ArrowUp" });
    expect(inner.getAttribute("aria-valuenow")).toBe("60");
    expect(outer.getAttribute("aria-valuenow")).toBe("25");
  });
});

describe("DataTable", () => {
  const visibleRows = (table: HTMLElement) => [...table.querySelectorAll<HTMLTableRowElement>("tbody tr")].filter((r) => !r.hidden);
  const firstCells = (table: HTMLElement) => visibleRows(table).map((r) => r.querySelectorAll("td")[1]?.textContent?.trim());

  it("filters, pages and selects", async () => {
    render(DataTableBasic);
    const table = screen.getByRole("table");
    const status = document.querySelector(".vin-data-table__status")!;
    expect(screen.getByRole("region", { name: "Invoices" })).toBeTruthy();
    expect(visibleRows(table)).toHaveLength(5);
    expect(status.textContent).toBe("0 of 12 selected");

    await fireEvent.click(screen.getByRole("button", { name: /Next/ }));
    expect(firstCells(table)).toEqual(["INV-1037", "INV-1036", "INV-1035", "INV-1034", "INV-1033"]);

    const filter = screen.getByRole("searchbox", { name: "Filter invoices" });
    await fireEvent.input(filter, { target: { value: "overdue" } });
    expect(firstCells(table)).toEqual(["INV-1040", "INV-1035"]);
    await fireEvent.input(filter, { target: { value: "₹15,000" } });
    expect(firstCells(table)).toEqual(["INV-1039"]);

    await fireEvent.click(screen.getByRole("checkbox", { name: "Select all rows" }));
    expect(status.textContent).toBe("1 of 12 selected");
    expect(visibleRows(table)[0].hasAttribute("data-selected")).toBe(true);

    await fireEvent.input(filter, { target: { value: "nobody" } });
    expect(table.querySelector(".vin-data-table__empty")!.textContent).toBe("No results.");
    await fireEvent.input(filter, { target: { value: "" } });
    const header = screen.getByRole("checkbox", { name: "Select all rows" }) as HTMLInputElement;
    expect(header.indeterminate).toBe(true);
    await fireEvent.click(screen.getByRole("checkbox", { name: "Select INV-1042" }));
    expect(status.textContent).toBe("2 of 12 selected");
  });

  it("sorts by a column and flips the direction on a second click", async () => {
    render(DataTableBasic);
    const table = screen.getByRole("table");
    const customer = screen.getByRole("button", { name: "Customer" });
    await fireEvent.click(customer);
    expect(customer.closest("th")!.getAttribute("aria-sort")).toBe("ascending");
    expect(visibleRows(table)[0].querySelectorAll("td")[2].textContent).toBe("Asha Rao");
    await fireEvent.click(customer);
    expect(customer.closest("th")!.getAttribute("aria-sort")).toBe("descending");
    expect(visibleRows(table)[0].querySelectorAll("td")[2].textContent).toBe("Liam Byrne");
    expect(screen.queryByRole("button", { name: "Status" })).toBeNull(); // sortable: false
  });

  it("starts sorted and selected when told to", () => {
    render(DataTableSorting);
    const table = screen.getByRole("table");
    expect(screen.getByRole("button", { name: "Commits" }).closest("th")!.getAttribute("aria-sort")).toBe("descending");
    expect(visibleRows(table).map((r) => r.querySelector("td")!.textContent)).toEqual(["Tom Okafor", "Sara Lind", "Lucía Ortiz", "Meera Shah", "Ravi Menon"]);
    expect(document.querySelector(".vin-data-table__footer")).toBeNull();
  });

  it("shows the selection count and an indeterminate header", () => {
    render(DataTableSelection);
    expect(document.querySelector(".vin-data-table__status")!.textContent).toBe("2 of 4 selected");
    expect((screen.getByRole("checkbox", { name: "Select all rows" }) as HTMLInputElement).indeterminate).toBe(true);
    expect((screen.getByRole("checkbox", { name: "Select Chen Wei" }) as HTMLInputElement).checked).toBe(true);
  });

  it("dataTableStatus words", () => {
    expect(dataTableStatus({ selected: 2, total: 12, from: 1, to: 5, selectable: true })).toBe("2 of 12 selected");
    expect(dataTableStatus({ selected: 0, total: 12, from: 6, to: 10, selectable: false })).toBe("Showing 6–10 of 12");
    expect(dataTableStatus({ selected: 0, total: 1, from: 1, to: 1, selectable: false })).toBe("1 row");
  });
});

describe("Carousel", () => {
  // jsdom lays nothing out: give the track a 500px box and each slide the full width.
  function layout() {
    let pos = 0;
    const track = document.querySelector<HTMLElement>(".vin-carousel__track")!;
    const slides = [...track.children] as HTMLElement[];
    const box = (left: number) => ({ left, right: left + 500, width: 500, top: 0, bottom: 100, height: 100, x: left, y: 0, toJSON() {} });
    track.getBoundingClientRect = () => box(0);
    slides.forEach((s, i) => (s.getBoundingClientRect = () => box(i * 500 - pos)));
    Object.defineProperty(track, "scrollWidth", { configurable: true, value: slides.length * 500 });
    Object.defineProperty(track, "clientWidth", { configurable: true, value: 500 });
    Object.defineProperty(track, "scrollLeft", { configurable: true, get: () => pos });
    const scrollBy = vi.fn((o: ScrollToOptions) => {
      pos += o.left ?? 0;
      track.dispatchEvent(new Event("scroll"));
    });
    track.scrollBy = scrollBy as unknown as typeof track.scrollBy;
    track.dispatchEvent(new Event("scroll"));
    return { track, slides, scrollBy };
  }

  it("buttons, dots and arrow keys move between slides; hidden slides are inert", async () => {
    const onSlideChange = vi.fn();
    render(CarouselHarness, { props: { onSlideChange } });
    const { track, slides, scrollBy } = layout();
    const prev = screen.getByRole("button", { name: "Previous slide" });
    const next = screen.getByRole("button", { name: "Next slide" });
    const dot = (n: number) => screen.getByRole("button", { name: `Slide ${n}` });
    await waitFor(() => expect(slides[1].inert).toBe(true));
    expect(screen.getByRole("region", { name: "Steps" }).getAttribute("aria-roledescription")).toBe("carousel");
    expect(slides[0].getAttribute("aria-label")).toBe("1 of 4");
    expect(slides[0].inert).toBe(false);
    expect(prev.getAttribute("aria-disabled")).toBe("true");
    expect(dot(1).getAttribute("aria-current")).toBe("true");

    await fireEvent.click(prev);
    expect(scrollBy).not.toHaveBeenCalled();
    await fireEvent.click(next);
    expect(scrollBy).toHaveBeenLastCalledWith(expect.objectContaining({ left: 500 }));
    await waitFor(() => expect(dot(2).getAttribute("aria-current")).toBe("true"));
    expect(onSlideChange).toHaveBeenLastCalledWith(1);
    expect(slides[0].inert).toBe(true);
    expect(prev.hasAttribute("aria-disabled")).toBe(false);

    track.focus();
    await fireEvent.keyDown(track, { key: "ArrowLeft" });
    await waitFor(() => expect(dot(1).getAttribute("aria-current")).toBe("true"));

    await fireEvent.click(dot(4));
    await waitFor(() => expect(next.getAttribute("aria-disabled")).toBe("true"));
    expect(onSlideChange).toHaveBeenLastCalledWith(3);
  });
});

describe("Chart", () => {
  it("niceTicks gives round steps that include zero", () => {
    expect(niceTicks([186, 305, 73])).toEqual([0, 100, 200, 300, 400]);
    expect(niceTicks([-40, 90])).toEqual([-50, 0, 50, 100]);
    expect(niceTicks([0])).toEqual([0, 0.25, 0.5, 0.75, 1]);
  });

  it("focus and the arrow keys show one category in the tooltip; Escape hides it", async () => {
    render(ChartBar);
    const svg = screen.getByRole("img", { name: "Visitors by month, January to June (bar chart)" });
    const tooltip = () => document.querySelector(".vin-chart__tooltip");
    expect(tooltip()).toBeNull();
    expect(document.querySelectorAll(".vin-chart__bar")).toHaveLength(12);
    expect(document.querySelector(".vin-chart__legend")!.textContent).toContain("Desktop");

    await fireEvent.focus(svg);
    expect(tooltip()!.textContent).toContain("Jan");
    expect([...tooltip()!.querySelectorAll(".vin-chart__value")].map((v) => v.textContent)).toEqual(["186", "80"]);
    expect(document.querySelectorAll('.vin-chart__bar[data-active=""]')).toHaveLength(2);
    await fireEvent.keyDown(svg, { key: "ArrowRight" });
    expect(tooltip()!.querySelector(".vin-chart__tooltip-title")!.textContent).toBe("Feb");
    await fireEvent.keyDown(svg, { key: "End" });
    expect(tooltip()!.querySelector(".vin-chart__tooltip-title")!.textContent).toBe("Jun");
    expect((tooltip() as HTMLElement).style.right).not.toBe("");
    await fireEvent.keyDown(svg, { key: "ArrowRight" });
    expect(tooltip()!.querySelector(".vin-chart__tooltip-title")!.textContent).toBe("Jun");
    await fireEvent.keyDown(svg, { key: "Escape" });
    expect(tooltip()).toBeNull();

    await fireEvent.pointerMove(document.querySelectorAll(".vin-chart__hit")[2]);
    expect(tooltip()!.querySelector(".vin-chart__tooltip-title")!.textContent).toBe("Mar");
    await fireEvent.pointerLeave(svg);
    expect(tooltip()).toBeNull();
  });

  it("uses the formatters, and screen readers get a data table", async () => {
    render(ChartArea);
    const table = screen.getByRole("table", { name: "Revenue by month, January to August" });
    expect(within(table).getAllByRole("columnheader").map((th) => th.textContent)).toEqual(["Month", "Revenue"]);
    expect(within(table).getAllByRole("cell")[0].textContent).toBe("₹12,400");
    await fireEvent.focus(screen.getByRole("img"));
    expect(document.querySelector(".vin-chart__value")!.textContent).toBe("₹12,400");
    expect(document.querySelector(".vin-chart__area")).toBeTruthy();
  });
});

describe("CodeBlock", () => {
  it("copies the plain text of highlighted HTML and says so", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    const writeText = vi.fn(() => Promise.resolve());
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    render(CodeBlock, { props: { html: '<span class="vin-code-block__keyword">const</span> a = 1 &lt; 2;\n', lineNumbers: true, highlight: [1] } });
    const button = screen.getByRole("button", { name: "Copy code" });
    expect(document.querySelectorAll(".vin-code-block__line")).toHaveLength(1);
    expect(document.querySelector(".vin-code-block__line--highlight")).toBeTruthy();
    await fireEvent.click(button);
    await vi.waitFor(() => expect(screen.getByRole("status").textContent).toBe("Copied"));
    expect(writeText).toHaveBeenCalledWith("const a = 1 < 2;");
    expect(button.hasAttribute("data-copied")).toBe(true);
    vi.advanceTimersByTime(2000);
    await vi.waitFor(() => expect(screen.getByRole("status").textContent).toBe(""));
    expect(button.hasAttribute("data-copied")).toBe(false);
  });

  it("copyText falls back to execCommand when the clipboard API fails", async () => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: () => Promise.reject(new Error("no")) } });
    const exec = vi.fn(() => true);
    document.execCommand = exec;
    expect(await copyText("hi")).toBe(true);
    expect(exec).toHaveBeenCalledWith("copy");
    expect(document.querySelector("textarea")).toBeNull();
  });

  it("copyable={false} hides the button and the status", () => {
    render(CodeBlock, { props: { code: "npm i", copyable: false } });
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.queryByRole("status")).toBeNull();
    expect(document.querySelector("code")!.textContent).toBe("npm i");
  });
});
