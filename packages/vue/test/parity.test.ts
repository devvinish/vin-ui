import { describe, it, expect } from "vitest";
import { createSSRApp, type Component } from "vue";
import { renderToString } from "@vue/server-renderer";

/*
 * Every Vue example must render the same elements and classes as its HTML snippet,
 * so the styles see identical markup whichever version people copy.
 */
const specs = import.meta.glob<{ name: string; examples: { id: string }[] }>("../../../spec/*.json", { eager: true, import: "default" });
const html = import.meta.glob<string>("../../html/src/*/*.html", { eager: true, query: "?raw", import: "default" });
const examples = import.meta.glob<Component>("../examples/*/*.vue", { eager: true, import: "default" });

/** Ordered [tag.class.class] list for every element that has a vin- class. */
const shape = (markup: string) =>
  [...markup.matchAll(/<([a-z][a-z0-9]*)\b[^>]*?\sclass="([^"]*\bvin-[^"]*)"/g)].map(
    ([, tag, cls]) => `${tag}.${cls.split(/\s+/).filter((c) => c.startsWith("vin-")).sort().join(".")}`,
  );

for (const spec of Object.values(specs)) {
  describe(`${spec.name}: Vue examples match the HTML snippets`, () => {
    for (const ex of spec.examples) {
      it(ex.id, async () => {
        const Example = examples[`../examples/${spec.name}/${ex.id}.vue`];
        const snippet = html[`../../html/src/${spec.name}/${ex.id}.html`];
        expect(Example, `missing examples/${spec.name}/${ex.id}.vue`).toBeTruthy();
        expect(snippet, `missing html/src/${spec.name}/${ex.id}.html`).toBeTruthy();
        expect(shape(await renderToString(createSSRApp(Example)))).toEqual(shape(snippet));
      });
    }
  });
}
