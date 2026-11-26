/*
 * VinUI pages for WordPress, made from the built site (apps/docs/dist/ui, after `npm run build`).
 *
 * Each page becomes a WordPress page whose content is a few blocks:
 *   [header pattern] [Custom HTML: the page] [footer pattern]
 * and on docs pages the sidebar pattern in the middle. The header, sidebar and footer are WordPress
 * synced patterns, so a change to them is made once and every VinUI page shows it.
 *
 * The site and component CSS are rewritten so every rule only applies inside <div class="vinui-site">,
 * and a reset there keeps the theme's styles for plain elements out: nothing of VinUI reaches the rest
 * of vinish.dev and nothing of the theme reaches VinUI. The theme's page header, footer and title are
 * switched off per page (Blocksy settings, set by wp/publish.py).
 *
 * Writes:
 *   wp/out/patterns/{header,sidebar,footer}.html   the synced patterns
 *   wp/out/pages.json                              every page: path, titles, description, blocks
 *   apps/docs/dist/ui/_astro/site-wp.<hash>.css    the scoped site CSS (deployed with the other files)
 *   wp/preview/ui/**                               the pages inside a copy of a real vinish.dev page, for tests
 *
 * `node scripts/wp-export.mjs`            export
 * `node scripts/wp-export.mjs --preview`  export and write the preview (fetches one live vinish.dev page)
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";
import postcss from "postcss";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "apps/docs/dist/ui");
const OUT = path.join(ROOT, "wp/out");
const PREVIEW = path.join(ROOT, "wp/preview");
const SCOPE = ".vinui-site";
const SKIP = [/^fixtures\//, /^404\.html$/];

// ───────── CSS: keep every site rule inside .vinui-site ─────────

const ROOTISH = /^((?:html|body|:root)(?:\[[^\]]*\]|::?[\w-]+(?:\([^)]*\))?|\.[\w-]+)*)(.*)$/s;

/** One selector, limited to the VinUI area. */
export function scopeSelector(sel) {
  const s = sel.trim();
  if (s.startsWith(SCOPE)) return s;
  const m = s.match(ROOTISH);
  if (m) {
    const [, head, rest] = m;
    if (/^(html|body|:root)$/.test(head)) return rest.trim() ? `${SCOPE}${/^[\s>+~]/.test(rest) ? "" : " "}${rest}`.replace(/\s+/g, " ").trim() : SCOPE;
    return `${head} ${SCOPE}${rest}`;
  }
  if (s === "*") return `${SCOPE}, ${SCOPE} *`;
  return `${SCOPE} ${s}`;
}

/** Splits a selector at its first and last top-level combinator: [first compound, middle+rest] and the last compound. */
function compounds(sel) {
  const parts = []; let depth = 0, cur = "";
  for (let i = 0; i < sel.length; i++) {
    const c = sel[i];
    if (c === "(" || c === "[") depth++;
    else if (c === ")" || c === "]") depth--;
    if (depth === 0 && /[\s>+~]/.test(c)) { if (cur) parts.push(cur); cur = ""; continue; }
    cur += c;
  }
  if (cur) parts.push(cur);
  return parts;
}

// The theme has `pre, code { background-color: … !important }` and `pre { white-space; overflow-x }`
// !important, which beat any normal rule. So VinUI's own values for those on code and pre are made
// !important too (CODE_CSS puts the rest back to the default).
const CODE_EL = /(?:^|[\s>+~(,])(?:pre|code)(?![\w-])|\.[\w-]*?(?:^|[-_])(?:code|pre)(?![a-z])/;
const isCodeRule = (rule) => rule.selectors.some((s) => {
  const parts = compounds(s.trim());
  return CODE_EL.test((parts[parts.length - 1] ?? "").replace(/:not\((?:[^()]|\([^()]*\))*\)/g, ""));
});
const isBg = (d) => /^(background|background-color|white-space|overflow|overflow-x)$/.test(d.prop);
const inKeyframes = (rule) => { for (let p = rule.parent; p; p = p.parent) if (p.type === "atrule" && /keyframes$/i.test(p.name)) return true; return false; };

/** A stylesheet, limited to the VinUI area (keyframes and font faces are left alone). */
export function scopeCss(css) {
  const root = postcss.parse(css);
  root.walkRules((rule) => {
    if (inKeyframes(rule)) return;
    if (isCodeRule(rule)) rule.walkDecls((d) => { if (isBg(d)) d.important = true; });
    rule.selectors = rule.selectors.map(scopeSelector);
  });
  return root.toString();
}

/**
 * The component CSS (vinui.css), one step stronger inside the VinUI area, exactly like the site CSS,
 * so the two keep their order and both beat the reset below. Left as they are:
 * - rules on <html> or the theme attributes alone (:root, [data-vin-style="clay"] …): the theme
 *   variables, which belong on <html> and on previews with their own style;
 * - toasts: the toast tray is added to <body>, outside the VinUI area.
 * A rule that starts at the theme attributes ([data-vin-style="clay"] .vin-btn) works whether the
 * attribute is on <html> (outside) or on a preview inside.
 */
export function scopeLib(css) {
  const root = postcss.parse(css);
  root.walkRules((rule) => {
    if (inKeyframes(rule)) return;
    const themeLevel = rule.selectors.every((sel) => /^(html|:root|\[data-vin-[^\]]*\]|:not\([^)]*\))+$/.test(sel.trim()));
    if (themeLevel) return;
    if (rule.selector.includes("vin-toast")) return;
    if (isCodeRule(rule)) rule.walkDecls((d) => { if (isBg(d)) d.important = true; });
    rule.selectors = rule.selectors.map((sel) => {
      const s = sel.trim();
      const parts = compounds(s);
      const first = parts[0], rest = s.slice(first.length);
      if (/^(html|:root)/.test(first)) return rest ? `${first} ${SCOPE}${rest}` : s;
      if (/^(\[data-vin-[^\]]*\]|:not\([^)]*\))+$/.test(first)) return rest ? `:is(${first} ${SCOPE}, ${SCOPE} ${first})${rest}` : s;
      return `${SCOPE} ${s}`;
    });
  });
  return root.toString();
}

// The theme's other !important rules that reach VinUI: code and pre backgrounds, `pre { white-space;
// overflow-x }` and `pre span { font-size }`.
// These put them back to the browser's defaults; VinUI's own (now !important) rules are stronger still.
// Astro's island wrappers keep their display: contents.
const CODE_CSS = ".vinui-site :where(pre,code){background-color:revert!important}.vinui-site :where(pre){white-space:revert!important;overflow-x:revert!important}.vinui-site :where(pre span){font-size:inherit!important}.vinui-site :where(astro-island,astro-slot,astro-static-slot){display:contents}";

// What WordPress and the theme need to change so the VinUI area fills the page. The first rule stops
// the VinUI area inheriting text settings from the theme (word wrapping, letter spacing…).
// The last rule puts every element in the VinUI area back to the browser's defaults, so the theme's
// styles for plain elements (code, pre, table cells, buttons…) don't change VinUI. It is weaker than
// any VinUI rule and comes before them, so VinUI's own styles still win. SVG keeps its attributes.
// The next two do the same for the few theme rules that are stronger than that (form fields, the last
// item of a list, figure captions); the last one puts back table cells' default padding, which browsers
// add as an attribute style that the reset removes.
const WP_CSS = `
.vinui-site{all:initial;display:block}
.ct-container-full:has(> article .vinui-site){padding:0!important}
article:has(.vinui-site) .entry-content{margin:0!important;padding:0!important}
.entry-content>.vinui-site{max-width:none!important;width:100%!important;margin:0!important}
.vinui-site{min-height:100vh}
.vinui-site :where(:not(svg,svg *)){all:revert}
.vinui-site.vinui-site :where(input,select,textarea,figcaption){all:revert}
.vinui-site.vinui-site :where(ul,ol,li,label):where(:last-child){margin-bottom:revert}
.vinui-site :where(td,th){padding:1px}
`.trim();

// ───────── HTML helpers ─────────

/** Page links without the trailing slash, as WordPress serves them (/ui/blocks/ → /ui/blocks). */
export function wpLinks(html) {
  return html.replace(/(href|action)="(\/ui(?:\/[^"#?.]*?)?)\/((?:[?#][^"]*)?)"/g, (_, a, p, tail) => `${a}="${p}${tail}"`);
}

const read = (p) => fs.readFileSync(p, "utf8");
const sha = (s) => crypto.createHash("sha256").update(s).digest("hex").slice(0, 10);

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name === "index.html") out.push(path.relative(DIST, p));
  }
  return out;
}

/** `<main>` → `<div>`: WordPress already has the page's <main> and id="main". */
function unMain(doc, el) {
  const div = doc.createElement("div");
  for (const a of el.attributes) div.setAttribute(a.name, a.name === "id" && a.value === "main" ? "vinui-main" : a.value);
  while (el.firstChild) div.appendChild(el.firstChild);
  el.replaceWith(div);
  return div;
}

const clean = (html) => wpLinks(html).replace(/href="#main"/g, 'href="#vinui-main"');

// ───────── Export ─────────

export function exportSite() {
  const files = walk(DIST).filter((p) => !SKIP.some((r) => r.test(p))).sort();
  const pages = [];
  let header = null, sidebar = null, footer = null, cssLinks = null, baseScript = null, fonts = null, htmlTag = null;

  for (const file of files) {
    const html = read(path.join(DIST, file));
    const { document: doc } = new JSDOM(html).window;
    const rel = file.replace(/\/?index\.html$/, "");
    const urlPath = "/ui" + (rel ? "/" + rel : "");

    // Shared parts, from the built page (identical on every page apart from the current link).
    const css = [...doc.head.querySelectorAll('link[rel="stylesheet"][href^="/ui/_astro/"]')].map((l) => l.getAttribute("href"));
    cssLinks ??= css;
    if (css.join() !== cssLinks.join()) throw new Error(`${file}: different site CSS (${css.join()}), expected ${cssLinks.join()}`);
    fonts ??= doc.head.querySelector('link[rel="stylesheet"][href^="https://fonts.googleapis.com"]').outerHTML;
    htmlTag ??= { style: doc.documentElement.getAttribute("style"), vinStyle: doc.documentElement.getAttribute("data-vin-style") };
    const scripts = [...doc.body.querySelectorAll(":scope > script")];
    const base = scripts.find((s) => /Base\.astro_astro_type_script/.test(s.getAttribute("src") ?? ""));
    if (!base) throw new Error(`${file}: no site script`);
    baseScript ??= base.outerHTML;

    for (const el of doc.querySelectorAll("[aria-current]")) if (el.closest(".site-header, #sidebar")) el.removeAttribute("aria-current");
    const hdr = doc.body.querySelector(":scope > header.site-header");
    if (!header && hdr.querySelector("#mobile-nav")) header = hdr.outerHTML;
    const side = doc.querySelector("#sidebar");
    if (side) sidebar ??= side.outerHTML;
    if (!footer) {
      const parts = ["div.drawer-backdrop", "aside.drawer", "div.palette-backdrop", "script#search-index", "div.toast"].map((s) => {
        const el = doc.body.querySelector(`:scope > ${s}`);
        if (!el) throw new Error(`${file}: no ${s}`);
        return el.outerHTML;
      });
      footer = parts.join("\n");
    }

    // The page itself.
    const meta = (n) => doc.head.querySelector(`meta[name="${n}"]`)?.getAttribute("content") ?? "";
    const styles = [...doc.head.querySelectorAll("style")].map((s) => scopeCss(s.textContent)).join("\n");
    const jsonLd = [...doc.head.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.outerHTML).join("\n");
    const pageScripts = scripts.filter((s) => s !== base && s.id !== "search-index").map((s) => s.outerHTML).join("\n");
    const lead = [styles && `<style>${styles}</style>`, jsonLd].filter(Boolean).join("\n");

    const blocks = [{ pattern: "header" }];
    const docs = doc.body.querySelector(":scope > div.docs");
    if (docs) {
      const main = unMain(doc, docs.querySelector(":scope > main"));
      docs.querySelector(":scope > #sidebar").remove();
      blocks.push({ html: [lead, '<div class="docs">'].filter(Boolean).join("\n") });
      blocks.push({ pattern: "sidebar" });
      blocks.push({ html: [...docs.children].map((c) => c.outerHTML).join("\n") + "\n</div>" + (pageScripts ? "\n" + pageScripts : "") });
      void main;
    } else {
      const main = doc.body.querySelector(":scope > main");
      if (!main) throw new Error(`${file}: no <main>`);
      unMain(doc, main);
      const body = [...doc.body.children].filter((c) => c.matches("div#vinui-main, footer.site-footer")).map((c) => c.outerHTML).join("\n");
      blocks.push({ html: [lead, body, pageScripts].filter(Boolean).join("\n") });
    }
    blocks.push({ pattern: "footer" });

    const title = doc.title.replace(/&amp;/g, "&");
    const h1 = doc.querySelector("h1")?.textContent.trim().replace(/\s+/g, " ") ?? title;
    pages.push({
      path: urlPath,
      slug: urlPath.split("/").pop(),
      parent: urlPath === "/ui" ? null : urlPath.split("/").slice(0, -1).join("/"),
      title: urlPath === "/ui" ? "VinUI" : h1,
      seoTitle: title,
      description: meta("description"),
      blocks: blocks.map((b) => (b.html ? { html: clean(b.html) } : b)),
    });
  }
  if (!header || !sidebar || !footer) throw new Error("missing a shared part");

  // The scoped site CSS, saved next to the other site files under a content hash.
  const siteCss = cssLinks.filter((h) => !/registry\./.test(h));
  const libCss = cssLinks.filter((h) => /registry\./.test(h));
  const scoped = [CODE_CSS, ...libCss.map((h) => scopeLib(read(path.join(DIST, "..", h)))), ...siteCss.map((h) => scopeCss(read(path.join(DIST, "..", h))))].join("\n");
  const cssName = `site-wp.${sha(scoped)}.css`;
  for (const f of fs.readdirSync(path.join(DIST, "_astro"))) if (/^site-wp\..*\.css$/.test(f)) fs.rmSync(path.join(DIST, "_astro", f));
  fs.writeFileSync(path.join(DIST, "_astro", cssName), scoped);

  // Default theme on <html> (the built pages have it on the tag), then the visitor's saved theme.
  const boot = `<script>(function(){var d=document.documentElement;if(!d.hasAttribute("data-vin-style")){d.setAttribute("data-vin-style",${JSON.stringify(htmlTag.vinStyle)});${JSON.stringify(htmlTag.style ?? "")}.split(";").forEach(function(p){var i=p.indexOf(":");if(i>0)d.style.setProperty(p.slice(0,i),p.slice(i+1))})}try{var b=JSON.parse(localStorage.getItem("vinui:boot")||"null");if(!b)return;for(var k in b.attrs)b.attrs[k]===null?d.removeAttribute(k):d.setAttribute(k,b.attrs[k]);d.style.removeProperty("--vin-font");for(var v in b.vars)d.style.setProperty(v,b.vars[v])}catch(e){}})();</script>`;

  // Marks the current page in the header and sidebar (they are shared, so this happens in the browser).
  const current = `<script>(function(){var r=document.querySelector(".vinui-site");if(!r)return;var p=location.pathname.replace(/\\/+$/,"")||"/",sec=p.split("/")[2]||"";r.querySelectorAll("#sidebar a[href]").forEach(function(a){if(a.getAttribute("href").replace(/[#?].*$/,"").replace(/\\/+$/,"")===p)a.setAttribute("aria-current","page")});if(sec)r.querySelectorAll(".site-header .nav a,#mobile-nav a").forEach(function(a){if(a.getAttribute("href").split("/")[2]===sec)a.setAttribute("aria-current","page")});if(r.querySelector("#sidebar")){var b=r.querySelector("[data-menu-toggle]");if(b){b.classList.remove("menu-btn--nav");b.setAttribute("aria-controls","sidebar")}var m=r.querySelector("#mobile-nav");if(m)m.remove()}})();</script>`;

  const note = (what) => `<!-- VinUI ${what}: shared by every VinUI page. Made by scripts/wp-export.mjs from the VinUI repo; change it there, not here. -->`;
  const patterns = {
    header: clean([
      note("header"),
      `<style>${WP_CSS}</style>`,
      '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
      fonts,
      `<link rel="stylesheet" href="/ui/_astro/${cssName}">`,
      boot,
      '<div class="vinui-site alignfull">',
      '<a class="sr-only" href="#vinui-main">Skip to content</a>',
      header,
    ].join("\n")),
    sidebar: clean(note("sidebar") + "\n" + sidebar),
    footer: clean([note("footer"), footer, "</div>", current, baseScript].join("\n")),
  };

  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(path.join(OUT, "patterns"), { recursive: true });
  for (const [k, v] of Object.entries(patterns)) fs.writeFileSync(path.join(OUT, "patterns", `${k}.html`), v + "\n");
  fs.writeFileSync(path.join(OUT, "pages.json"), JSON.stringify({ css: cssName, pages }, null, 1));
  return { pages, patterns, cssName };
}

// ───────── Preview: the pages inside a copy of a live vinish.dev page ─────────

/** WordPress block markup, the way the page is saved. */
export function blockMarkup(blocks, refs) {
  return blocks.map((b) => (b.pattern ? `<!-- wp:block {"ref":${refs[b.pattern]}} /-->` : `<!-- wp:html -->\n${b.html}\n<!-- /wp:html -->`)).join("\n\n");
}

async function writePreview({ pages, patterns }) {
  const shellFile = path.join(ROOT, "wp/out/shell.html");
  // A published page with the same Blocksy settings the VinUI pages get (no theme header, footer or title).
  const res = await fetch("https://vinish.dev/glassback-padel-browser-based-game", { headers: { "user-agent": "curl/8.7.1" } });
  if (!res.ok) throw new Error(`shell page: ${res.status}`);
  const live = await res.text();
  fs.writeFileSync(shellFile, live);
  const head = live.slice(live.indexOf("<head"), live.indexOf("</head>"))
    .replace(/<script\b[\s\S]*?<\/script>/g, "")       // ads and analytics stay out of tests
    .replace(/<title>[\s\S]*?<\/title>/, "<title>VinUI preview</title>");
  const bodyTag = live.match(/<body[^>]*>/)[0];
  const start = live.indexOf("<div id=\"main-container\">");
  const entry = live.indexOf('<div class="entry-content', start);
  const open = live.slice(start, live.indexOf(">", entry) + 1);
  const close = "</div></article></div></main></div>";
  fs.rmSync(PREVIEW, { recursive: true, force: true });
  for (const p of pages) {
    const content = p.blocks.map((b) => (b.pattern ? patterns[b.pattern] : b.html)).join("\n");
    const dir = path.join(PREVIEW, p.path);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "index.html"), `<!doctype html><html lang="en-US">${head}</head>${bodyTag}<a class="skip-link screen-reader-text" href="#main">Skip to content</a>${open}\n${content}\n${close}</body></html>`);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const r = exportSite();
  console.log(`wp-export: ${r.pages.length} pages, patterns header/sidebar/footer, ${r.cssName}`);
  if (process.argv.includes("--preview")) {
    await writePreview(r);
    console.log(`wp-export: preview in wp/preview/ui`);
  }
}
