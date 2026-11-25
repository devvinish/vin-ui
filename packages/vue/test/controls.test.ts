import { describe, it, expect, vi, afterEach } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import { defineComponent, h, nextTick, ref } from "vue";
import Button, { buttonClasses } from "../src/button.vue";
import Badge, { badgeClasses } from "../src/badge.vue";
import Field, { Input } from "../src/input.vue";
import Checkbox from "../src/checkbox.vue";
import Switch from "../src/switch.vue";
import RadioGroup from "../src/radio-group.vue";
import Toggle from "../src/toggle.vue";
import ToggleGroup, { ToggleGroupItem } from "../src/toggle-group.vue";
import Tabs, { TabList, Tab, TabPanel } from "../src/tabs.vue";
import Select from "../src/select.vue";
import Slider from "../src/slider.vue";
import Accordion from "../src/accordion.vue";
import Collapsible from "../src/collapsible.vue";
import InputOTP from "../src/input-otp.vue";
import Textarea from "../src/textarea.vue";
import Pagination, { pageRange } from "../src/pagination.vue";
import Alert from "../src/alert.vue";
import Avatar, { initials } from "../src/avatar.vue";
import NativeSelect from "../src/native-select.vue";
import InputGroup from "../src/input-group.vue";

const mounted: VueWrapper[] = [];
const attach = <T extends VueWrapper>(w: T) => { mounted.push(w); return w; };
afterEach(() => { mounted.splice(0).forEach((w) => w.unmount()); document.body.innerHTML = ""; });
const key = (el: Element, k: string, extra: KeyboardEventInit = {}) =>
  el.dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true, cancelable: true, ...extra }));

describe("Button and Badge", () => {
  it("maps variants to classes", () => {
    expect(buttonClasses({ variant: "danger", size: "sm" })).toBe("vin-btn vin-btn--danger vin-btn--sm");
    expect(badgeClasses({ variant: "success" })).toBe("vin-badge vin-badge--success");
    expect(mount(Badge, { props: { dot: true }, slots: { default: "Live" } }).html()).toContain('<span class="vin-badge__dot" aria-hidden="true"></span>');
  });

  it("renders a disabled link that can't be followed", async () => {
    const onClick = vi.fn();
    const w = mount(Button, { props: { href: "#x", disabled: true }, attrs: { onClick }, slots: { default: "Go" } });
    const a = w.get("a");
    expect(a.attributes("aria-disabled")).toBe("true");
    expect(a.attributes("tabindex")).toBe("-1");
    await a.trigger("click");
    expect(onClick).not.toHaveBeenCalled();
  });

  it("defaults to type=button and warns about unnamed icon buttons", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(mount(Button, { props: { size: "icon" } }).get("button").attributes("type")).toBe("button");
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });
});

describe("Field and Input", () => {
  it("links the label, hint and error to the input", () => {
    const w = mount(Field, { props: { id: "mail", label: "Email", hint: "Never shared", error: "Required" } });
    expect(w.get("label").attributes("for")).toBe("mail");
    const input = w.get("input");
    expect(input.attributes("aria-describedby")).toBe("mail-error mail-hint");
    expect(input.attributes("aria-invalid")).toBe("true");
    expect(w.get(".vin-error").attributes("id")).toBe("mail-error");
  });

  it("generates a valid id and supports v-model", async () => {
    const w = mount(Field, { props: { label: "Name", modelValue: "Ada", "onUpdate:modelValue": (v: string) => w.setProps({ modelValue: v }) } });
    const id = w.get("label").attributes("for")!;
    expect(id).toMatch(/^[a-zA-Z][\w-]*$/);
    expect(w.get("input").attributes("id")).toBe(id);
    await w.get("input").setValue("Grace");
    expect(w.props("modelValue")).toBe("Grace");
  });

  it("warns when an Input has no accessible name", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    mount(Input);
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });
});

describe("Checkbox and Switch", () => {
  it("Checkbox: v-model, description and indeterminate", async () => {
    const w = mount(Checkbox, { props: { label: "Digest", description: "Weekly", indeterminate: true, modelValue: false } });
    const input = w.get<HTMLInputElement>("input");
    expect(input.attributes("aria-describedby")).toBe(`${input.attributes("id")}-desc`);
    await nextTick();
    expect(input.element.indeterminate).toBe(true);
    await input.setValue(true);
    expect(w.emitted("update:modelValue")![0]).toEqual([true]);
  });

  it("Checkbox: defaultChecked without v-model", () => {
    const w = mount(Checkbox, { props: { label: "On", defaultChecked: true } });
    expect(w.get<HTMLInputElement>("input").element.checked).toBe(true);
  });

  it("Switch: role=switch and v-model", async () => {
    const w = mount(Switch, { props: { label: "Wi-Fi", size: "sm" } });
    const input = w.get<HTMLInputElement>("input");
    expect(input.attributes("role")).toBe("switch");
    expect(input.classes()).toContain("vin-switch--sm");
    await input.setValue(true);
    expect(w.emitted("update:modelValue")![0]).toEqual([true]);
  });
});

describe("RadioGroup", () => {
  it("checks the chosen option and emits on change", async () => {
    const w = mount(RadioGroup, { props: { label: "Size", options: ["S", "M", { value: "L", label: "Large", disabled: true }], defaultValue: "M", error: "Pick one" } });
    const radios = w.findAll<HTMLInputElement>("input");
    expect(radios[1].element.checked).toBe(true);
    expect(radios[2].attributes("disabled")).toBeDefined();
    expect(radios[0].attributes("aria-invalid")).toBe("true");
    expect(w.get("fieldset").attributes("aria-describedby")).toMatch(/-error$/);
    await radios[0].setValue(true);
    expect(w.emitted("update:modelValue")![0]).toEqual(["S"]);
  });
});

describe("Toggle", () => {
  it("flips aria-pressed and emits update:pressed", async () => {
    const w = mount(Toggle, { props: { defaultPressed: true }, slots: { default: "Bold" } });
    expect(w.get("button").attributes("aria-pressed")).toBe("true");
    await w.get("button").trigger("click");
    expect(w.get("button").attributes("aria-pressed")).toBe("false");
    expect(w.emitted("update:pressed")![0]).toEqual([false]);
  });

  it("keeps its state when a click handler calls preventDefault", async () => {
    const w = mount(Toggle, { attrs: { onClick: (e: MouseEvent) => e.preventDefault() } });
    await w.get("button").trigger("click");
    expect(w.get("button").attributes("aria-pressed")).toBe("false");
  });
});

describe("ToggleGroup", () => {
  const Group = (type: "single" | "multiple", props: Record<string, unknown> = {}) =>
    defineComponent({
      setup: () => () =>
        h(ToggleGroup, { type, "aria-label": "View", ...props }, () => [
          h(ToggleGroupItem, { value: "list" }, () => "List"),
          h(ToggleGroupItem, { value: "grid" }, () => "Grid"),
          h(ToggleGroupItem, { value: "board", disabled: true }, () => "Board"),
        ]),
    });

  it("single: a radio group with one Tab stop and arrow keys that choose", async () => {
    const w = attach(mount(Group("single", { defaultValue: "grid" }), { attachTo: document.body }));
    const items = w.findAll("button");
    expect(w.get(".vin-toggle-group").attributes("role")).toBe("radiogroup");
    expect(items.map((b) => b.attributes("tabindex"))).toEqual(["-1", "0", "-1"]);
    expect(items[1].attributes("aria-checked")).toBe("true");
    (items[1].element as HTMLElement).focus();
    key(items[1].element, "ArrowRight");
    await nextTick();
    // The disabled item is skipped: it wraps round to "list".
    expect(document.activeElement).toBe(items[0].element);
    expect(items[0].attributes("aria-checked")).toBe("true");
    expect(items.map((b) => b.attributes("tabindex"))).toEqual(["0", "-1", "-1"]);
  });

  it("first enabled item is the Tab stop when nothing is on", () => {
    const w = mount(Group("single"));
    expect(w.findAll("button").map((b) => b.attributes("tabindex"))).toEqual(["0", "-1", "-1"]);
  });

  it("multiple: aria-pressed and an array v-model", async () => {
    const onUpdate = vi.fn();
    const w = mount(Group("multiple", { defaultValue: ["list"], "onUpdate:modelValue": onUpdate }));
    const items = w.findAll("button");
    expect(items[0].attributes("aria-pressed")).toBe("true");
    await items[1].trigger("click");
    expect(onUpdate).toHaveBeenLastCalledWith(["list", "grid"]);
    await items[0].trigger("click");
    expect(onUpdate).toHaveBeenLastCalledWith(["grid"]);
  });
});

describe("Tabs", () => {
  const Demo = defineComponent({
    props: { modelValue: String },
    emits: ["update:modelValue"],
    setup: (props, { emit }) => () =>
      h(Tabs, { defaultValue: "a", modelValue: props.modelValue, "onUpdate:modelValue": (v: string) => emit("update:modelValue", v) }, () => [
        h(TabList, { "aria-label": "Settings" }, () => [
          h(Tab, { value: "a" }, () => "A"),
          h(Tab, { value: "b" }, () => "B"),
          h(Tab, { value: "c", disabled: true }, () => "C"),
        ]),
        h(TabPanel, { value: "a" }, () => "Panel A"),
        h(TabPanel, { value: "b" }, () => "Panel B"),
        h(TabPanel, { value: "c" }, () => "Panel C"),
      ]),
  });

  it("links tabs and panels and shows the open one", () => {
    const w = mount(Demo);
    const [a, b] = w.findAll('[role="tab"]');
    const [pa, pb] = w.findAll('[role="tabpanel"]');
    expect(a.attributes("aria-selected")).toBe("true");
    expect(a.attributes("tabindex")).toBe("0");
    expect(b.attributes("tabindex")).toBe("-1");
    expect(a.attributes("aria-controls")).toBe(pa.attributes("id"));
    expect(pa.attributes("aria-labelledby")).toBe(a.attributes("id"));
    expect(pa.attributes("hidden")).toBeUndefined();
    expect(pb.attributes("hidden")).toBeDefined();
  });

  it("arrow keys, Home and End move and select, skipping disabled tabs", async () => {
    const w = attach(mount(Demo, { attachTo: document.body }));
    const [a, b] = w.findAll('[role="tab"]');
    (a.element as HTMLElement).focus();
    key(a.element, "ArrowRight");
    await nextTick();
    expect(document.activeElement).toBe(b.element);
    expect(b.attributes("aria-selected")).toBe("true");
    expect(w.emitted("update:modelValue")![0]).toEqual(["b"]);
    key(b.element, "ArrowRight");
    await nextTick();
    expect(document.activeElement).toBe(a.element);
    key(a.element, "End");
    await nextTick();
    expect(document.activeElement).toBe(b.element);
    key(b.element, "Home");
    await nextTick();
    expect(a.attributes("aria-selected")).toBe("true");
  });

  it("follows v-model", async () => {
    const w = mount(Demo, { props: { modelValue: "b" } });
    expect(w.findAll('[role="tab"]')[1].attributes("aria-selected")).toBe("true");
    await w.setProps({ modelValue: "a" });
    expect(w.findAll('[role="tab"]')[0].attributes("aria-selected")).toBe("true");
  });
});

describe("Select", () => {
  const options = [{ value: "astro", label: "Astro" }, { value: "next", label: "Next.js" }, { value: "nuxt", label: "Nuxt", disabled: true }, { value: "remix", label: "Remix" }];

  it("opens with the keyboard, moves past disabled options and chooses with Enter", async () => {
    const w = attach(mount(Select, { props: { label: "Framework", options, defaultValue: "astro", name: "fw" }, attachTo: document.body }));
    const btn = w.get("button");
    expect(btn.attributes("aria-expanded")).toBe("false");
    expect(btn.attributes("aria-labelledby")).toBe(w.get(".vin-label").attributes("id"));
    await btn.trigger("keydown", { key: "ArrowDown" });
    expect(btn.attributes("aria-expanded")).toBe("true");
    expect(w.get(".vin-select__content").element.matches(":popover-open")).toBe(true);
    expect(btn.attributes("aria-activedescendant")).toBe(w.findAll('[role="option"]')[0].attributes("id"));
    await btn.trigger("keydown", { key: "ArrowDown" });
    await btn.trigger("keydown", { key: "ArrowDown" });
    expect(btn.attributes("aria-activedescendant")).toBe(w.findAll('[role="option"]')[3].attributes("id"));
    await btn.trigger("keydown", { key: "Enter" });
    expect(btn.attributes("aria-expanded")).toBe("false");
    expect(w.emitted("update:modelValue")![0]).toEqual(["remix"]);
    expect(w.get(".vin-select__value").text()).toBe("Remix");
    expect(w.get<HTMLInputElement>('input[type="hidden"]').element.value).toBe("remix");
  });

  it("Escape closes, typing jumps, clicking an option chooses it", async () => {
    const w = attach(mount(Select, { props: { "aria-label": "Framework", options }, attachTo: document.body }));
    const btn = w.get("button");
    expect(w.get(".vin-select__value").attributes("data-placeholder")).toBe("");
    await btn.trigger("keydown", { key: "r" });
    expect(w.emitted("update:modelValue")![0]).toEqual(["remix"]);
    await btn.trigger("click");
    expect(btn.attributes("aria-expanded")).toBe("true");
    await btn.trigger("keydown", { key: "Escape" });
    expect(btn.attributes("aria-expanded")).toBe("false");
    await btn.trigger("click");
    await w.findAll('[role="option"]')[1].trigger("click");
    expect(w.emitted("update:modelValue")![1]).toEqual(["next"]);
    await w.findAll('[role="option"]')[2].trigger("click");
    expect(w.emitted("update:modelValue")).toHaveLength(2);
  });
});

describe("Slider", () => {
  it("single: a native range input with v-model", async () => {
    const w = mount(Slider, { props: { label: "Volume", defaultValue: 40, showValue: true } });
    const input = w.get<HTMLInputElement>('input[type="range"]');
    expect(w.get("label").attributes("for")).toBe(input.attributes("id"));
    await input.setValue("55");
    expect(w.emitted("update:modelValue")![0]).toEqual([55]);
    expect(w.get("output").text()).toBe("55");
  });

  it("range: two slider thumbs that keep their order", async () => {
    const w = mount(Slider, { props: { label: "Price", defaultValue: [200, 700], max: 1000, step: 50, formatValue: (v: number) => `₹${v}`, name: "price" } });
    const [from, to] = w.findAll('[role="slider"]');
    expect(w.get(".vin-field").attributes("role")).toBe("group");
    expect(from.attributes("aria-valuemax")).toBe("700");
    expect(to.attributes("aria-valuetext")).toBe("₹700");
    await from.trigger("keydown", { key: "ArrowRight" });
    expect(w.emitted("update:modelValue")!.at(-1)).toEqual([[250, 700]]);
    await from.trigger("keydown", { key: "End" });
    expect(w.emitted("update:modelValue")!.at(-1)).toEqual([[700, 700]]);
    await to.trigger("keydown", { key: "Home" });
    expect(w.emitted("update:modelValue")!.at(-1)).toEqual([[700, 700]]);
    await to.trigger("keydown", { key: "PageUp" });
    expect(w.emitted("update:modelValue")!.at(-1)).toEqual([[700, 800]]);
    expect(w.findAll<HTMLInputElement>('input[type="hidden"]').map((i) => i.element.value)).toEqual(["700", "800"]);
  });
});

describe("Accordion and Collapsible", () => {
  const items = [{ value: "a", title: "A", content: "aa" }, { value: "b", title: "B", content: "bb" }];

  it("Accordion: native details with a shared name for type=single", async () => {
    const w = mount(Accordion, { props: { items, defaultValue: ["a"] } });
    const details = w.findAll<HTMLDetailsElement>("details");
    expect(details[0].element.open).toBe(true);
    expect(details[0].attributes("name")).toBe(details[1].attributes("name"));
    details[1].element.open = true;
    await details[1].trigger("toggle");
    expect(w.emitted("update:modelValue")!.at(-1)).toEqual([["b"]]);
  });

  it("Accordion: type=multiple adds to the open list", async () => {
    const w = mount(Accordion, { props: { items, type: "multiple", defaultValue: ["a"] } });
    const details = w.findAll<HTMLDetailsElement>("details");
    expect(details[0].attributes("name")).toBeUndefined();
    details[1].element.open = true;
    await details[1].trigger("toggle");
    expect(w.emitted("update:modelValue")!.at(-1)).toEqual([["a", "b"]]);
    details[0].element.open = false;
    await details[0].trigger("toggle");
    expect(w.emitted("update:modelValue")!.at(-1)).toEqual([["b"]]);
  });

  it("Collapsible: v-model:open follows the details element", async () => {
    const w = mount(Collapsible, { props: { trigger: "More", defaultOpen: true }, slots: { default: "Body" } });
    const d = w.get<HTMLDetailsElement>("details");
    expect(d.element.open).toBe(true);
    d.element.open = false;
    await d.trigger("toggle");
    expect(w.emitted("update:open")![0]).toEqual([false]);
  });
});

describe("Text inputs", () => {
  it("InputOTP keeps digits only and emits complete once", async () => {
    const w = mount(InputOTP, { props: { label: "Code", length: 4, groups: [2, 2] } });
    const input = w.get<HTMLInputElement>("input");
    expect(input.attributes("autocomplete")).toBe("one-time-code");
    expect(w.findAll(".vin-otp__slot")).toHaveLength(4);
    expect(w.findAll(".vin-otp__sep")).toHaveLength(1);
    await input.setValue("1a2");
    expect(w.emitted("update:modelValue")!.at(-1)).toEqual(["12"]);
    expect(input.element.value).toBe("12");
    await input.setValue("12345");
    expect(w.emitted("complete")).toEqual([["1234"]]);
    expect(w.findAll(".vin-otp__slot").map((s) => s.text())).toEqual(["1", "2", "3", "4"]);
  });

  it("Textarea counts characters against maxlength", async () => {
    const w = mount(Textarea, { props: { label: "Bio", maxlength: 10, defaultValue: "Hello" } });
    const ta = w.get("textarea");
    expect(w.get(".vin-textarea__count").text()).toBe("5 / 10");
    expect(ta.attributes("aria-describedby")).toBe(w.get(".vin-textarea__count").attributes("id"));
    await ta.setValue("Hello there");
    expect(w.get(".vin-textarea__count").attributes("data-over")).toBe("");
  });

  it("NativeSelect and InputGroup wire up labels, errors and v-model", async () => {
    const ns = mount(NativeSelect, { props: { label: "Role", error: "Pick one" }, slots: { default: '<option value="a">A</option><option value="b">B</option>' } });
    expect(ns.get("select").attributes("aria-invalid")).toBe("true");
    await ns.get("select").setValue("b");
    expect(ns.emitted("update:modelValue")![0]).toEqual(["b"]);

    const ig = mount(InputGroup, { props: { label: "Site", start: "https://", hint: "No www" } });
    expect(ig.get(".vin-input-group__addon").text()).toBe("https://");
    expect(ig.get("input").attributes("aria-describedby")).toMatch(/-hint$/);
    await ig.get("input").setValue("example.com");
    expect(ig.emitted("update:modelValue")![0]).toEqual(["example.com"]);
  });
});

describe("Pagination", () => {
  it("pageRange shows the ends and a window round the page", () => {
    expect(pageRange(5, 10)).toEqual([1, "…", 4, 5, 6, "…", 10]);
    expect(pageRange(2, 10)).toEqual([1, 2, 3, "…", 10]);
    expect(pageRange(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("buttons emit update:page and the ends are disabled", async () => {
    const page = ref(1);
    const w = mount(Pagination, { props: { page: 1, count: 3, "onUpdate:page": (p: number) => { page.value = p; } } });
    const buttons = w.findAll("button");
    expect(buttons[0].attributes("disabled")).toBeDefined();
    expect(buttons[0].attributes("aria-label")).toBe("Previous page");
    expect(w.get('[aria-current="page"]').text()).toBe("1");
    await buttons.at(-1)!.trigger("click");
    expect(page.value).toBe(2);
  });
});

describe("Alert and Avatar", () => {
  it("Alert shows a close button only with @dismiss", async () => {
    expect(mount(Alert, { props: { title: "Hi" } }).find(".vin-alert__close").exists()).toBe(false);
    const onDismiss = vi.fn();
    const w = mount(Alert, { props: { title: "Hi", onDismiss }, slots: { default: "Body" } });
    expect(w.get(".vin-alert__description").text()).toBe("Body");
    await w.get(".vin-alert__close").trigger("click");
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("Avatar names itself and falls back to initials", async () => {
    expect(initials("Ada Lovelace")).toBe("AL");
    const w = mount(Avatar, { props: { name: "Ada Lovelace", src: "/x.png", status: "online" } });
    expect(w.get('[role="img"]').attributes("aria-label")).toBe("Ada Lovelace (online)");
    await w.get("img").trigger("error");
    expect(w.find("img").exists()).toBe(false);
    expect(w.get(".vin-avatar__fallback").text()).toBe("AL");
  });
});
