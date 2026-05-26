# Development Plan

## ✅ Phase 0 — Repo cleanup

- Replace bloated CRA `.gitignore` with a clean Vite-appropriate one (remove Bower, Grunt, FuseBox, jspm etc.), add `.vite/`
- Remove `/build` entry (replaced by `/dist` which is already covered)
- Close or ignore the open Dependabot webpack PR — moot once CRA is gone

---

## ✅ Phase 1 — Foundation (Vite + TypeScript migration)

The goal is to replace the dead CRA toolchain with Vite, add TypeScript, and fix structural bugs — without changing any visible behavior.

### ✅ 1.1 New project scaffold

- Init Vite + React + TypeScript project
- Replicate existing MUI dark theme setup
- Configure path aliases, ESLint, Prettier

### ✅ 1.2 State management

- Install Zustand with `persist` middleware
- Replace all manual `localStorage.getItem/setItem` calls with two stores:
  - `useCharacterStore` — `characters[]`, add/edit/delete actions
  - `useImageStore` — `images[]` (folders + URLs), all folder/image actions
- All stores versioned from day one (`version: 0`) with a `migrate` function in place — required any time the shape of stored data changes
- Delete `src/data/localStorageManager.js` and `src/enums/localStorage.js`

### ✅ 1.3 Sync abstraction layer

- Create `src/lib/sync.ts` with a stable interface:
  - `sendMessage(msg: SyncMessage): void`
  - `onMessage(handler: (msg: SyncMessage) => void): () => void` (returns unsubscribe)
- Back it with BroadcastChannel internally
- All components send/receive through this — no component ever touches BroadcastChannel directly
- This is the seam where Supabase / PartyKit / WebRTC slots in later

### ✅ 1.4 Port components

- Convert all `.js` / `.jsx` → `.ts` / `.tsx`
- Add proper types for `Character`, `ImageFolder`, `Image`, `Actor`, `SyncMessage`
- Fix the BroadcastChannel-in-render bug (now handled by sync layer)
- Fix DataGrid v5 → v7 API changes:
  - `components=` → `slots=`
  - `experimentalFeatures={{ newEditingApi: true }}` — remove (default in v7)
  - `pageSize` / `rowsPerPageOptions` → `paginationModel`

### ✅ 1.5 Routing fix

- `/players` route currently broken (`/?/players` in App.js is wrong)
- Fix to `/players` under the `basename`

**Exit criteria:** App looks and behaves identically to today. No CRA. No JS files remaining. No manual localStorage calls.

---

## ✅ Phase 2 — UI

### ✅ 2.1 Replace MUI with shadcn/ui + Tailwind

- Install Tailwind CSS and shadcn/ui
- Replace all MUI components with shadcn/ui equivalents
- Replace DataGrid (used for character management and initiative setup) with a custom inline-edit table — simpler and purpose-built for the use case
- Remove all MUI packages, `@fontsource/roboto`, emotion

### ✅ 2.2 Design exploration

- Before building anything, explore layout and theme direction — the current design is purely functional with no visual personality
- Consider: overall layout structure, typography, color palette, DM screen aesthetic (parchment/fantasy vs. clean/modern vs. something else)
- Produce 2-3 concepts before committing to a direction

### ✅ 2.3 Layout + theme implementation

- Implement the chosen direction
- Player view: rethink from scratch — currently just initiative list + image side by side
- Make better use of the full second-monitor canvas

---

## Phase 3 — Features

### 3.1 Export / import data

- Export: serialize Zustand stores → JSON download (the `downloadJsonFile` util already exists)
- Import: JSON file picker → validate shape → load into stores
- Both wired up in the drawer (currently stubbed)

### 3.2 HP tracking

- Add `hp`, `maxHp`, `tempHp` to `Character`
- Display in character table (current/max, e.g. `18/24`)
- Inline edit from the table (click to edit, not a full dialog)

### 3.3 Monster / NPC support in combat

- Initiative setup: distinguish between player characters and monsters/NPCs
- Monsters get HP tracked during combat (current/max)
- DM can add ad-hoc monsters during setup with name, init roll, HP
- Dead monsters (HP = 0) auto-marked inactive

### 3.4 Conditions tracking

- Predefined D&D condition list (blinded, charmed, frightened, etc.)
- Apply one or more conditions to any actor in initiative
- Show condition icons/chips on that actor's row
- Conditions visible to DM only (not sent to player view)

### 3.5 Encounter templates

- DM can pre-build named encounter templates: a list of monsters/NPCs with names and HP values (no initiative rolls — those happen at the table)
- Templates are stored in Zustand and persist across sessions
- When starting initiative, DM can load a template instead of manually adding actors — template populates the setup dialog with all monsters pre-filled
- Player characters are always added automatically from the character store; templates only define the enemy side
- DM can still add, edit, or drop actors in the setup dialog after loading a template before starting

### ✅ 3.6 Notes panel

- Simple freeform markdown text area, persisted in Zustand
- Lives below the character/initiative panels on the DM view
- No player view counterpart

---

## Phase 4 — Cross-device sync (stretch)

Because Phase 1 built the sync abstraction layer, this is a transport swap, not a feature rewrite.

### 4.1 Choose transport

| Option                | Tradeoff                                                                  |
| --------------------- | ------------------------------------------------------------------------- |
| **Supabase Realtime** | Easiest, managed, requires internet                                       |
| **PartyKit**          | Designed for ephemeral real-time state, requires internet                 |
| **WebRTC**            | Peer-to-peer, works on local network without internet, more complex setup |

### 4.2 Connection UX

- DM generates a session code (or QR code)
- Player navigates to the app and enters the code (or scans QR)
- Falls back gracefully to BroadcastChannel if no code is present (same-machine mode)

### 4.3 What gets synced

- Current initiative state (same as now)
- Active image (same as now)
- Nothing else — character data and image library stay local to the DM

---

## Deferred / out of scope

- Maps, tokens, or anything VTT-adjacent
- Accounts, cloud storage, or saved sessions
- Mobile layout (the DM view is a laptop screen)
