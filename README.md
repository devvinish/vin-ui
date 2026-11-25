# VinUI

Free, MIT-licensed UI components from [vinish.dev](https://vinish.dev/ui).
One set of components, **8 styles** (Precision, Tactile, Clay, Tonal, Editorial, Terminal, Paper, Bento), any accent colour, light and dark. HTML and React today; Vue and Svelte next.

```bash
npx @vinish/ui init
npx @vinish/ui add button
```

> Status: **Phase 1 in progress**. Ready in all 8 styles, HTML and React: Button, Button Group, Toggle, Badge, Card, Input, Textarea, Checkbox, Radio Group, Switch, Native Select, Select, Tabs, Toggle Group, Input Group, Input OTP, Slider, Avatar, Kbd, Separator, Skeleton, Spinner, Progress, Alert. Select, Tabs, Toggle, Toggle Group, Input OTP, Slider, the Alert close button and the Textarea count need `vinui.js` (one small script) in plain HTML. Roadmap: 63 components (40 in Phase 1, 23 in Phase 2 including AI chat), listed in `apps/docs/src/data/components.ts`.

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

Cloudflare Pages, connected to this repository:

- Build command: `npm run build`
- Build output directory: `apps/docs/dist`
- Environment variable: `NODE_VERSION=24`

The site is built under `/ui`, so a vinish.dev route (Worker or redirect rule) can send `vinish.dev/ui/*` to the Pages project without rewriting paths.

### Ads

The docs pages have a right-sidebar Mediavine unit, using the same markup as the vinish.dev game pages: an `<aside class="mv-siderail-slot">` with an empty `300x600` slot inside. Mediavine fills it.

These pages come from Cloudflare Pages, not WordPress, so the Mediavine plugin does not add its script. Put the site's Mediavine script URL in `apps/docs/src/config/ads.ts` (`scriptSrc`) before launch. In `npm run dev` the slot shows a dashed 300 × 600 preview.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). The short version: a component ships only when it works in all 8 styles.

## License

MIT © vinish.dev
