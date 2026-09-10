# Asset structure

All runtime media lives under this directory and is bundled by Vite through imports or
`import.meta.glob` declarations.

- `common/` — media reused by more than one game or feature.
- `features/` — assets owned by application features such as dialogues and the island map.
- `games/` — assets owned by a single mini-game, grouped by game id.
- `locations/` — world scenes grouped by region; obsolete scene variants live in `archive/`.

Do not add new runtime media to `src/assets` or `public`. Import it from the appropriate
folder here so production builds receive hashed URLs and dependency checks can find it.
