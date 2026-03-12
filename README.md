# konva-mcp

An MCP (Model Context Protocol) server that gives AI assistants the ability to draw on a 2D canvas using [Konva.js](https://konvajs.org/), running headlessly on Node.js.

## Architecture

```
Claude ←stdio→ Python MCP (FastMCP) ←HTTP→ Node.js bridge (Express + Konva)
```

- **Python MCP server** (`server/`) — exposes 12 tools over stdio using FastMCP, proxies calls to the bridge.
- **Node.js bridge** (`bridge/`) — runs Konva.js headlessly via the `canvas` package, manages canvas state, renders PNGs.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Python](https://www.python.org/) 3.12+
- [uv](https://docs.astral.sh/uv/) (Python package manager)

## Installation

```bash
# Install Node.js bridge dependencies
cd bridge
npm install

# Python dependencies are managed automatically by uv — no manual step needed
```

## Usage

### Run as MCP server (for Claude Desktop or Claude Code)

```bash
cd server
uv run python main.py
```

The server starts the Node.js bridge as a subprocess, waits for it to be ready, then begins accepting MCP requests over stdio.

### Claude Desktop config

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "konva-canvas": {
      "command": "uv",
      "args": ["run", "--directory", "/path/to/konva-mcp/server", "python", "main.py"]
    }
  }
}
```

### Claude Code config (`.mcp.json`)

```json
{
  "mcpServers": {
    "konva-canvas": {
      "type": "stdio",
      "command": "uv",
      "args": ["run", "--directory", "/path/to/konva-mcp/server", "python", "main.py"]
    }
  }
}
```

### Run the bridge standalone (for testing)

```bash
cd bridge
node server.js
```

The bridge listens on a random free port by default (overridable via `BRIDGE_PORT` env var) and prints `BRIDGE_READY` when ready.

## Tools

| Tool | Description |
|---|---|
| `create_canvas` | Create a new canvas (Stage + default layer). Returns `canvas_id` and `layer_id`. |
| `add_layer` | Add a layer to an existing canvas. Layers render bottom-to-top. |
| `create_shape` | Draw a shape on a layer. See shape types below. |
| `update_shape` | Update position, size, color, or other attributes of a shape. |
| `delete_shape` | Permanently remove a shape. |
| `transform_shape` | Move, rotate, scale, or flip a shape. |
| `create_group` | Group multiple shapes into a single addressable unit. |
| `list_shapes` | List all shapes on a canvas, optionally filtered by layer. |
| `clear_layer` | Remove all shapes from a layer (layer itself remains). |
| `get_canvas_state` | Return the full JSON state of the canvas. |
| `preview_canvas` | Render the canvas and return it as an inline image for visual inspection. |
| `export_canvas` | Export the finished canvas as a PNG file. |

### Shape types

`rect`, `circle`, `ellipse`, `line`, `arrow`, `text`, `path`, `star`, `regular_polygon`, `wedge`, `ring`, `arc`

### Recommended workflow

1. `create_canvas` → get `canvas_id` and `layer_id`
2. Add shapes with `create_shape`
3. Call `preview_canvas` after each major section to visually inspect progress
4. Fix anything with `update_shape` or `delete_shape`
5. Call `export_canvas` when the design is complete

## Project structure

```
konva-mcp/
├── bridge/
│   ├── server.js              # Express entry point
│   └── src/
│       ├── canvasManager.js   # Canvas state (Map of canvas_id → Stage)
│       └── handlers/          # Action dispatcher and per-action handlers
└── server/
    ├── main.py                # Entry point: finds free port, starts bridge, runs MCP
    ├── pyproject.toml
    └── src/
        ├── mcp_server.py      # FastMCP tool definitions (12 tools)
        ├── bridge_client.py   # httpx async HTTP client
        └── bridge_process.py  # asyncio subprocess manager
```

## Dependencies

**Node.js bridge**
- `konva` ^10.2.0 — 2D canvas library
- `canvas` ^3.2.1 — headless Canvas API for Node.js
- `express` ^5.2.1 — HTTP server
- `nanoid` ^5 — unique ID generation

**Python MCP server**
- `fastmcp` >=3.1.0 — MCP server framework
- `httpx` >=0.28.1 — async HTTP client
