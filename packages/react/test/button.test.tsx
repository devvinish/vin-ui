import { describe, it, expect, vi } from "vitest";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { Button, buttonClasses } from "../src/button";

const spec = JSON.parse(readFileSync(new URL("../../../spec/button.json", import.meta.url), "utf8"));

describe("Button API matches spec/button.json", () => {
  it("supports every variant and size in the spec", () => {
    for (const variant of spec.props.variant.values) {
      for (const size of spec.props.size.values) {
        const cls = buttonClasses({ variant, size });
        expect(cls.split(" ")[0]).toBe("vin-btn");
        if (variant !== spec.props.variant.default) expect(cls).toContain(`vin-btn--${variant}`);
        if (size !== spec.props.size.default) expect(cls).toContain(`vin-btn--${size}`);
      }
    }
  });

  it("defaults to type=button so it never submits a form by accident", () => {
    expect(renderToStaticMarkup(<Button>Go</Button>)).toBe('<button type="button" class="vin-btn">Go</button>');
    expect(renderToStaticMarkup(<Button type="submit">Go</Button>)).toContain('type="submit"');
  });

  it("renders a link when given href, and marks disabled links for assistive tech", () => {
    expect(renderToStaticMarkup(<Button href="/docs">Docs</Button>)).toBe('<a href="/docs" class="vin-btn">Docs</a>');
    const disabled = renderToStaticMarkup(<Button href="/docs" disabled>Docs</Button>);
    expect(disabled).toContain('aria-disabled="true"');
    expect(disabled).toContain('tabindex="-1"');
  });

  it("keeps custom classNames after the VinUI classes", () => {
    expect(buttonClasses({ variant: "ghost", className: "w-full" })).toBe("vin-btn vin-btn--ghost w-full");
  });

  it("warns in development when an icon button has no label", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    renderToStaticMarkup(<Button size="icon">+</Button>);
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });
});
