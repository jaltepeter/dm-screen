# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start        # dev server at http://localhost:5173/
npm run build    # type-check (tsconfig.app.json) then vite build
npm test         # vitest watch mode
npm run lint     # ESLint
npm run lint:fix # ESLint --fix
npm run format   # Prettier (run before staging — pre-commit hook doesn't re-stage)
```

## What This Is

A DM (Dungeon Master) screen for tabletop RPG play. Two browser windows/tabs run simultaneously:

- **DM view** (`/`) — private screen on the DM's laptop: manage characters, initiative, images, notes
- **Player view** (`/players`) — shown on an external display: sees current initiative order, conditions, round count, and images pushed by the DM

The two views communicate via the browser's `BroadcastChannel` API. No server, no account, works offline.

## Architecture

**Two-page app** with React Router (`basename='/'`):

- `src/pages/dm-screen.tsx` — DM view shell; owns drawer/dialog open state, delegates everything else
- `src/pages/player-view.tsx` — Player view; subscribes via sync layer, renders what it receives

**State layer** (`src/store/`) — Zustand stores with `persist` middleware:

| Store           | localStorage key         | Notes                                    |
| --------------- | ------------------------ | ---------------------------------------- |
| `characterStore` | `dm-screen/characters`  | Characters with UUID ids                 |
| `imageStore`    | `dm-screen/images`       | Folders + image URLs; enforces unique URLs |
| `notesStore`    | `dm-screen/notes`        |                                          |
| `encounterStore` | `dm-screen/encounters`  | Stat blocks + named encounter templates  |
| `combatStore`   | `dm-screen/combat`       | Active initiative state; survives refresh |
| `uiStore`       | (memory only)            | `lastSentImage`, `initiativeActive`      |

**Sync layer** (`src/lib/sync.ts`) — module-level BroadcastChannel singleton:

- `sendMessage(msg)` — strips `hp`/`maxHp` before broadcast (DM-only data)
- `onMessage(handler)` — returns unsubscribe fn
- All components go through this; nothing touches BroadcastChannel directly

**Other lib**:

- `src/lib/exportImport.ts` — serializes/restores all stores as JSON
- `src/lib/useConfirmDelete.ts` — shared hook for the pending-delete pattern
- `src/lib/utils.ts` — `cn()` (clsx + tailwind-merge), `formatBonus()`

## Key Flows

**Initiative**: `InitiativeTracker` → open `InitiativeSetupDialog` (add players from store + NPCs, enter rolls, optionally load an encounter template) → `startInitiative()` sorts by roll, persists to `combatStore`, broadcasts via sync layer on every change.

**Images**: `ImageSender` (paste a URL, send ad-hoc) or `ImageGrid` (saved folder images) → `onSendImage` → `sendMessage({ cmd: 'image', payload })` → player view renders it.

**Export/Import**: Drawer → reads/writes raw localStorage keys for all stores; Zustand's `migrate` pipeline handles schema upgrades on reload.
