import { describe, it, expect } from "vitest";
import { render } from "svelte/server";
import type { Component } from "svelte";

/*
 * Every Svelte example must render the same elements and classes as its HTML snippet,
 * so the styles see identical markup whichever version people copy.
 */
const specs = import.meta.glob<{ name: string; examples: { id: string }[] }>("../../../spec/*.json", { eager: true, import: "default" });
const html = import.meta.glob<string>("../../html/src/*/*.html", { eager: true, query: "?raw", import: "default" });
const examples = import.meta.glob<Component>("../examples/*/*.svelte", { eager: true, import: "default" });

/** Svelte's server output carries hydration markers: <!--[-->, <!--]-->, <!---->. */
const strip = (markup: string) => markup.replace(/<!--[\s\S]*?-->/g, "");

/** Ordered [tag.class.class] list for every element that has a vin- class. */
const shape = (markup: string) =>
  [...markup.matchAll(/<([a-z][a-z0-9]*)\b[^>]*?\sclass="([^"]*\bvin-[^"]*)"/g)].map(
    ([, tag, cls]) => `${tag}.${cls.split(/\s+/).filter((c) => c.startsWith("vin-")).sort().join(".")}`,
  );

for (const spec of Object.values(specs)) {
  describe(`${spec.name}: Svelte examples match the HTML snippets`, () => {
    for (const ex of spec.examples) {
      it(ex.id, () => {
        const Example = examples[`../examples/${spec.name}/${ex.id}.svelte`];
        const snippet = html[`../../html/src/${spec.name}/${ex.id}.html`];
        expect(Example, `missing examples/${spec.name}/${ex.id}.svelte`).toBeTruthy();
        expect(snippet, `missing html/src/${spec.name}/${ex.id}.html`).toBeTruthy();
        expect(shape(strip(render(Example).body))).toEqual(shape(snippet));
      });
    }
  });
}
