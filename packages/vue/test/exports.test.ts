import { describe, it, expect } from "vitest";
import * as index from "../src/index";

describe("index.ts", () => {
  it("exports every component named in the specs", () => {
    const specs = import.meta.glob<{ react?: { components: string[] } }>("../../../spec/*.json", { eager: true, import: "default" });
    const names = Object.values(specs).flatMap((s) => s.react?.components ?? []);
    expect(names.length).toBeGreaterThan(40);
    expect(names.filter((n) => !(n in index))).toEqual([]);
  });

  it("has a component file for every spec", () => {
    const specs = import.meta.glob<{ name: string }>("../../../spec/*.json", { eager: true, import: "default" });
    const files = import.meta.glob("../src/*.vue");
    const missing = Object.values(specs).map((s) => s.name).filter((n) => !files[`../src/${n}.vue`]);
    expect(missing).toEqual([]);
  });
});
