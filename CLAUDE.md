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

A DM (Dungeon Master) screen for tabletop RPG play. Three pages run across two windows/tabs:

- **DM view** (`/`) — private screen on the DM's laptop: manage characters, initiative, images, notes
- **Player view** (`/players/:slug`) — shown on an external display: current initiative order, conditions, round count, and images pushed by the DM
- **Prep mode** (`/prep`) — full-screen data management for campaigns, characters, stat blocks, encounters, and images

The DM and player views communicate via **PartyKit WebSockets** (`src/lib/sync.ts`). A PartyKit server must be running/deployed for live mode; the DM view works fully offline without one.

## Architecture

**Three-page app** with React Router (`basename='/'`):

- `src/pages/dm-screen.tsx` — DM view shell; owns tab state and the header image/initiative indicators
- `src/pages/player-view.tsx` — Player view; connects to PartyKit as `'player'` role, renders what it receives
- `src/pages/prep-screen.tsx` — Prep mode; URL-param-driven tabs (`?tab=...`), no live sync

**State layer** (`src/store/`) — Zustand stores with `persist` middleware:

| Store            | localStorage key                    | Backed up by export? | Notes                                                                                                  |
| ---------------- | ----------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------ |
| `campaignStore`  | `dm-screen/campaigns`               | ✅                   | Campaigns with UUID ids + active campaign pointer                                                      |
| `characterStore` | `dm-screen/characters`              | ✅                   | Player characters with UUID ids; `campaignId` for filtering                                            |
| `imageStore`     | `dm-screen/images`                  | ✅                   | Folders + image URLs; enforces unique URLs per folder                                                  |
| `notesStore`     | `dm-screen/notes`                   | ✅                   | Single freeform notes string                                                                           |
| `encounterStore` | `dm-screen/encounters`              | ✅                   | Stat blocks + named encounter templates                                                                |
| `combatStore`    | `dm-screen/combat`                  | ❌ ephemeral         | Active initiative state; `started` flag separates loaded vs running; survives page refresh, not export |
| `dmSessionStore` | `dm-screen/dm-session`              | ❌ ephemeral         | `wantLive` flag (persist intent to reconnect after refresh)                                            |
| `playerStore`    | `dm-screen/player`                  | ❌ per-browser       | Player's display name; set once on the player view                                                     |
| `uiStore`        | `dm-screen/ui` (lastSentImage only) | ❌ ephemeral         | `lastSentImage` persisted via `partialize`; `initiativeActive` is memory-only                          |

Each store that participates in export/import exports `STORE_KEY` and a `migrateXxxStore` function. The migration functions are tested in `src/store/__tests__/migrations.test.ts` — when you add a store version bump, add a frozen snapshot and a test there too.

**Sync layer** (`src/lib/sync.ts`) — module-level PartySocket singleton:

- `connect(slug, role, name?)` — opens a WebSocket to the PartyKit room for the given campaign slug
- `disconnect()` — closes the socket
- `sendMessage(msg)` — sends a typed `SyncMessage`; note: `hp`/`maxHp` are intentionally NOT stripped here (the server-side handles visibility)
- `onMessage(handler)` — returns unsubscribe fn
- `onConnectionChange(handler)` — fires `true`/`false` on connect/disconnect
- All components go through these functions; nothing imports PartySocket directly

**Other lib**:

- `src/lib/exportImport.ts` — serializes/restores the 5 backed-up stores as JSON; deliberately excludes the 4 ephemeral stores (see table above)
- `src/lib/useConfirmDelete.ts` — shared hook for the pending-delete pattern used across all Manage\* panels
- `src/lib/utils.ts` — `cn()` (clsx + tailwind-merge), `formatBonus()`, `randomNpcName()`, `rollInitiative(dexMod?)`, `dexModifier(dex)`

## Key Flows

**Initiative**: Three-phase flow — **Load** → **Start** → **End**. `InitiativeTracker` → open `InitiativeSetupDialog` (seeds players from active campaign, lets DM add NPCs with auto-rolled initiative, optionally apply an encounter template) → "Load" sorts actors into `combatStore` with `started: false`. In loaded state the DM can edit initiatives inline, add/delete actors, and wait for PC rolls (zero-init cells are amber). "Start" re-sorts and sets `started: true`, which begins turn tracking and starts syncing to players. Mid-combat, "+" opens `AddCombatantDialog` (searchable stat-block picker, auto-rolled init); new combatants drop to the end of the order. NPC HP → 0 marks them inactive; HP > 0 re-activates.

**Images**: `ImageSender` (paste a URL, send ad-hoc) or `ImageGrid` (saved folder images) → `onSendImage` → `sendMessage({ cmd: 'image', payload })` → player view renders it full-screen.

**Export/Import**: Header dropdown → `exportData()` writes the 5 backed-up stores to a dated JSON file; `importData(file)` restores them to localStorage and reloads the page so Zustand's `migrate` pipeline runs on the new data.

**Campaigns**: Each campaign has a `slug` (URL-safe name + 4-char UUID suffix) that becomes the PartyKit room name. `GoLiveButton` connects as `'dm'` role; players connect via `/players/:slug`. Changing a campaign's slug changes the room — share the new URL with players.

**Notes**: `characters.tsx` renders notes in two modes. Read mode renders the raw string via `react-markdown`; double-click (or Esc/blur from edit mode) transitions between them. Save is explicit — Save button, blur, or Esc — no debounce autosave. The store still holds a plain string; markdown is display-only.
