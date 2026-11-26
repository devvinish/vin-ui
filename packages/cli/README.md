# @vinish/ui

The VinUI command line tool. VinUI is a free, MIT-licensed component library in 8 styles (Precision, Tactile, Clay, Tonal, Editorial, Terminal, Paper, Bento), any accent colour, light and dark, for HTML, React, Vue and Svelte.

Docs: https://vinish.dev/ui

## Start

```bash
npx @vinish/ui init
npx @vinish/ui add button dialog
```

`init` finds your framework, asks for a style and an accent colour, and writes `vin.json` and `vin.css`. `add` copies each component (and the ones it needs) into your project, so the code is yours to change.

## Commands

| Command | What it does |
| --- | --- |
| `init` | Set up VinUI: framework, style, accent, folder. `-y` takes the defaults; `--style`, `--accent`, `--theme vin-theme.json` set them. |
| `add <names…>` | Add components or blocks (`add login-01` writes `blocks/login-01.tsx` and the components it uses). Asks before replacing a file you changed (`--overwrite` replaces). |
| `style <name>` | Switch the whole project to another style. |
| `diff [names…]` | Show how your copies differ from the latest VinUI. |
| `list` | Every component and block, and the frameworks each is available for (`--json`). |

`--registry <folder|url>` (or `VINUI_REGISTRY`) reads components from somewhere other than vinish.dev, for example a local build when you're offline.

## AI tools

Claude Code, Codex, Cursor and Copilot can run this CLI themselves. Lines to add to `CLAUDE.md` or `AGENTS.md` so they use it: https://vinish.dev/ui/docs/ai/

## License

MIT
