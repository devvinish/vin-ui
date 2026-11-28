# Maintaining VinUI

How the repository is laid out, and how the website and npm package are built and released. To add or change a component, start with [CONTRIBUTING.md](CONTRIBUTING.md).

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
| `packages/cli` | `@vinish/ui`: the CLI |
| `apps/docs` | The website at vinish.dev/ui (Astro) |
| `workers/site` | Cloudflare static-assets config for the files under `vinish.dev/ui` (no Worker code) |
| `wp` | Publishing the pages to WordPress (`publish.py`) and the page ids (`state.json`) |
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

The pages are WordPress pages on vinish.dev. Cloudflare (`workers/site`) serves only the files WordPress can't: the CLI registry (`/ui/r`), the CSS and JS (`/ui/v1`, `/ui/_astro`), images and `llms.txt`, as static files with no Worker code.

```bash
npm run deploy                  # build, export for WordPress, keep earlier files, deploy the files to Cloudflare
npm run wp:export               # the WordPress pages and patterns (wp/out) plus a local preview (wp/preview)
npm run wp:check                # every element must match the tested site; axe must pass (see the file for the servers it needs)
python3 wp/publish.py draft     # create or update the pages as drafts, then: python3 wp/publish.py publish
```

The header, sidebar and footer are WordPress synced patterns (`python3 wp/publish.py patterns`), so a change to them shows on every page at once. The site and component CSS only apply inside `<div class="vinui-site">`, and the theme's styles are kept out of it.

## Releases

`.github/workflows/release.yml` runs on a `v*` tag (matching `packages/cli/package.json`) or by hand. It runs CI and publishes `@vinish/ui` to npm with provenance (secret `NPM_TOKEN`). The site is deployed with `npm run deploy`, not from CI.

The CLI downloads each style's CSS from `https://vinish.dev/ui/v1/<style>.css`, so style changes reach CLI users after a site deploy, without a new npm version.

## README image

`.github/assets/vinui-styles.png` is the landing-page demo in all 8 styles, screenshotted from the live site and tiled into one image. Retake it when a style's look changes.
