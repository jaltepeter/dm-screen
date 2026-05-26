# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start        # dev server at http://localhost:3000/dm-screen
npm run build    # production build
npm test         # run tests (watch mode)
npm run lint     # ESLint
npm run format   # Prettier (run before staging — pre-commit hook doesn't re-stage)
```

## What This Is

A DM (Dungeon Master) screen for tabletop RPG play. Two browser windows/tabs run simultaneously:

- **DM view** (`/`) — private screen on the DM's laptop: manage characters, initiative, images
- **Player view** (`/players`) — shown on an external display: sees current initiative and images pushed by the DM

The two views communicate via the browser's `BroadcastChannel` API (`channel: 'dm-screen'`). No server, no account, works offline.

## Architecture

**Two-page app** with React Router (`basename='/dm-screen'`):

- `src/pages/dm-screen.js` — DM view shell; owns drawer/dialog open state, delegates everything else
- `src/pages/player-view.js` — Player view; listens on BroadcastChannel, renders what it receives

**State lives in two feature components**, each self-contained with their own localStorage persistence:

- `src/components/characters/characters.jsx` — owns `characters[]` array, passes it down
- `src/components/images/images.jsx` — owns `images[]` (folders + image URLs), passes it down

**localStorage** is managed via `src/data/localStorageManager.js`. Keys are in `src/enums/localStorage.js`.

**BroadcastChannel messages** sent from:

- `images.jsx` → `{ cmd: 'image', payload: { url, title } }` — sends image to player view
- `initiativeTracker.jsx` → `{ cmd: 'init_update', payload: { actors, index } }` — syncs initiative state

Both components currently create `new BroadcastChannel(...)` directly in the component body (a known bug — creates a new channel on every render).

**Initiative flow**: `InitiativeTracker` → open `InitiativeSetupDialog` (enter rolls + add monsters) → `startInitiative()` sorts by init, stores `actors[]` locally and broadcasts on every change.

## Known Issues / Planned Work

This codebase is being modernized. Current state:

- Build tool: CRA (being replaced with Vite)
- No TypeScript (being added)
- `@mui/x-data-grid` v5 with deprecated APIs (`components=`, `experimentalFeatures`, `pageSize`)
- Export/import data is implemented — exports `characters`/`images`/`notes` stores as JSON; import writes raw Zustand persist format back to localStorage and reloads (Zustand's own `migrate` pipeline handles schema upgrades on restart)
- BroadcastChannel created in render body instead of a stable ref

## Planned Stack (post-migration)

- **Vite** replacing CRA
- **TypeScript**
- **Zustand** with `persist` middleware replacing manual localStorage management
- **shadcn/ui + Tailwind** or upgraded MUI (TBD)
- **Sync abstraction layer** (`lib/sync.ts`) wrapping BroadcastChannel so the transport can be swapped later (Supabase, PartyKit, WebRTC) without touching components
