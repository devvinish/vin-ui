import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { ComponentType } from "react";

/*
 * Every React example must render the same elements and classes as its HTML snippet,
 * so the styles see identical markup whichever version people copy.
 */
const specs = import.meta.glob<{ name: string; examples: { id: string }[] }>("../../../spec/*.json", { eager: true, import: "default" });
const html = import.meta.glob<string>("../../html/src/*/*.html", { eager: true, query: "?raw", import: "default" });
const examples = import.meta.glob<Record<string, ComponentType>>("../examples/*/*.tsx", { eager: true });

/** Ordered [tag.class.class] list for every element that has a vin- class. */
const shape = (markup: string) =>
  [...markup.matchAll(/<([a-z][a-z0-9]*)\b[^>]*?\sclass="([^"]*\bvin-[^"]*)"/g)].map(
    ([, tag, cls]) => `${tag}.${cls.split(/\s+/).filter((c) => c.startsWith("vin-")).sort().join(".")}`,
  );

for (const spec of Object.values(specs)) {
  describe(`${spec.name}: React examples match the HTML snippets`, () => {
    for (const ex of spec.examples) {
      it(ex.id, () => {
        const mod = examples[`../examples/${spec.name}/${ex.id}.tsx`];
        const snippet = html[`../../html/src/${spec.name}/${ex.id}.html`];
        expect(mod, `missing examples/${spec.name}/${ex.id}.tsx`).toBeTruthy();
        expect(snippet, `missing html/src/${spec.name}/${ex.id}.html`).toBeTruthy();
        const Example = Object.values(mod)[0];
        expect(shape(renderToStaticMarkup(<Example />))).toEqual(shape(snippet));
      });
    }
  });
}
