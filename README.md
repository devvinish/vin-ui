# VinUI

Free, MIT-licensed UI components from [vinish.dev](https://vinish.dev/ui).
One set of components, **8 styles** (Precision, Tactile, Clay, Tonal, Editorial, Terminal, Paper, Bento), any accent colour, light and dark. HTML and React today; Vue and Svelte next.

```bash
npx @vinish/ui init
npx @vinish/ui add button
```

> Status: **Phase 1 done: 40 components**, ready in all 8 styles, HTML and React: Button, Button Group, Toggle, Badge, Card, Input, Textarea, Checkbox, Radio Group, Switch, Native Select, Select, Tabs, Toggle Group, Input Group, Input OTP, Slider, Avatar, Kbd, Separator, Skeleton, Spinner, Progress, Alert, Typography, Item, Table, Empty, Aspect Ratio, Breadcrumb, Pagination, Accordion, Collapsible, Tooltip, Popover, Toast, Dialog, Alert Dialog, Sheet, Dropdown Menu. Select, Tabs, Toggle, Toggle Group, Input OTP, Slider, Tooltip, Popover, Toast, Dropdown Menu, the Alert close button and the Textarea count need `vinui.js` (one small script) in plain HTML. Dialog, Alert Dialog and Sheet are the browser's `<dialog>` and work without it; `vinui.js` only fills in `commandfor` and `closedby` for browsers that lack them. Roadmap: 63 components (40 in Phase 1, 23 in Phase 2 including AI chat), listed in `apps/docs/src/data/components.ts`.
>
> Phase 2, data display: Code Block, Carousel, Chart. The Code Block copy button, the Carousel buttons and the Chart tooltips use `vinui.js` in plain HTML (the Carousel still swipes and the Chart still draws without it).

## How it works

- Each style is a set of design tokens (`packages/styles/src/styles.mjs`). The CSS is generated from them, so every component reads the same token names in every style.
- The theme lives on one element, usually `<html>`:

  ```html
  <html data-vin-style="tactile" data-vin-mode="dark" data-vin-radius="lg" style="--vin-accent: #0d9488">
  ```

- Every component has one API spec (`spec/<name>.json`). The HTML snippets and the React component are both tested against it.

## Repository

| Path | What it is |
| --- | --- |
| `spec/` | Component API specs: the single source of truth |
| `packages/styles` | The 8 styles as data, the CSS generator, `vinui.css` |
| `packages/theme` | Theme engine: apply, save, export/import `vin-theme.json`, share links, contrast-safe accent text |
| `packages/html` | Copy-paste HTML snippets |
| `packages/react` | React components and their examples |
| `apps/docs` | The website at vinish.dev/ui (Astro) |
| `tests/visual` | Playwright screenshots + axe accessibility checks, every style × light/dark |

## Commands

Node 24 (see `.nvmrc`), npm workspaces.

```bash
npm install
npm run dev            # docs at http://localhost:4321/ui/
npm test               # unit tests for every package
npm run build          # build styles + docs into apps/docs/dist
npm run test:visual    # screenshots + axe (run npm run build first)
npm run test:visual:update   # accept intentional visual changes
```

## Deploying

vinish.dev stays on WordPress; only `vinish.dev/ui*` goes to a Cloudflare Worker (`workers/site`). The Worker serves the built site as static files and answers the remote MCP server at `/ui/mcp`.

```bash
npm run build                 # builds apps/docs/dist (the site lives in dist/ui)
cd workers/site
npx wrangler deploy           # route vinish.dev/ui* on the vinish.dev zone
```

The site is built under `/ui`, so no paths are rewritten. `npm test --prefix workers/site` checks the MCP endpoint against the built site.

### Releases

`.github/workflows/release.yml` runs on a `v*` tag (matching `packages/cli/package.json`) or by hand. It runs CI, publishes `@vinish/ui` to npm with provenance, and deploys the Worker. Repository secrets: `NPM_TOKEN`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.

### Ads

The docs pages have a right-sidebar Mediavine unit, using the same markup as the vinish.dev game pages: an `<aside class="mv-siderail-slot">` with an empty `300x600` slot inside. Mediavine fills it.

The Worker serves these pages, not WordPress, so the Mediavine plugin does not add its script. `apps/docs/src/config/ads.ts` loads the same site script the plugin uses on vinish.dev (`scriptSrc`). In `npm run dev` the slot shows a dashed 300 × 600 preview.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). The short version: a component ships only when it works in all 8 styles.

## License

MIT © vinish.dev
