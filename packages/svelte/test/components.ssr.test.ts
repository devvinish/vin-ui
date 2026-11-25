import { describe, it, expect, vi } from "vitest";
import { readFileSync } from "node:fs";
import { render } from "svelte/server";
import type { Component } from "svelte";

import Button, { buttonClasses } from "../src/button.svelte";
import Badge, { badgeClasses } from "../src/badge.svelte";
import CardTitle from "../src/card-title.svelte";
import Input, { inputClasses } from "../src/input.svelte";
import Field from "../src/input-field.svelte";
import Toaster from "../src/toast-toaster.svelte";
import { pageRange } from "../src/pagination.svelte";
import { initials } from "../src/avatar.svelte";
import * as index from "../src/index";
import ToggleGroupHarness from "./fixtures/toggle-group-harness.svelte";
import Calendar, { monthDays } from "../src/calendar.svelte";
import DatePicker from "../src/date-picker.svelte";
import Combobox from "../src/combobox.svelte";

/** Server HTML without Svelte's hydration markers. */
const html = (component: Component<any>, props: Record<string, unknown> = {}) =>
  render(component, { props }).body.replace(/<!--[\s\S]*?-->/g, "");

const spec = (name: string) => JSON.parse(readFileSync(new URL(`../../../spec/${name}.json`, import.meta.url), "utf8"));

describe("Button API matches spec/button.json", () => {
  it("supports every variant and size in the spec", () => {
    const s = spec("button");
    for (const variant of s.props.variant.values) {
      for (const size of s.props.size.values) {
        const cls = buttonClasses({ variant, size });
        expect(cls.split(" ")[0]).toBe("vin-btn");
        if (variant !== s.props.variant.default) expect(cls).toContain(`vin-btn--${variant}`);
        if (size !== s.props.size.default) expect(cls).toContain(`vin-btn--${size}`);
      }
    }
  });

  it("defaults to type=button so it never submits a form by accident", () => {
    expect(html(Button)).toBe('<button type="button" class="vin-btn"></button>');
    expect(html(Button, { type: "submit" })).toContain('type="submit"');
  });

  it("renders a link when given href, and marks disabled links for assistive tech", () => {
    expect(html(Button, { href: "/docs" })).toBe('<a href="/docs" class="vin-btn"></a>');
    const disabled = html(Button, { href: "/docs", disabled: true });
    expect(disabled).toContain('aria-disabled="true"');
    expect(disabled).toContain('tabindex="-1"');
  });

  it("keeps custom classes after the VinUI classes", () => {
    expect(buttonClasses({ variant: "ghost", className: "w-full" })).toBe("vin-btn vin-btn--ghost w-full");
  });

  it("warns in development when an icon button has no label", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    html(Button, { size: "icon" });
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });
});

describe("Small components", () => {
  it("Badge maps variants to classes and hides the dot from screen readers", () => {
    expect(badgeClasses()).toBe("vin-badge");
    expect(badgeClasses({ variant: "danger" })).toBe("vin-badge vin-badge--danger");
    expect(html(Badge, { dot: true })).toBe('<span class="vin-badge"><span class="vin-badge__dot" aria-hidden="true"></span></span>');
  });

  it("CardTitle is an h3 by default and can change level", () => {
    expect(html(CardTitle)).toBe('<h3 class="vin-card__title"></h3>');
    expect(html(CardTitle, { as: "h2" })).toContain("<h2");
  });

  it("Input maps sizes to classes and warns without a name", () => {
    expect(inputClasses({ size: "lg" })).toBe("vin-input vin-input--lg");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    html(Input);
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });

  it("Field links label, hint and error to the input", () => {
    const out = html(Field, { id: "mail", label: "Email", hint: "Never shared", error: "Required" });
    expect(out).toContain('<label class="vin-label" for="mail">Email</label>');
    expect(out).toContain('aria-describedby="mail-error mail-hint"');
    expect(out).toContain('aria-invalid="true"');
    expect(out).toContain('<p class="vin-error" id="mail-error">Required</p>');
  });

  it("ToggleGroup server HTML has one Tab stop", () => {
    const out = html(ToggleGroupHarness);
    expect([...out.matchAll(/tabindex="(-?\d)"/g)].map((m) => m[1])).toEqual(["-1", "0", "-1"]);
  });

  it("Toaster renders nothing on the server", () => {
    expect(html(Toaster).trim()).toBe("");
  });

  it("helpers", () => {
    expect(initials("Ada Lovelace")).toBe("AL");
    expect(initials("Grace")).toBe("G");
    expect(pageRange(5, 10)).toEqual([1, "…", 4, 5, 6, "…", 10]);
    expect(pageRange(3, 10)).toEqual([1, 2, 3, 4, "…", 10]);
  });
});

describe("index.ts", () => {
  it("exports every component named in the specs", () => {
    const specs = import.meta.glob<{ react?: { components: string[] } }>("../../../spec/*.json", { eager: true, import: "default" });
    const names = Object.values(specs).flatMap((s) => s.react?.components ?? []);
    // Svelte passes DialogClose / SheetClose / DrawerClose as a close function to the body and footer snippets instead.
    const missing = names.filter((n) => !(n in index) && !["DialogClose", "SheetClose", "DrawerClose"].includes(n));
    expect(missing).toEqual([]);
  });
});

describe("Pickers on the server", () => {
  it("Calendar: the HTML never depends on today's date", () => {
    const n = new Date();
    const month = `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}`;
    const out = html(Calendar, { month });
    expect(out).not.toContain("aria-current");
    expect(out.match(/tabindex="0"/g)).toHaveLength(1);
    expect(out).toContain(`data-date="${month}-01" aria-label=`);
  });

  it("monthDays gives six full weeks from the right weekday, in UTC", () => {
    const mon = monthDays("2026-11");
    expect(mon).toHaveLength(42);
    expect(mon[0]).toBe("2026-10-26");
    expect(monthDays("2026-11", 0)[0]).toBe("2026-11-01");
    expect(monthDays("2024-03")[41]).toBe("2024-04-07"); // across a DST change
  });

  it("DatePicker and Combobox render their value", () => {
    const dp = html(DatePicker, { mode: "range", "aria-label": "Trip", value: { from: "2026-11-09", to: "2026-11-15" }, name: "trip" });
    expect(dp).toContain("Nov 9 – Nov 15, 2026");
    expect(dp).toContain('value="2026-11-09/2026-11-15"');
    expect(dp).toContain('data-range="start"');
    const cb = html(Combobox, { label: "Zone", options: [{ value: "Europe/London", label: "London" }], value: "Europe/London", name: "tz" });
    expect(cb).toContain('value="London"');
    expect(cb).toContain('aria-selected="true"');
  });
});
