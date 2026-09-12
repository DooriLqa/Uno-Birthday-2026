# Asset structure

All runtime media lives under this directory and is bundled by Vite through imports or
`import.meta.glob` declarations.

- `common/` — media reused by more than one game or feature.
- `features/` — assets owned by application features such as dialogues and the island map.
- `games/` — assets owned by a single mini-game, grouped by game id.
- `locations/` — world scenes grouped by region; obsolete scene variants live in `archive/`.

Do not add new runtime media to `src/assets` or `public`. Import it from the appropriate
folder here so production builds receive hashed URLs and dependency checks can find it.

## Game tile transparency

Always generate game tiles, collectible pickups, and standalone sprites on a genuinely
transparent RGBA canvas from the start. Never use a white, colored, scenic, or rendered
checkerboard backdrop. Before wiring a PNG into the game, verify that its alpha channel
contains both fully transparent and fully opaque pixels. A checkerboard visible in an RGB
image is a baked background and must not be accepted as transparency.
