# VinUI

Free, MIT-licensed UI components from [vinish.dev](https://vinish.dev/ui).
One set of components, **8 styles** (Precision, Tactile, Clay, Tonal, Editorial, Terminal, Paper, Bento), any accent colour, light and dark. For **HTML, React, Vue and Svelte**.

```bash
npx @vinish/ui init
npx @vinish/ui add button
```

The CLI reads your framework from `package.json`, writes the component files into your project (you own the code), and records them in `vin.json`. Plain HTML: one stylesheet, copy the markup, and add `vinui.js` for the interactive parts.

## Components (63)

Every component works in all 8 styles, light and dark, and in all four frameworks.

| Group | Components |
| --- | --- |
| Actions | Button, Button Group, Toggle, Toggle Group |
| Forms | Input, Input Group, Input OTP, Textarea, Checkbox, Radio Group, Switch, Native Select, Select, Combobox, Slider, Calendar, Date Picker |
| Data display | Badge, Card, Avatar, Kbd, Table, Data Table, Item, Empty, Typography, Code Block, Carousel, Chart |
| Feedback | Alert, Progress, Skeleton, Spinner, Toast |
| Layout | Separator, Aspect Ratio, Accordion, Collapsible, Tabs, Scroll Area, Resizable |
| Navigation | Breadcrumb, Pagination, Navigation Menu, Menubar, Sidebar |
| Overlays | Dialog, Alert Dialog, Sheet, Drawer, Popover, Hover Card, Tooltip, Dropdown Menu, Context Menu, Command |
| AI chat | Message, Bubble, Message Scroller, Attachment, Marker, Questionnaire, Trace |

In plain HTML, components with keyboard or pointer behaviour use `vinui.js` (one small script, no dependencies); the rest need no JavaScript. Dialog, Alert Dialog, Sheet and Drawer are the browser's `<dialog>` and open without it. Without the script the Carousel still swipes, the Chart still draws and the Data Table still shows its first page.

## AI tools

- **MCP server:** `npx -y @vinish/ui mcp` (local; can also add files), or `https://vinish.dev/ui/mcp` (remote; read and search only).
- **llms.txt:** `https://vinish.dev/ui/llms.txt` and `llms-full.txt`.
- **Registry:** `https://vinish.dev/ui/r/{html|react|vue|svelte}/{name}.json`.

## How it works

- Each style is a set of design tokens (`packages/styles/src/styles.mjs`). The CSS is generated from them, so every component reads the same token names in every style.
- The theme lives on one element, usually `<html>`:

  ```html
  <html data-vin-style="tactile" data-vin-mode="dark" data-vin-radius="lg" style="--vin-accent: #0d9488">
  ```

- Every component has one API spec (`spec/<name>.json`). The HTML snippets are checked against it, and the React, Vue and Svelte versions are tested to render the same markup as the HTML.

## Repository

| Path | What it is |
| --- | --- |
| `spec/` | Component API specs: the single source of truth |
| `packages/styles` | The 8 styles as data, the CSS generator, `vinui.css` |
| `packages/theme` | Theme engine: apply, save, export/import `vin-theme.json`, share links, contrast-safe accent text |
| `packages/html` | Copy-paste HTML snippets and `vinui.js` |
| `packages/react` | React components and their examples |
| `packages/vue` | Vue 3 components and their examples |
| `packages/svelte` | Svelte 5 components and their examples |
| `packages/cli` | `@vinish/ui`: the CLI and the MCP server |
| `apps/docs` | The website at vinish.dev/ui (Astro) |
| `workers/site` | Cloudflare Worker for `vinish.dev/ui` and `vinish.dev/ui/*`: the site plus the remote MCP endpoint |
| `tests/visual` | Playwright: screenshots and axe (WCAG 2.2 AA) in every style × light/dark, plus behaviour tests |

## Commands

Node 24 (see `.nvmrc`), npm workspaces.

```bash
npm install
npm run dev            # docs at http://localhost:4321/ui/
npm test               # unit tests for every package
npm run build          # build styles + docs into apps/docs/dist
npm run test:visual    # screenshots + axe + behaviour (run npm run build first)
npm run test:visual:update   # accept intentional visual changes
```

## Deploying

vinish.dev stays on WordPress; only `vinish.dev/ui` and `vinish.dev/ui/*` goes to a Cloudflare Worker (`workers/site`). The Worker serves the built site as static files and answers the remote MCP server at `/ui/mcp`.

```bash
npm run build                 # builds apps/docs/dist (the site lives in dist/ui)
cd workers/site
npx wrangler deploy           # routes vinish.dev/ui and vinish.dev/ui/* on the vinish.dev zone
```

The site is built under `/ui`, so no paths are rewritten. `npm test --prefix workers/site` checks the MCP endpoint against the built site.

### Releases

`.github/workflows/release.yml` runs on a `v*` tag (matching `packages/cli/package.json`) or by hand. It runs CI, publishes `@vinish/ui` to npm with provenance, and deploys the Worker. Repository secrets: `NPM_TOKEN`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.

### Ads

The docs pages have a right-sidebar Mediavine unit, using the same markup as the vinish.dev game pages: an `<aside class="mv-siderail-slot">` with an empty `300x600` slot inside. Mediavine fills it.

The site does not load the Mediavine script: Mediavine adds it when the pages are published through WordPress. In `npm run dev` the slot shows a dashed 300 × 600 preview.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). The short version: a component ships only when it works in all 8 styles.

## License

MIT © vinish.dev
