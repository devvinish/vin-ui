import { describe, it, expect, vi, afterEach } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import { createSSRApp, defineComponent, h, nextTick } from "vue";
import { renderToString } from "@vue/server-renderer";
import ResizableGroup, { ResizablePanel, ResizableHandle } from "../src/resizable.vue";
import ScrollArea from "../src/scroll-area.vue";

const mounted: VueWrapper[] = [];
afterEach(() => { mounted.splice(0).forEach((w) => w.unmount()); document.body.innerHTML = ""; vi.restoreAllMocks(); });
const key = (el: Element, k: string) => el.dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true, cancelable: true }));

const Demo = (groupProps: Record<string, unknown> = {}, sizes: (number | undefined)[] = [30, 70]) =>
  defineComponent({
    setup: () => () =>
      h(ResizableGroup, groupProps, () => [
        h(ResizablePanel, { defaultSize: sizes[0], minSize: 20, id: "side" }, () => "Side"),
        h(ResizableHandle, { label: "Resize side", withGrip: true }),
        h(ResizablePanel, { defaultSize: sizes[1], minSize: 30 }, () => "Main"),
      ]),
  });
const make = (groupProps: Record<string, unknown> = {}, sizes?: (number | undefined)[]) => {
  const w = mount(Demo(groupProps, sizes), { attachTo: document.body });
  mounted.push(w);
  return w;
};
const size = (w: VueWrapper, i: number) => (w.findAll(".vin-resizable__panel")[i].element as HTMLElement).style.getPropertyValue("--vin-size");

describe("Resizable", () => {
  it("renders the window-splitter attributes, also on the server", async () => {
    const ssr = await renderToString(createSSRApp(Demo()));
    expect(ssr).toContain('aria-valuenow="30"');
    expect(ssr).toContain('aria-valuemax="70"');
    const w = make();
    const hd = w.get(".vin-resizable__handle");
    expect(hd.classes()).toContain("vin-resizable__handle--grip");
    expect(hd.attributes()).toMatchObject({
      role: "separator", tabindex: "0", "aria-label": "Resize side", "aria-controls": "side",
      "aria-orientation": "vertical", "aria-valuenow": "30", "aria-valuemin": "20", "aria-valuemax": "70",
    });
    expect(size(w, 0)).toBe("30");
    expect(size(w, 1)).toBe("70");
  });

  it("shares what is left between panels without a size, and gives panels ids", () => {
    const w = make({}, [40, undefined]);
    expect(size(w, 1)).toBe("60");
    const second = w.findAll(".vin-resizable__panel")[1];
    expect(second.attributes("id")).toMatch(/^vin-.+-panel-1$/);
  });

  it("moves 5% with the arrow keys, jumps with Home/End and reports with @layout", async () => {
    const onLayout = vi.fn();
    const w = make({ onLayout });
    const hd = w.get(".vin-resizable__handle").element;
    key(hd, "ArrowRight");
    await nextTick();
    expect(size(w, 0)).toBe("35");
    expect(size(w, 1)).toBe("65");
    expect(onLayout).toHaveBeenLastCalledWith([35, 65]);
    key(hd, "ArrowLeft");
    key(hd, "ArrowLeft");
    await nextTick();
    expect(size(w, 0)).toBe("25");
    key(hd, "Home");
    await nextTick();
    expect(size(w, 0)).toBe("20");
    key(hd, "End");
    await nextTick();
    expect(size(w, 0)).toBe("70");
    expect(w.get(".vin-resizable__handle").attributes("aria-valuenow")).toBe("70");
  });

  it("collapses the panel before the handle with Enter, and restores it", async () => {
    const w = make();
    const hd = w.get(".vin-resizable__handle").element;
    key(hd, "Enter");
    await nextTick();
    expect(size(w, 0)).toBe("20");
    key(hd, "Enter");
    await nextTick();
    expect(size(w, 0)).toBe("30");
  });

  it("uses Up/Down when vertical, and flips the arrows right to left", async () => {
    const v = make({ orientation: "vertical" });
    expect(v.get(".vin-resizable").classes()).toContain("vin-resizable--vertical");
    const vh = v.get(".vin-resizable__handle");
    expect(vh.attributes("aria-orientation")).toBe("horizontal");
    key(vh.element, "ArrowDown");
    await nextTick();
    expect(size(v, 0)).toBe("35");

    const r = make({ style: "direction: rtl" });
    vi.spyOn(window, "getComputedStyle").mockReturnValue({ direction: "rtl" } as CSSStyleDeclaration);
    key(r.get(".vin-resizable__handle").element, "ArrowLeft");
    await nextTick();
    expect(size(r, 0)).toBe("35");
  });

  it("resizes by dragging, in percent of the free space", async () => {
    const onLayout = vi.fn();
    const w = make({ onLayout });
    const group = w.get(".vin-resizable").element as HTMLElement;
    Object.defineProperty(group, "clientWidth", { value: 1000 });
    const hd = w.get(".vin-resizable__handle").element as HTMLElement;
    hd.dispatchEvent(new PointerEvent("pointerdown", { clientX: 300, button: 0, bubbles: true, cancelable: true }));
    expect(group.hasAttribute("data-dragging")).toBe(true);
    expect(document.activeElement).toBe(hd);
    hd.dispatchEvent(new PointerEvent("pointermove", { clientX: 400 }));
    await nextTick();
    expect(size(w, 0)).toBe("40");
    hd.dispatchEvent(new PointerEvent("pointermove", { clientX: 2000 }));
    await nextTick();
    expect(size(w, 0)).toBe("70");
    hd.dispatchEvent(new PointerEvent("pointerup"));
    expect(group.hasAttribute("data-dragging")).toBe(false);
    expect(onLayout).toHaveBeenLastCalledWith([70, 30]);
  });

  it("panels and handles must be inside a group", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(() => mount(ResizablePanel)).toThrow(/ResizableGroup/);
    expect(() => mount(ResizableHandle)).toThrow(/ResizableGroup/);
  });
});

describe("ScrollArea", () => {
  it("is a focusable named region with an orientation class", () => {
    const w = mount(ScrollArea, { props: { label: "Releases", orientation: "both" }, slots: { default: () => "x" } });
    mounted.push(w);
    expect(w.attributes()).toMatchObject({ role: "region", "aria-label": "Releases", tabindex: "0" });
    expect(w.classes()).toEqual(["vin-scroll-area", "vin-scroll-area--both"]);
    const plain = mount(ScrollArea);
    mounted.push(plain);
    expect(plain.attributes("role")).toBeUndefined();
  });
});
