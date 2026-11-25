# @vinish/ui

The VinUI command line tool and MCP server. VinUI is a free, MIT-licensed component library in 8 styles (Precision, Tactile, Clay, Tonal, Editorial, Terminal, Paper, Bento), any accent colour, light and dark, for HTML, React, Vue and Svelte.

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
| `add <names…>` | Add components. Asks before replacing a file you changed (`--overwrite` replaces). |
| `style <name>` | Switch the whole project to another style. |
| `diff [names…]` | Show how your copies differ from the latest VinUI. |
| `list` | Every component and the frameworks it's available for (`--json`). |
| `mcp` | Run the MCP server for AI coding tools. |

`--registry <folder|url>` (or `VINUI_REGISTRY`) reads components from somewhere other than vinish.dev, for example a local build when you're offline.

## AI tools (MCP)

```json
{ "mcpServers": { "vinui": { "command": "npx", "args": ["-y", "@vinish/ui", "mcp"] } } }
```

Or use the hosted server, which reads and searches but doesn't write files: `https://vinish.dev/ui/mcp`.

## License

MIT
