# Contributing to VinUI

Thanks for helping. VinUI has one rule that everything else follows from:

## The style contract

**A component ships only when it works in all 8 styles, in light and dark, in every framework we support.**

That means:

1. **Same API everywhere.** Names, props, anatomy and sizes come from `spec/<component>.json`. Styles never add or remove props.
2. **Tokens only.** Component CSS (`packages/styles/src/components/*.css`) uses `var(--vin-*)` tokens, never raw colours, so it works in every style automatically.
3. **Style-specific touches go in `tweaks`.** If a style needs something extra (Paper's wobbly corners, Terminal's brackets), add it to that style's `tweaks[component]` in `styles.mjs`. Every style must have an entry for every component, even if it is `""`; the build fails otherwise.
4. **Every framework must match the HTML.** The React, Vue and Svelte examples render the same tags and classes as the HTML snippets. This is tested in each package.
5. **Accessible in every style.** Text meets WCAG AA (4.5:1), focus is visible, and the axe check passes for all 16 style/mode combinations.

## Adding a component

Everything is driven by `spec/<name>.json`, so a new component is just its own files:

1. `spec/<name>.json`: props, every class it uses (`classes`), React parts, examples and accessibility notes.
2. `packages/styles/src/components/<name>.css`, add `<name>` to `COMPONENTS` in `styles.mjs`, and a `tweaks.<name>` entry in all 8 styles.
3. `packages/html/src/<name>/<example>.html` for each example in the spec.
4. `packages/react/src/<name>.tsx`, export it from `src/index.ts`, and `packages/react/examples/<name>/<example>.tsx` for each example.
5. Run `npm test`, `npm run build` and `npm run test:visual:update`, then check the 16 new screenshots before committing them.

The docs page (`/ui/components/<name>/`), the test fixture, the parity tests and the visual and accessibility tests are all generated from the spec. Nothing else to edit.

## Before you open a pull request

```bash
npm test && npm run build && npm run test:visual
```

If a screenshot changed on purpose, run `npm run test:visual:update` and commit the new images with a note on why.
