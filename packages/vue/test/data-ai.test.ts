import { describe, it, expect, vi, afterEach } from "vitest";
import { mount, flushPromises, type VueWrapper } from "@vue/test-utils";
import { h, nextTick } from "vue";
import DataTable, { dataTableStatus } from "../src/data-table.vue";
import Carousel from "../src/carousel.vue";
import Chart, { niceTicks } from "../src/chart.vue";
import CodeBlock from "../src/code-block.vue";
import Message, { MessageCopy, MessageFeedback } from "../src/message.vue";
import MessageScroller from "../src/message-scroller.vue";
import Questionnaire, { type Question } from "../src/questionnaire.vue";
import Marker from "../src/marker.vue";
import Attachment, { AttachmentList, formatBytes } from "../src/attachment.vue";
import { TraceStep } from "../src/trace.vue";

const mounted: VueWrapper[] = [];
const attach = <T extends VueWrapper>(w: T) => { mounted.push(w); return w; };
afterEach(() => {
  mounted.splice(0).forEach((w) => w.unmount());
  document.body.innerHTML = "";
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
const key = (el: Element, k: string) => el.dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true, cancelable: true }));
const frame = () => new Promise((r) => setTimeout(r, 30));
const mockClipboard = () => {
  const writeText = vi.fn(() => Promise.resolve());
  Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
  return writeText;
};

describe("DataTable", () => {
  type Row = { id: string; name: string; amount: number };
  const data: Row[] = [
    { id: "a", name: "Chen", amount: 30 },
    { id: "b", name: "Asha", amount: 200 },
    { id: "c", name: "Ben", amount: 100 },
  ];
  const columns = [{ key: "name", header: "Name" }, { key: "amount", header: "Amount", numeric: true }];
  const make = (props: Record<string, unknown> = {}) =>
    attach(mount(DataTable, { props: { label: "People", data, rowKey: "id", columns, ...props } as never, attachTo: document.body }));
  const visibleNames = (w: VueWrapper) =>
    w.findAll("tbody tr").filter((r) => r.attributes("hidden") === undefined).map((r) => r.findAll("td").at(-2)?.text() ?? r.find("td").text());

  it("words the status like vinui.js", () => {
    expect(dataTableStatus({ selected: 2, total: 12, from: 1, to: 5, selectable: true })).toBe("2 of 12 selected");
    expect(dataTableStatus({ selected: 0, total: 12, from: 1, to: 5, selectable: false })).toBe("Showing 1–5 of 12");
    expect(dataTableStatus({ selected: 0, total: 1, from: 1, to: 1, selectable: false })).toBe("1 row");
  });

  it("sorts by a column, toggling the direction and aria-sort", async () => {
    const w = make();
    const names = () => w.findAll("tbody tr").map((r) => r.find("td").text());
    expect(names()).toEqual(["Chen", "Asha", "Ben"]);
    await w.findAll(".vin-data-table__sort")[1].trigger("click");
    expect(w.findAll("th")[1].attributes("aria-sort")).toBe("ascending");
    expect(names()).toEqual(["Chen", "Ben", "Asha"]);
    await w.findAll(".vin-data-table__sort")[1].trigger("click");
    expect(w.findAll("th")[1].attributes("aria-sort")).toBe("descending");
    expect(names()).toEqual(["Asha", "Ben", "Chen"]);
    await w.findAll(".vin-data-table__sort")[0].trigger("click");
    expect(names()).toEqual(["Asha", "Ben", "Chen"]);
    expect(w.findAll("th")[1].attributes("aria-sort")).toBeUndefined();
  });

  it("filters rows, and shows the empty row when nothing matches", async () => {
    const w = make({ filterable: true });
    const input = w.get('input[type="search"]');
    expect(input.attributes("aria-label")).toBe("Filter people");
    await input.setValue("as");
    expect(visibleNames(w)).toEqual(["Asha"]);
    await input.setValue("zzz");
    expect(w.get(".vin-data-table__empty").text()).toBe("No results.");
  });

  it("selects rows and all shown rows, and reports the keys", async () => {
    const onChange = vi.fn();
    const w = make({ selectable: true, defaultSelected: ["a"], "onSelectionChange": onChange });
    expect(w.get(".vin-data-table__status").text()).toBe("1 of 3 selected");
    const all = w.get<HTMLInputElement>('thead input[type="checkbox"]');
    expect(all.element.indeterminate).toBe(true);
    expect(w.findAll("tbody tr")[0].attributes("data-selected")).toBe("");
    await w.get('[aria-label="Select Asha"]').setValue(true);
    expect(onChange).toHaveBeenLastCalledWith(["a", "b"]);
    await all.setValue(true);
    expect(onChange).toHaveBeenLastCalledWith(["a", "b", "c"]);
    expect(w.get(".vin-data-table__status").text()).toBe("3 of 3 selected");
    await all.setValue(false);
    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it("pages through the rows", async () => {
    const w = make({ pageSize: 2 });
    expect(w.get(".vin-data-table__status").text()).toBe("Showing 1–2 of 3");
    expect(visibleNames(w)).toHaveLength(2);
    await w.findAll(".vin-pagination button").at(-1)!.trigger("click");
    expect(w.get(".vin-data-table__status").text()).toBe("Showing 3–3 of 3");
    expect(visibleNames(w)).toEqual(["Ben"]);
  });

  it("renders a cell slot", () => {
    const w = attach(mount(DataTable, {
      props: { label: "People", data, rowKey: "id", columns } as never,
      slots: { "cell-name": ({ row }: { row: object }) => h("b", (row as Row).name.toUpperCase()) },
    }));
    expect(w.findAll("tbody b").map((b) => b.text())).toEqual(["CHEN", "ASHA", "BEN"]);
  });
});

describe("Carousel", () => {
  const make = (onChange = vi.fn()) => {
    const w = attach(mount(Carousel, {
      props: { label: "Steps", "onSlideChange": onChange },
      slots: { default: () => [1, 2, 3].map((n) => h("div", `Slide ${n}`)) },
      attachTo: document.body,
    }));
    // A 400px viewport over three 400px slides.
    const track = w.get(".vin-carousel__track").element as HTMLElement;
    let left = 0;
    Object.defineProperties(track, {
      scrollWidth: { value: 1200, configurable: true },
      clientWidth: { value: 400, configurable: true },
      scrollLeft: { get: () => left, configurable: true },
    });
    const rect = (l: number) => ({ left: l, right: l + 400, width: 400, top: 0, bottom: 100, height: 100, x: l, y: 0, toJSON() {} }) as DOMRect;
    track.getBoundingClientRect = () => rect(0);
    [...track.children].forEach((s, i) => { (s as HTMLElement).getBoundingClientRect = () => rect(i * 400 - left); });
    const scrollBy = vi.fn((o: ScrollToOptions) => { left = Math.max(0, Math.min(800, left + (o.left ?? 0))); track.dispatchEvent(new Event("scroll")); });
    track.scrollBy = scrollBy as never;
    track.dispatchEvent(new Event("scroll"));
    return { w, track, scrollBy };
  };

  it("labels the slides and disables Previous at the start", async () => {
    const { w } = make();
    await frame();
    expect(w.get("section").attributes("aria-roledescription")).toBe("carousel");
    const slides = w.findAll(".vin-carousel__slide");
    expect(slides.map((s) => s.attributes("aria-label"))).toEqual(["1 of 3", "2 of 3", "3 of 3"]);
    expect(slides[1].attributes("inert")).toBeDefined();
    expect(w.get(".vin-carousel__prev").attributes("aria-disabled")).toBe("true");
    expect(w.get(".vin-carousel__next").attributes("aria-disabled")).toBeUndefined();
  });

  it("Next, Previous and the dots scroll it, and @slide-change reports the slide", async () => {
    const onChange = vi.fn();
    const { w, scrollBy } = make(onChange);
    await frame();
    await w.get(".vin-carousel__next").trigger("click");
    expect(scrollBy).toHaveBeenLastCalledWith(expect.objectContaining({ left: 400 }));
    await frame();
    expect(onChange).toHaveBeenLastCalledWith(1);
    expect(w.findAll(".vin-carousel__dot")[1].attributes("aria-current")).toBe("true");
    await w.findAll(".vin-carousel__dot")[2].trigger("click");
    await frame();
    expect(w.get(".vin-carousel__next").attributes("aria-disabled")).toBe("true");
    scrollBy.mockClear();
    await w.get(".vin-carousel__next").trigger("click");
    expect(scrollBy).not.toHaveBeenCalled();
    await w.get(".vin-carousel__prev").trigger("click");
    expect(scrollBy).toHaveBeenLastCalledWith(expect.objectContaining({ left: -400 }));
  });

  it("moves with the arrow keys on the track", async () => {
    const { track, scrollBy } = make();
    await frame();
    key(track, "ArrowRight");
    expect(scrollBy).toHaveBeenLastCalledWith(expect.objectContaining({ left: 400 }));
    await frame();
    key(track, "ArrowLeft");
    expect(scrollBy).toHaveBeenLastCalledWith(expect.objectContaining({ left: -400 }));
  });
});

describe("Chart", () => {
  const data = [{ m: "Jan", a: 10 }, { m: "Feb", a: 25 }, { m: "Mar", a: null }];
  const make = () => attach(mount(Chart, { props: { label: "Sales", data, index: "m", series: [{ key: "a", label: "Alpha" }] }, attachTo: document.body }));

  it("picks round ticks that include zero", () => {
    expect(niceTicks([186, 305, 73])).toEqual([0, 100, 200, 300, 400]);
    expect(niceTicks([-5, 12])).toEqual([-5, 0, 5, 10, 15]);
  });

  it("names the picture and fills the hidden table", () => {
    const w = make();
    expect(w.get("svg").attributes("aria-label")).toBe("Sales (bar chart)");
    expect(w.get("caption").text()).toBe("Sales");
    expect(w.findAll("tbody td").map((t) => t.text())).toEqual(["10", "25", "–"]);
    expect(w.findAll(".vin-chart__bar")).toHaveLength(2);
    expect(w.find(".vin-chart__legend").exists()).toBe(false);
  });

  it("shows a tooltip on focus and moves it with the keys", async () => {
    const w = make();
    const svg = w.get("svg");
    await svg.trigger("focus");
    expect(w.get(".vin-chart__tooltip-title").text()).toBe("Jan");
    expect(svg.attributes("data-active")).toBe("");
    key(svg.element, "ArrowRight");
    await nextTick();
    expect(w.get(".vin-chart__tooltip-title").text()).toBe("Feb");
    expect(w.get(".vin-chart__value").text()).toBe("25");
    key(svg.element, "End");
    await nextTick();
    expect(w.get(".vin-chart__value").text()).toBe("–");
    key(svg.element, "Home");
    await nextTick();
    expect(w.get(".vin-chart__tooltip-title").text()).toBe("Jan");
    key(svg.element, "Escape");
    await nextTick();
    expect(w.find(".vin-chart__tooltip").exists()).toBe(false);
  });
});

describe("CodeBlock", () => {
  it("copies the plain text of highlighted HTML and says so", async () => {
    const writeText = mockClipboard();
    const w = attach(mount(CodeBlock, { props: { html: '<span class="k">a</span> &lt; b\n', filename: "x.ts", lineNumbers: true } }));
    expect(w.findAll(".vin-code-block__line")).toHaveLength(1);
    await w.get(".vin-code-block__copy").trigger("click");
    await flushPromises();
    expect(writeText).toHaveBeenCalledWith("a < b");
    expect(w.get(".vin-code-block__status").text()).toBe("Copied");
    expect(w.get(".vin-code-block__copy").attributes("data-copied")).toBe("");
  });
});

describe("Message", () => {
  it("MessageCopy copies the message content and says Copied for two seconds", async () => {
    vi.useFakeTimers();
    const writeText = mockClipboard();
    const w = attach(mount(Message, { props: { author: "Assistant" }, slots: { default: () => h("p", " Hello there "), actions: () => h(MessageCopy) } }));
    const btn = w.get(".vin-message__actions button");
    expect(w.get(".vin-message__actions").attributes("aria-label")).toBe("Message actions");
    expect(btn.attributes("aria-label")).toBe("Copy");
    await btn.trigger("click");
    expect(writeText).toHaveBeenCalledWith("Hello there");
    expect(btn.attributes("aria-label")).toBe("Copied");
    vi.advanceTimersByTime(2000);
    await nextTick();
    expect(btn.attributes("aria-label")).toBe("Copy");
  });

  it("MessageFeedback presses one thumb at a time and clears on a second press", async () => {
    const onChange = vi.fn();
    const w = attach(mount(MessageFeedback, { props: { "onUpdate:modelValue": onChange } }));
    const [up, down] = w.findAll("button");
    await up.trigger("click");
    expect(onChange).toHaveBeenLastCalledWith("up");
    expect(up.attributes("aria-pressed")).toBe("true");
    expect(down.attributes("aria-pressed")).toBe("false");
    await down.trigger("click");
    expect(onChange).toHaveBeenLastCalledWith("down");
    await down.trigger("click");
    expect(onChange).toHaveBeenLastCalledWith(null);
    expect(down.attributes("aria-pressed")).toBe("false");
  });

  it("marks a streaming message busy and uses <time> with dateTime", () => {
    const w = attach(mount(Message, { props: { streaming: true, time: "10:42", dateTime: "2026-11-25T10:42" } }));
    expect(w.attributes("aria-busy")).toBe("true");
    expect(w.get("time").attributes("datetime")).toBe("2026-11-25T10:42");
  });
});

describe("MessageScroller", () => {
  const setup = () => {
    let onResize: () => void = () => {};
    vi.stubGlobal("ResizeObserver", class { constructor(cb: () => void) { onResize = cb; } observe() {} disconnect() {} });
    const w = attach(mount(MessageScroller, { slots: { default: () => h("p", "Hi") }, attachTo: document.body }));
    const view = w.get(".vin-message-scroller__viewport").element as HTMLElement;
    let top = 0, height = 1000;
    Object.defineProperties(view, {
      scrollHeight: { get: () => height, configurable: true },
      clientHeight: { value: 200, configurable: true },
      scrollTop: { get: () => top, set: (v: number) => { top = v; }, configurable: true },
    });
    const scrollTo = vi.fn((o: ScrollToOptions) => { top = (o.top ?? 0) - 200; view.dispatchEvent(new Event("scroll")); });
    view.scrollTo = scrollTo as never;
    const scroll = (to: number) => { top = to; view.dispatchEvent(new Event("scroll")); };
    return { w, view, scrollTo, scroll, grow: (by: number) => { height += by; onResize(); } };
  };

  it("is a named log that follows new content while at the bottom", () => {
    const { w, view, scrollTo, scroll, grow } = setup();
    expect(view.getAttribute("role")).toBe("log");
    expect(view.getAttribute("aria-label")).toBe("Conversation");
    scroll(800);
    grow(100);
    expect(scrollTo).toHaveBeenLastCalledWith({ top: 1100, behavior: "auto" });
    expect(w.get(".vin-message-scroller__jump").attributes("hidden")).toBeDefined();
  });

  it("stops following when scrolled up, flags new messages, and Jump to latest goes back", async () => {
    const { w, scrollTo, scroll, grow } = setup();
    scroll(800);
    scroll(300);
    await nextTick();
    const jump = w.get(".vin-message-scroller__jump");
    expect(jump.attributes("hidden")).toBeUndefined();
    expect(jump.text()).toBe("Jump to latest");
    scrollTo.mockClear();
    grow(100);
    await nextTick();
    expect(scrollTo).not.toHaveBeenCalled();
    expect(jump.attributes("data-new")).toBe("true");
    await jump.trigger("click");
    expect(scrollTo).toHaveBeenLastCalledWith(expect.objectContaining({ top: 1100 }));
    expect(jump.attributes("hidden")).toBeDefined();
  });
});

describe("Questionnaire", () => {
  const questions: Question[] = [
    { id: "len", prompt: "How long?", options: [{ value: "short", label: "Short" }, { value: "long", label: "Long" }], other: true },
    { id: "see", prompt: "See what?", multiple: true, options: ["Lakes", "Views"] },
  ];
  const make = (props: Record<string, unknown> = {}) =>
    attach(mount(Questionnaire, { props: { label: "Trip", questions, ...props }, attachTo: document.body }));

  it("submits the answers in option order, then shows a focused status and locks the form", async () => {
    const onSubmit = vi.fn();
    const w = make({ onSubmit });
    expect(w.get("form").attributes("aria-label")).toBe("Trip");
    await w.get('input[value="long"]').setValue(true);
    await w.get('input[value="Views"]').setValue(true);
    await w.get('input[value="Lakes"]').setValue(true);
    await w.get("form").trigger("submit");
    expect(onSubmit).toHaveBeenCalledWith({ len: "long", see: ["Lakes", "Views"] });
    await flushPromises();
    expect(w.get("form").attributes("data-state")).toBe("submitted");
    expect(w.find(".vin-questionnaire__actions").exists()).toBe(false);
    expect(w.get(".vin-questionnaire__status").text()).toBe("Answers sent");
    expect(document.activeElement).toBe(w.get(".vin-questionnaire__status").element);
    expect(w.findAll("fieldset").every((f) => (f.element as HTMLFieldSetElement).disabled)).toBe(true);
  });

  it("gives the typed text for Other", async () => {
    const onSubmit = vi.fn();
    const w = make({ onSubmit });
    await w.get('input[value="other"]').setValue(true);
    await w.get(".vin-questionnaire__other").setValue("  A week  ");
    await w.get("form").trigger("submit");
    expect(onSubmit).toHaveBeenCalledWith({ len: "A week", see: [] });
  });

  it("Skip reports it and shows Skipped", async () => {
    const onSkip = vi.fn(), onState = vi.fn();
    const w = make({ onSkip, "onUpdate:state": onState });
    await w.get(".vin-btn--ghost").trigger("click");
    expect(onSkip).toHaveBeenCalledOnce();
    expect(onState).toHaveBeenLastCalledWith("skipped");
    expect(w.get(".vin-questionnaire__status").text()).toBe("Skipped");
  });
});

describe("Marker", () => {
  it("names the source and hides the preview on Escape until the pointer or focus leaves", async () => {
    const w = attach(mount(Marker, { props: { index: 2, href: "https://example.com", title: "Fetch", source: "whatwg.org" }, attachTo: document.body }));
    const a = w.get("a");
    expect(a.attributes("aria-label")).toBe("Source 2: Fetch, whatwg.org");
    key(document.body, "Escape");
    await nextTick();
    expect(a.attributes("data-dismissed")).toBeUndefined(); // not open, so nothing to hide
    await a.trigger("focus");
    key(document.body, "Escape");
    await nextTick();
    expect(a.attributes("data-dismissed")).toBe("true");
    await a.trigger("blur");
    expect(a.attributes("data-dismissed")).toBeUndefined();
  });
});

describe("Attachment", () => {
  it("formats sizes", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(2516582)).toBe("2.4 MB");
    expect(formatBytes(860160)).toBe("840 KB");
  });

  it("shows remove and retry only when listened for, and wraps children in list items", async () => {
    const onRemove = vi.fn(), onRetry = vi.fn();
    const w = attach(mount(AttachmentList, {
      props: { label: "Files" },
      slots: { default: () => [h(Attachment, { name: "a.pdf", type: "PDF", size: 2048 }), h(Attachment, { name: "b.mov", error: "Upload failed", onRemove, onRetry })] },
    }));
    expect(w.findAll("li")).toHaveLength(2);
    expect(w.findAll("li")[0].find("button").exists()).toBe(false);
    expect(w.findAll(".vin-attachment__meta").map((m) => m.text())).toEqual(["PDF · 2 KB", "Upload failed"]);
    await w.get('[aria-label="Retry b.mov"]').trigger("click");
    await w.get('[aria-label="Remove b.mov"]').trigger("click");
    expect(onRetry).toHaveBeenCalledOnce();
    expect(onRemove).toHaveBeenCalledOnce();
  });

  it("shows upload progress", () => {
    const w = attach(mount(Attachment, { props: { name: "a.csv", progress: 64.4 } }));
    expect(w.get('[role="progressbar"]').attributes("aria-valuenow")).toBe("64");
    expect(w.get(".vin-attachment__meta").text()).toBe("Uploading… 64%");
  });
});

describe("TraceStep", () => {
  it("puts details behind a disclosure and reports open changes", async () => {
    const onOpen = vi.fn();
    const w = attach(mount(TraceStep, { props: { title: "Searched", kind: "Tool call", duration: "1s", status: "error", "onUpdate:open": onOpen }, slots: { default: () => "out" } }));
    expect(w.get(".vin-trace__meta").text()).toBe("Tool call · 1s");
    expect(w.get(".vin-trace__icon").attributes("aria-label")).toBe("Failed");
    const details = w.get("details").element as HTMLDetailsElement;
    details.open = true;
    details.dispatchEvent(new Event("toggle"));
    expect(onOpen).toHaveBeenLastCalledWith(true);
  });
});
