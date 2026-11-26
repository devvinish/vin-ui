/**
 * The Charts gallery: every chart is one config, and its HTML, React, Vue and Svelte code is
 * generated from it, so the four versions can't drift. The HTML is the React chart rendered to
 * static markup (plus data-vin-chart, which turns on the tooltip in vinui.js).
 */
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Chart, type ChartRow, type ChartType } from "@/components/vin/chart";

export type ChartConfig = {
  id: string; group: "Area" | "Bar" | "Line" | "Pie"; title: string; description: string;
  type: ChartType; stacked?: boolean; curve?: "smooth"; centerLabel?: string; legend?: boolean;
  label: string; index: string; indexLabel: string; name: string; data: ChartRow[];
  series: { key: string; label: string }[]; money?: "usd" | "inr"; percent?: boolean;
};

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const visitors = months.map((month, i) => ({ month, desktop: [186, 305, 237, 73, 209, 214][i], mobile: [80, 200, 120, 190, 130, 140][i] }));
const sources = months.map((month, i) => ({ month, organic: [420, 480, 510, 560, 610, 690][i], paid: [210, 260, 240, 300, 320, 310][i], referral: [90, 110, 150, 140, 170, 210][i] }));
const browsers = [
  { browser: "Chrome", visitors: 275 }, { browser: "Safari", visitors: 200 }, { browser: "Firefox", visitors: 187 },
  { browser: "Edge", visitors: 173 }, { browser: "Other", visitors: 90 },
];

export const CHARTS: ChartConfig[] = [
  // Area
  { id: "area-smooth", group: "Area", title: "Area", description: "One series with a smooth curve. The legend hides itself when there's only one series.",
    type: "area", curve: "smooth", label: "Visitors by month, January to June", index: "month", indexLabel: "Month", name: "visitors",
    data: visitors.map(({ month, desktop }) => ({ month, desktop })), series: [{ key: "desktop", label: "Visitors" }] },
  { id: "area-stacked", group: "Area", title: "Area, stacked", description: "Desktop and mobile stacked, so the top edge is the total.",
    type: "area", stacked: true, curve: "smooth", label: "Visitors by device, January to June", index: "month", indexLabel: "Month", name: "visitors",
    data: visitors, series: [{ key: "desktop", label: "Desktop" }, { key: "mobile", label: "Mobile" }] },
  { id: "area-sources", group: "Area", title: "Area, three series", description: "Traffic by source, stacked with straight lines.",
    type: "area", stacked: true, label: "Visits by traffic source, January to June", index: "month", indexLabel: "Month", name: "traffic",
    data: sources, series: [{ key: "organic", label: "Organic" }, { key: "paid", label: "Paid" }, { key: "referral", label: "Referral" }] },
  { id: "area-revenue", group: "Area", title: "Area, currency", description: "Values and ticks formatted as rupees with Intl.NumberFormat.",
    type: "area", label: "Revenue by month, January to August", index: "month", indexLabel: "Month", name: "revenue", money: "inr",
    data: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"].map((month, i) => ({ month, revenue: [12400, 15100, 14200, 18900, 22300, 21000, 26400, 29800][i] })),
    series: [{ key: "revenue", label: "Revenue" }] },

  // Bar
  { id: "bar-simple", group: "Bar", title: "Bar", description: "One series, one bar per month.",
    type: "bar", label: "Visitors by month, January to June", index: "month", indexLabel: "Month", name: "visitors",
    data: visitors.map(({ month, desktop }) => ({ month, desktop })), series: [{ key: "desktop", label: "Visitors" }] },
  { id: "bar-multiple", group: "Bar", title: "Bar, side by side", description: "Two series next to each other. Hover a month to compare them.",
    type: "bar", label: "Visitors by device, January to June", index: "month", indexLabel: "Month", name: "visitors",
    data: visitors, series: [{ key: "desktop", label: "Desktop" }, { key: "mobile", label: "Mobile" }] },
  { id: "bar-stacked", group: "Bar", title: "Bar, stacked", description: "Three series in one bar per month.",
    type: "bar", stacked: true, label: "Visits by traffic source, January to June", index: "month", indexLabel: "Month", name: "traffic",
    data: sources, series: [{ key: "organic", label: "Organic" }, { key: "paid", label: "Paid" }, { key: "referral", label: "Referral" }] },
  { id: "bar-negative", group: "Bar", title: "Bar, negative values", description: "Bars grow down from the zero line for losses.",
    type: "bar", label: "Profit and loss by month, January to June", index: "month", indexLabel: "Month", name: "profit", money: "usd",
    data: months.map((month, i) => ({ month, profit: [4200, -1800, 2600, 5100, -900, 3800][i] })), series: [{ key: "profit", label: "Profit" }] },

  // Line
  { id: "line-smooth", group: "Line", title: "Line", description: "One series with a smooth curve.",
    type: "line", curve: "smooth", label: "Visitors by month, January to June", index: "month", indexLabel: "Month", name: "visitors",
    data: visitors.map(({ month, desktop }) => ({ month, desktop })), series: [{ key: "desktop", label: "Visitors" }] },
  { id: "line-multiple", group: "Line", title: "Line, two series", description: "This week against last week, with a point on each day.",
    type: "line", label: "Signups per day, this week and last week", index: "day", indexLabel: "Day", name: "signups",
    data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => ({ day, now: [42, 58, 51, 73, 69, 38, 31][i], before: [35, 41, 49, 52, 61, 30, 24][i] })),
    series: [{ key: "now", label: "This week" }, { key: "before", label: "Last week" }] },
  { id: "line-percent", group: "Line", title: "Line, percentages", description: "Conversion rate, formatted as a percentage.",
    type: "line", label: "Conversion rate by month, January to June", index: "month", indexLabel: "Month", name: "conversion", percent: true,
    data: months.map((month, i) => ({ month, rate: [2.1, 2.6, 2.4, 3.2, 3.5, 3.9][i] })), series: [{ key: "rate", label: "Conversion" }] },
  { id: "line-sources", group: "Line", title: "Line, three series", description: "Three smooth lines; each colour comes from your accent.",
    type: "line", curve: "smooth", label: "Visits by traffic source, January to June", index: "month", indexLabel: "Month", name: "traffic",
    data: sources, series: [{ key: "organic", label: "Organic" }, { key: "paid", label: "Paid" }, { key: "referral", label: "Referral" }] },

  // Pie
  { id: "pie-simple", group: "Pie", title: "Pie", description: "Share of visitors by browser. Hover a slice, or focus the chart and use the arrow keys.",
    type: "pie", label: "Visitors by browser", index: "browser", indexLabel: "Browser", name: "browsers", data: browsers, series: [{ key: "visitors", label: "Visitors" }] },
  { id: "donut-total", group: "Pie", title: "Donut with total", description: "The total sits in the middle, with a caption.",
    type: "donut", centerLabel: "Visitors", label: "Visitors by browser", index: "browser", indexLabel: "Browser", name: "browsers", data: browsers, series: [{ key: "visitors", label: "Visitors" }] },
  { id: "donut-plans", group: "Pie", title: "Donut", description: "Three slices, no caption in the middle.",
    type: "donut", label: "Customers by plan", index: "plan", indexLabel: "Plan", name: "plans",
    data: [{ plan: "Free", customers: 1240 }, { plan: "Pro", customers: 680 }, { plan: "Team", customers: 210 }], series: [{ key: "customers", label: "Customers" }] },
  { id: "pie-devices", group: "Pie", title: "Pie, two slices", description: "Mobile against desktop.",
    type: "pie", label: "Visits by device", index: "device", indexLabel: "Device", name: "devices",
    data: [{ device: "Mobile", visits: 6420 }, { device: "Desktop", visits: 3810 }], series: [{ key: "visits", label: "Visits" }] },
];

export const CHART_GROUPS = ["Area", "Bar", "Line", "Pie"] as const;

/* ───────── code generation ───────── */

const pascal = (id: string) => id.replace(/(^|-)(\w)/g, (_, __, c: string) => c.toUpperCase());
const val = (v: unknown) => (typeof v === "string" ? JSON.stringify(v) : String(v));
const row = (r: ChartRow) => `{ ${Object.entries(r).map(([k, v]) => `${k}: ${val(v)}`).join(", ")} }`;
const rows = (c: ChartConfig, pad: string) => `[\n${c.data.map((r) => `${pad}  ${row(r)},`).join("\n")}\n${pad}]`;
const seriesJs = (c: ChartConfig, q = '"') => `[${c.series.map((s) => `{ key: ${q}${s.key}${q}, label: ${q}${s.label}${q} }`).join(", ")}]`;

/** Formatter setup lines and the expressions to pass. */
function formatters(c: ChartConfig) {
  if (c.money) {
    const [loc, cur] = c.money === "inr" ? ["en-IN", "INR"] : ["en-US", "USD"];
    return {
      setup: [
        `const money = new Intl.NumberFormat("${loc}", { style: "currency", currency: "${cur}", maximumFractionDigits: 0 });`,
        `const short = new Intl.NumberFormat("${loc}", { style: "currency", currency: "${cur}", notation: "compact", maximumFractionDigits: 0 });`,
      ],
      format: "(v) => money.format(v)", tick: "(v) => short.format(v)",
      fn: { format: (v: number) => new Intl.NumberFormat(loc, { style: "currency", currency: cur, maximumFractionDigits: 0 }).format(v), tick: (v: number) => new Intl.NumberFormat(loc, { style: "currency", currency: cur, notation: "compact", maximumFractionDigits: 0 }).format(v) },
    };
  }
  if (c.percent) return { setup: [], format: "(v) => `${v}%`", tick: "(v) => `${v}%`", fn: { format: (v: number) => `${v}%`, tick: (v: number) => `${v}%` } };
  return null;
}

export function reactCode(c: ChartConfig) {
  const f = formatters(c);
  const props = [
    `type="${c.type}"`, c.stacked && "stacked", c.curve && `curve="${c.curve}"`, c.centerLabel && `centerLabel="${c.centerLabel}"`,
    `label="${c.label}"`, `data={${c.name}}`, `index="${c.index}"`, `indexLabel="${c.indexLabel}"`, `series={${seriesJs(c)}}`,
    f && `format={${f.format}}`, f && `tickFormat={${f.tick}}`,
  ].filter(Boolean);
  return [
    `import { Chart } from "@/components/vin/chart";`, "",
    `const ${c.name} = ${rows(c, "")};`, ...(f ? ["", ...f.setup] : []), "",
    `export function ${pascal(c.id)}() {`, "  return (", "    <Chart",
    ...props.map((p) => `      ${p}`), "    />", "  );", "}", "",
  ].join("\n");
}

export function vueCode(c: ChartConfig) {
  const f = formatters(c);
  const props = [
    `type="${c.type}"`, c.stacked && "stacked", c.curve && `curve="${c.curve}"`, c.centerLabel && `center-label="${c.centerLabel}"`,
    `label="${c.label}"`, `:data="${c.name}"`, `index="${c.index}"`, `index-label="${c.indexLabel}"`, `:series="${seriesJs(c, "'")}"`,
    f && `:format="format"`, f && `:tick-format="tickFormat"`,
  ].filter(Boolean);
  return [
    `<script setup lang="ts">`, `import Chart from "@/components/vin/chart.vue";`, "",
    `const ${c.name} = ${rows(c, "")};`,
    ...(f ? ["", ...f.setup, `const format = ${f.format.replace("(v)", "(v: number)")};`, `const tickFormat = ${f.tick.replace("(v)", "(v: number)")};`] : []),
    `</script>`, "", `<template>`, "  <Chart", ...props.map((p) => `    ${p}`), "  />", `</template>`, "",
  ].join("\n");
}

export function svelteCode(c: ChartConfig) {
  const f = formatters(c);
  const props = [
    `type="${c.type}"`, c.stacked && "stacked", c.curve && `curve="${c.curve}"`, c.centerLabel && `centerLabel="${c.centerLabel}"`,
    `label="${c.label}"`, `data={${c.name}}`, `index="${c.index}"`, `indexLabel="${c.indexLabel}"`, `series={${seriesJs(c)}}`,
    f && `format={${f.format}}`, f && `tickFormat={${f.tick}}`,
  ].filter(Boolean);
  return [
    `<script lang="ts">`, `  import Chart from "$lib/components/vin/chart.svelte";`, "",
    `  const ${c.name} = ${rows(c, "  ")};`, ...(f ? ["", ...f.setup.map((l) => `  ${l}`)] : []), `</script>`, "",
    "<Chart", ...props.map((p) => `  ${p}`), "/>", "",
  ].join("\n");
}

/** The chart as static HTML, indented one element per line where it holds no text. */
export function htmlCode(c: ChartConfig) {
  const f = formatters(c);
  const markup = renderToStaticMarkup(createElement(Chart, {
    type: c.type, stacked: c.stacked, curve: c.curve, centerLabel: c.centerLabel, label: c.label, data: c.data,
    index: c.index, indexLabel: c.indexLabel, series: c.series, ...(f ? { format: f.fn.format, tickFormat: f.fn.tick } : {}),
  }));
  return prettyHtml(markup.replace(/^<div class="([^"]*)"/, '<div class="$1" data-vin-chart'));
}

type Node = { tag: string; attrs: string; kids: (Node | string)[] };
const VOID = new Set(["input", "br", "img", "hr", "meta", "link", "source"]);
const SVG_EMPTY = new Set(["path", "rect", "circle", "line", "polyline", "polygon", "ellipse"]);

/** A tiny formatter for well-formed markup (React's output): block children on their own lines. */
export function prettyHtml(markup: string): string {
  const root: Node = { tag: "", attrs: "", kids: [] };
  const stack = [root];
  for (const m of markup.matchAll(/<\/?([a-zA-Z][\w-]*)([^>]*)>|([^<]+)/g)) {
    const top = stack[stack.length - 1];
    if (m[3] !== undefined) { top.kids.push(m[3]); continue; }
    if (m[0].startsWith("</")) { stack.pop(); continue; }
    const tag = m[1], self = m[2].endsWith("/") || VOID.has(tag);
    const node: Node = { tag, attrs: m[2].replace(/\/$/, "").trimEnd(), kids: [] };
    top.kids.push(node);
    if (!self) stack.push(node);
  }
  const inline = (n: Node | string): string =>
    typeof n === "string" ? n
      : VOID.has(n.tag) ? `<${n.tag}${n.attrs}>`
      : SVG_EMPTY.has(n.tag) && !n.kids.length ? `<${n.tag}${n.attrs} />`
      : `<${n.tag}${n.attrs}>${n.kids.map(inline).join("")}</${n.tag}>`;
  const block = (n: Node | string, pad: string): string => {
    if (typeof n === "string" || !n.kids.length || n.kids.some((k) => typeof k === "string" && k.trim())) return pad + inline(n);
    return `${pad}<${n.tag}${n.attrs}>\n${n.kids.map((k) => block(k, pad + "  ")).join("\n")}\n${pad}</${n.tag}>`;
  };
  return root.kids.map((k) => block(k, "")).join("\n") + "\n";
}
