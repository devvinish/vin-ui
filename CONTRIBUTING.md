# Contributing to VinUI

Thanks for helping. VinUI has one rule that everything else follows from:

## The style contract

**A component ships only when it works in all 8 styles, in light and dark, in every framework we support.**

That means:

1. **Same API everywhere.** Names, props, anatomy and sizes come from `spec/<component>.json`. Styles never add or remove props.
2. **Tokens only.** Component CSS (`packages/styles/src/components/*.css`) uses `var(--vin-*)` tokens, never raw colours, so it works in every style automatically.
3. **Style-specific touches go in `tweaks`.** If a style needs something extra (Paper's wobbly corners, Terminal's brackets), add it to that style's `tweaks[component]` in `styles.mjs`. Every style must have an entry for every component, even if it is `""`; the build fails otherwise.
4. **HTML and React must match.** The React examples render the same tags and classes as the HTML snippets. This is tested.
5. **Accessible in every style.** Text meets WCAG AA (4.5:1), focus is visible, and the axe check passes for all 16 style/mode combinations.

## Adding a component

1. Write `spec/<name>.json`.
2. Add `packages/styles/src/components/<name>.css` and a `tweaks.<name>` entry in all 8 styles.
3. Add HTML snippets in `packages/html/src/<name>/` and the React component + examples in `packages/react`.
4. Add a fixture page in `apps/docs/src/pages/fixtures/` and a spec in `tests/visual/`.
5. Add the docs page and set `ready: true` in `apps/docs/src/data/components.ts`.
6. Run `npm test`, `npm run build` and `npm run test:visual`. Check the screenshots for all 16 combinations before committing them.

## Before you open a pull request

```bash
npm test && npm run build && npm run test:visual
```

If a screenshot changed on purpose, run `npm run test:visual:update` and commit the new images with a note on why.
