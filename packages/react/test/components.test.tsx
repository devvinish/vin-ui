import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Badge, badgeClasses } from "../src/badge";
import { CardTitle } from "../src/card";
import { Field, Input, inputClasses } from "../src/input";

describe("Badge", () => {
  it("maps variants to classes and hides the dot from screen readers", () => {
    expect(badgeClasses()).toBe("vin-badge");
    expect(badgeClasses({ variant: "danger" })).toBe("vin-badge vin-badge--danger");
    expect(renderToStaticMarkup(<Badge dot>Live</Badge>)).toBe('<span class="vin-badge"><span class="vin-badge__dot" aria-hidden="true"></span>Live</span>');
  });
});

describe("Card", () => {
  it("CardTitle is an h3 by default and can change level", () => {
    expect(renderToStaticMarkup(<CardTitle>Hi</CardTitle>)).toBe('<h3 class="vin-card__title">Hi</h3>');
    expect(renderToStaticMarkup(<CardTitle as="h2">Hi</CardTitle>)).toContain("<h2");
  });
});

describe("Input and Field", () => {
  it("maps sizes to classes", () => {
    expect(inputClasses({ size: "lg" })).toBe("vin-input vin-input--lg");
  });

  it("Field links label, hint and error to the input", () => {
    const html = renderToStaticMarkup(<Field id="mail" label="Email" hint="Never shared" error="Required" />);
    expect(html).toContain('<label for="mail" class="vin-label">Email</label>');
    expect(html).toContain('aria-describedby="mail-error mail-hint"');
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain('<p class="vin-error" id="mail-error">Required</p>');
  });

  it("Field generates a valid id when none is given", () => {
    const html = renderToStaticMarkup(<Field label="Name" />);
    const id = html.match(/for="([^"]+)"/)![1];
    expect(id).toMatch(/^[a-zA-Z][\w-]*$/);
    expect(html).toContain(`id="${id}"`);
  });

  it("warns when an Input has no accessible name", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    renderToStaticMarkup(<Input />);
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });
});
