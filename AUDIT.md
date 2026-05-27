# Repository Audit — dm-screen

Date: 2026-05-26  
Scope: Full source audit (all 54 TypeScript/TSX files)

---

## 1. System Map

### Entry Points

```
index.html
└── src/main.tsx
    └── src/App.tsx                     # Router: /dm-screen → DmScreen, /dm-screen/players → PlayerView
        ├── src/pages/dm-screen.tsx     # DM view shell — owns modal open-state, delegates to features
        └── src/pages/player-view.tsx   # Player view — listens on BroadcastChannel, renders what it receives
```

### State Layer (`src/store/`)

| Store            | Key                    | Version | Notes                                              |
| ---------------- | ---------------------- | ------- | -------------------------------------------------- |
| `characterStore` | `dm-screen/characters` | 0       | `Character.id` is **number** (all others use UUID) |
| `imageStore`     | `dm-screen/images`     | 0       |                                                    |
| `notesStore`     | `dm-screen/notes`      | 0       |                                                    |
| `encounterStore` | `dm-screen/encounters` | 1       | Has a real v0→v1 migration (maxHp→hp)              |
| `combatStore`    | `dm-screen/combat`     | 0       | migrate is inline no-op, **not exported**          |
| `uiStore`        | (memory only)          | —       | Interface named `PlayerViewState` — misleading     |

### Communication Layer (`src/lib/`)

- **`sync.ts`** — Module-level BroadcastChannel singleton; strips `hp`/`maxHp` from `init_update` payload before broadcast
- **`exportImport.ts`** — Reads/writes raw localStorage keys; STORE_KEYS array is an independent copy of store `name` values
- **`utils.ts`** — Just `cn()` from clsx + tailwind-merge

### Component Tree

```
DmScreen (page)
├── Header (inline JSX in dm-screen.tsx)
├── DrawerContents
├── Tab: Home
│   └── Characters
│       ├── PlayerDetails
│       └── <Textarea> (notes)
├── Tab: Combat
│   └── InitiativeTracker (264 lines)
│       ├── InitiativeSetupDialog
│       ├── InitiativeEndDialog
│       └── StatBlockCard
└── Tab: Images
    └── Images
        ├── ImageSender
        └── FolderList → ImageGrid

Dialogs (always mounted, controlled by boolean state)
├── ManageCharactersDialog       ← unique: props-drilled from parent
├── ManageImagesDialog (326 lines, 4 inline sub-dialogs)
├── ManageStatBlocksDialog
│   ├── Open5eSearchDialog
│   └── StatBlockEditorPanel
└── ManageEncountersDialog
```

### Configuration

| Item                        | Current               | Latest |
| --------------------------- | --------------------- | ------ |
| Vite                        | 5.4                   | 6.x    |
| TypeScript                  | 5.9                   | 5.9 ✓  |
| vitest                      | 1.6                   | 3.x    |
| ESLint                      | 8.57 (EOL)            | 9.x    |
| Prettier                    | 2.8                   | 3.x    |
| @testing-library/react      | 13 (targets React 17) | 14/16  |
| @testing-library/user-event | 13                    | 14     |

---

## 2. Opportunities Analysis

### 2.1 Code Reuse

#### R-1 · Fullscreen master-detail dialog layout is duplicated three times

`ManageStatBlocksDialog`, `ManageEncountersDialog`, and `ManageImagesDialog` all open as full-screen dialogs with an identical layout: a `w-56` list panel on the left, an editor panel on the right, a header bar, and a footer action row. The DialogContent className is literally identical across all three:

```tsx
className='top-0 left-0 translate-x-0 translate-y-0 flex h-screen max-h-screen
           w-screen max-w-none sm:max-w-none m-0 rounded-none p-0 gap-0 flex-col'
```

**Files affected:** `manageStatBlocksDialog.tsx`, `manageEncountersDialog.tsx`, `manageImagesDialog.tsx`  
**Fix:** Extract a `<FullscreenDialog>` layout component (or extend `ConfirmDialog` pattern).

---

#### R-2 · Raw `<select>` styled identically in three places

```tsx
// All three:
className = '... h-8 rounded-md border border-input bg-background px-2 text-sm';
```

**Files affected:** `initiativeSetupDialog.tsx` (line 166), `manageEncountersDialog.tsx` (lines 198, 236)  
**Fix:** Add a `<NativeSelect>` primitive to `src/components/ui/`.

---

#### R-3 · "Pending delete + ConfirmDialog" pattern repeated 5× (7 instances)

Every manage dialog has the same shape: `pendingDeleteId` state → guard button → `ConfirmDialog`. It appears as 7 separate instances:

| Component                    | Count                                            |
| ---------------------------- | ------------------------------------------------ |
| `manageCharactersDialog.tsx` | 1                                                |
| `initiativeSetupDialog.tsx`  | 1                                                |
| `manageStatBlocksDialog.tsx` | 1                                                |
| `manageEncountersDialog.tsx` | 2 (template + entry)                             |
| `manageImagesDialog.tsx`     | 1 (image) + ConfirmDialog inline (folder delete) |

**Fix:** `useConfirmDelete<T>()` hook that returns `{ confirmTarget, requestDelete, clearDelete }` + a thin `<DeleteConfirmDialog>` wrapper.

---

#### R-4 · Image thumbnail with hover overlay duplicated

`imageGrid.tsx` and the grid inside `manageImagesDialog.tsx` (lines 153–180) are near-identical — same sizing, same `group-hover:opacity-100` overlay, same button slot. The `manageImagesDialog` version uses a delete button; `imageGrid` uses a send button.

**Files affected:** `src/components/images/imageGrid.tsx`, `src/components/images/manageImagesDialog.tsx`  
**Fix:** Extract `<ImageThumbnail action={<Button .../>}>` component.

---

#### R-5 · `SectionHeader` component defined locally, duplicated as inline heading elsewhere

`statBlockEditorPanel.tsx` defines a local `SectionHeader` component. The same pattern (a small-caps muted label) is inlined without extraction in `characters.tsx` (×2) and `images.tsx` (×2).

**Files affected:** `statBlockEditorPanel.tsx`, `characters.tsx`, `images.tsx`  
**Fix:** Move `SectionHeader` to `src/components/ui/` and import it everywhere.

---

#### R-6 · `DmScreen` prop-drills character CRUD — inconsistent with every other dialog

`ManageCharactersDialog` receives `characters`, `onAddCharacter`, `onEditCharacter`, `onDeleteCharacter` as props. Every other manage dialog (`ManageImagesDialog`, `ManageStatBlocksDialog`, `ManageEncountersDialog`) reads its own store directly. There is no reason for this inconsistency.

**Files affected:** `src/pages/dm-screen.tsx`, `src/components/characters/manageCharactersDialog.tsx`  
**Fix:** `ManageCharactersDialog` reads `useCharacterStore` directly; `DmScreen` removes 4 selector calls and 4 props.

---

### 2.2 Performance

#### ~~P-1 · Every HP ±1 click broadcasts a BroadcastChannel message~~ ✅ resolved

Resolved by the `HpCell` commit-on-idle pattern — HP changes only reach the store (and thus `sendMessage`) after 1.25s of idle.

---

#### P-1 (original, for reference) · Every HP ±1 click broadcasts a BroadcastChannel message

`initiativeTracker.tsx` fires `sendMessage` on every `actors` state change (useEffect deps: `[selectedIndex, actors]`). Clicking the HP `+` button triggers `updateHp` → `setActors` → effect fires → BroadcastChannel message. For a local-only transport this is imperceptible, but it's the wrong boundary for Phase 4 when the transport becomes network I/O.

**Files affected:** `src/components/characters/initiative/initiativeTracker.tsx` (line 30–33)  
**Fix (now):** No immediate fix needed — just document it. **Fix (Phase 4):** Debounce or batch HP changes before sync.

---

#### P-2 · `image.url` used as React key — silent dedup for duplicate URLs

`imageGrid.tsx` uses `image.url` as the list key. If the same URL is in a folder twice (user adds it manually twice), React silently drops one of the DOM nodes.

**Files affected:** `src/components/images/imageGrid.tsx` (line 14)  
**Fix:** Either enforce uniqueness in `imageStore.addImage`, or add a stable `id` field to `Image`.

---

#### P-3 · Empty `App.css` imported in `App.tsx`

`src/App.css` is a 1-line empty file. It's imported in `App.tsx`. Harmless but dead code.

**Fix:** Delete `App.css`, remove the import from `App.tsx`.

---

### 2.3 Tech Debt

#### T-1 · `combatStore.migrate` is not exported — invisible to migration contract tests

Every other store exports its `migrate` function for testing in `migrations.test.ts`. `combatStore` has `migrate: (state) => state` inline and anonymous — if the combat store schema changes and the migrate is wrong, the test suite won't catch it.

**Files affected:** `src/store/combatStore.ts`, `src/store/__tests__/migrations.test.ts`  
**Fix:** Export `migrateCombatStore`, add a v0 contract test.

---

#### T-2 · `Character.id` is `number` — inconsistent with every other entity

All actors, stat blocks, encounter templates, and entries use UUID strings. Characters use numeric IDs generated by `Math.max(...ids) + 1`. If a session has characters deleted and re-added, ID reuse is possible. More importantly, if `Character` ever needs to cross-reference `Actor` beyond name-matching, this is an impedance mismatch.

**Files affected:** `src/store/characterStore.ts`, `src/components/characters/manageCharactersDialog.tsx`  
**Fix:** Migrate to UUID string IDs. Bump store version to 1, add migration. Update `deleteCharacter(id: string)`, `EditingCell.id: string`.

---

#### T-3 · `PlayerViewState` interface in `uiStore.ts` is misleadingly named

The interface describes DM-view UI state (`lastSentImage`, `initiativeActive`), not player view state. Anyone reading the code assumes it's the player view's state slice.

**Files affected:** `src/store/uiStore.ts`  
**Fix:** Rename to `UiState`.

---

#### T-4 · `STORE_KEYS` in `exportImport.ts` duplicates store `name` values — they can drift

`exportImport.ts` defines `STORE_KEYS` as a hand-maintained `as const` array of strings. The canonical values are the `name` fields in each store's `persist` config. If a store is renamed, export/import silently breaks for that store.

```ts
// exportImport.ts — manually maintained
const STORE_KEYS = ['dm-screen/characters', 'dm-screen/images', ...];

// characterStore.ts — canonical source
persist(..., { name: 'dm-screen/characters' })
```

**Files affected:** `src/lib/exportImport.ts`, all 4 stores  
**Fix:** Export a `STORE_KEY` constant from each store, import them in `exportImport.ts`.

---

#### T-5 · `manageImagesDialog.tsx` is 326 lines with 4 inline sub-dialogs

This file manages: folder accordion list, `addImage` sub-dialog, `rename` sub-dialog, `deleteFolder` sub-dialog, `newFolder` sub-dialog — all as local `SubDialog` state and local form state. Each sub-dialog is small enough to extract into its own file.

**Files affected:** `src/components/images/manageImagesDialog.tsx`  
**Fix:** Extract `AddImageDialog`, `RenameFolderDialog`, `NewFolderDialog` as small standalone dialog components.

---

#### T-6 · `initiativeTracker.tsx` inline HP editor is complex enough to extract

The HP editing inline input (lines 170–198) manages its own `editingHpId` state, a ref, keyboard handling (Enter/Escape), and double-click-to-edit. At 264 lines total, this component is doing too much.

**Files affected:** `src/components/characters/initiative/initiativeTracker.tsx`  
**Fix:** Extract `<HpCell actor={actor} onUpdate={updateHp} />`.

---

#### T-7 · Testing infrastructure is installed but can't run component tests

`vitest.config` sets `environment: 'node'`. `@testing-library/react` v13 and `@testing-library/jest-dom` v5 are installed but non-functional in a node environment. Currently the only test file tests pure functions — which works — but the testing setup implies component tests are intended and they'd fail silently (or not run).

Additionally, `@testing-library/react` v13 targets React 17. React 18 users should use v14+. `@testing-library/user-event` v13 has a different API from v14.

**Files affected:** `vite.config.ts`, `package.json`  
**Fix:** Set `environment: 'happy-dom'` in vitest config; upgrade `@testing-library/react` to v14 and `user-event` to v14.

---

#### T-8 · `fmtBonus` helper defined inline in `open5eSearchDialog.tsx`

Not exported, not shared. Used in 3 local helper functions within the file. Could live in `lib/utils.ts`.

**Files affected:** `src/components/encounters/open5eSearchDialog.tsx`  
**Fix:** Move to `src/lib/utils.ts`, export as `formatBonus`.

---

#### T-9 · Dependency rot

| Package                     | Current | Issue                                    |
| --------------------------- | ------- | ---------------------------------------- |
| ESLint                      | 8.57    | EOL; v9 uses flat config                 |
| Prettier                    | 2.8     | v3 has breaking changes but is current   |
| vitest                      | 1.6     | v3 is current; v1 is EOL                 |
| vite                        | 5.4     | v6 is current                            |
| @testing-library/react      | 13      | Targets React 17; use v14+ with React 18 |
| @testing-library/user-event | 13      | v14 has new API; v13 is EOL              |

These are deferred from Phase 1 migration intentionally. They are non-urgent but represent compounding risk as the package ecosystem moves on.

---

## 3. Execution Plan

### ~~Phase A — Housekeeping~~ ✅

**Goal:** Fix naming mistakes, missing test coverage, dead code, and the one prop-drilling inconsistency. Every change here can be verified by running `npm test -- --run` and doing a visual smoke-test of both views.

| #          | Task                                                                      | Files to modify                               | Verify                                           |
| ---------- | ------------------------------------------------------------------------- | --------------------------------------------- | ------------------------------------------------ |
| ~~A-1~~ ✅ | Rename `PlayerViewState` → `UiState` in `uiStore.ts`                      | `uiStore.ts`                                  | `npm run lint` passes                            |
| ~~A-2~~ ✅ | Export `migrateCombatStore`, add v0 contract test                         | `combatStore.ts`, `migrations.test.ts`        | `npm test -- --run`                              |
| ~~A-3~~ ✅ | Delete `App.css`, remove import                                           | `App.css`, `App.tsx`                          | App loads without errors                         |
| ~~A-4~~ ✅ | `ManageCharactersDialog` reads its own store                              | `manageCharactersDialog.tsx`, `dm-screen.tsx` | Characters tab renders, add/edit/delete all work |
| ~~A-5~~ ✅ | Configure vitest `environment: 'happy-dom'`, upgrade testing-library      | `vite.config.ts`, `package.json`              | `npm test -- --run` still passes                 |
| ~~A-6~~ ✅ | Export `STORE_KEY` constants from each store, import in `exportImport.ts` | 4 store files, `exportImport.ts`              | Export/import round-trip works                   |

---

### ~~Phase B — Component extraction~~ ✅

**Goal:** Extract repeated UI patterns into shared primitives so future changes are one-place edits. Each extraction is a pure refactor — no logic changes.

| #          | Task                                                              | Files to modify                                                                         | Verify                                  |
| ---------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------- |
| ~~B-1~~ ✅ | Extract `<SectionHeader>` to `src/components/ui/`                 | `statBlockEditorPanel.tsx`, `characters.tsx`, `images.tsx`, new `ui/section-header.tsx` | Visual — headings still appear          |
| ~~B-2~~ ✅ | Add `<NativeSelect>` to `src/components/ui/`                      | New `ui/native-select.tsx`; `initiativeSetupDialog.tsx`, `manageEncountersDialog.tsx`   | Dropdowns still work                    |
| ~~B-3~~ ✅ | Extract `<ImageThumbnail>`                                        | New `images/image-thumbnail.tsx`; `imageGrid.tsx`, `manageImagesDialog.tsx`             | Image hover overlay works in both views |
| ~~B-4~~ ✅ | ~~Extract `<HpCell>` from `initiativeTracker.tsx`~~               | Done — includes delta badge + hold-to-repeat                                            |                                         |
| ~~B-5~~ ✅ | Extract `AddImageDialog`, `RenameFolderDialog`, `NewFolderDialog` | `manageImagesDialog.tsx` split into 5 files; new `ui/simple-dialog.tsx` shell           | All image folder operations still work  |

---

### ~~Phase C — Pattern consolidation~~ ✅

**Goal:** Centralize the two patterns that have the most duplicated state management logic.

| #          | Task                                                   | Files to modify                                                                      | Verify                                        |
| ---------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------ | --------------------------------------------- |
| ~~C-1~~ ✅ | `useConfirmDelete<T>()` hook + `<DeleteConfirmDialog>` | New `lib/useConfirmDelete.ts`, 5 dialog components                                   | Delete flows work in all affected dialogs     |
| ~~C-2~~ ✅ | `<FullscreenDialog>` layout wrapper                    | New `ui/fullscreen-dialog.tsx`; all 4 fullscreen dialogs (ManageCharacters included) | Fullscreen dialogs still open/close correctly |

---

### ~~Phase D — Data integrity improvements~~ ✅

**Goal:** Fix the one correctness issue and the ID type inconsistency before they cause real problems.

| #          | Task                                                                                        | Files to modify                                                                                     | Verify                                                           |
| ---------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| ~~D-1~~ ✅ | Enforce unique URLs in `imageStore.addImage`; use stable image ID as key in `imageGrid.tsx` | `imageStore.ts`, `imageGrid.tsx`, `add-image-dialog.tsx`                                            | Adding duplicate URL shows inline error; images have stable IDs  |
| ~~D-2~~ ✅ | Migrate `Character.id` from `number` to `string` (UUID)                                     | `characterStore.ts` (bump to v1, add migration), `manageCharactersDialog.tsx`, `migrations.test.ts` | All existing character data survives; add/edit/delete still work |
| ~~D-3~~ ✅ | Move `fmtBonus` to `lib/utils.ts` as `formatBonus`                                          | `open5eSearchDialog.tsx`, `utils.ts`                                                                | Open5e search still maps bonus values correctly                  |

---

### ~~Phase E — Toolchain upgrades~~ ✅

**Goal:** Get off EOL packages. This phase is the riskiest — ESLint v9 and Prettier v3 both have breaking config changes.

| #          | Task                                                               | Verify                                        |
| ---------- | ------------------------------------------------------------------ | --------------------------------------------- |
| ~~E-1~~ ✅ | Upgrade ESLint 8 → 9, migrate to flat config (`eslint.config.js`) | `npm run lint` passes                         |
| ~~E-2~~ ✅ | Upgrade Prettier 2 → 3                                             | `npm run format`, check no unexpected changes |
| ~~E-3~~ ✅ | Upgrade vitest 1 → 3                                               | `npm test -- --run`                           |
| ~~E-4~~ ✅ | Upgrade vite 5 → 6                                                 | `npm run build` succeeds, dev server starts   |
| ~~E-5~~ ✅ | Upgrade @testing-library packages                                  | Existing tests still pass                     |

---

### Phase F — Next planned feature (per PLAN.md §3.4)

**Goal:** Implement Conditions tracking — the only remaining Phase 3 item not marked complete.

**Scope (per plan):**

- Predefined D&D condition list (blinded, charmed, frightened, etc.)
- Apply one or more conditions to any actor in the initiative tracker
- Show condition chips on the actor's row (DM view only — not synced to player view)
- `Actor.conditions[]` is already on the type and persisted; the UI is the missing piece

**Files to modify:** `initiativeTracker.tsx`, possibly a new `ConditionPicker` component, `sync.ts` (conditions should be excluded from broadcast, similar to hp/maxHp)

---

## Summary Priority Order

```
A (quick fixes)    → commit individually, low risk
B (extractions)    → per-extraction PRs, all pure refactors
C (consolidation)  → two PRs (hook + layout), medium complexity
D (data integrity) → D-1 and D-3 are trivial; D-2 requires a migration
E (toolchain)      → one branch, tackle last, needs time for breakage
F (feature)        → after Phase E is clean
```
