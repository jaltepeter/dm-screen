/**
 * Migration contract tests
 *
 * These tests enforce that every store schema change ships with a working migration.
 *
 * HOW IT WORKS
 * ------------
 * Each Zustand `persist` store has a `version` number and a `migrate` function.
 * When the app loads and finds persisted data at an older version, Zustand calls
 * `migrate(persistedState, fromVersion)` to bring it up to the current shape.
 *
 * The `migrate` functions are exported from each store file so they can be tested
 * here in isolation — no localStorage, no React, no component rendering.
 *
 * Export/import (src/lib/exportImport.ts) writes and reads the raw Zustand persist
 * format. On import it writes data back to localStorage and reloads; Zustand's
 * persist middleware then runs `migrate` automatically on startup. This means
 * import of a file created at version N will work correctly at version M > N
 * — but only if every migration between N and M is correctly implemented.
 *
 * HOW TO ADD A MIGRATION
 * ----------------------
 * When you change the shape of a store's state:
 *
 *   1. Bump `version` in the store's `persist` config (e.g. 0 → 1).
 *
 *   2. Update the exported `migrateXxxStore` function to handle every version
 *      below the new one. Pattern:
 *
 *        export function migrateCharacterStore(state: unknown, version: number) {
 *          const s = state as any;
 *          if (version < 1) {
 *            // e.g. added required field `level` in v1
 *            s.characters = (s.characters ?? []).map((c: any) => ({ level: 1, ...c }));
 *          }
 *          if (version < 2) {
 *            // next change...
 *          }
 *          return s;
 *        }
 *
 *   3. Add a frozen snapshot of what the store looked like BEFORE your change
 *      (copy the previous snapshot and name it `v{N}Xxx`).
 *
 *   4. Add a test asserting that the migrated result has the new field(s) with
 *      correct defaults. The existing "v0 state is preserved" test covers
 *      round-trip safety; your new test covers the actual transformation.
 *
 * WHY THIS CATCHES FORGOTTEN MIGRATIONS
 * --------------------------------------
 * The pre-commit hook runs `npm test -- --run`. If you bump `version` without
 * updating `migrate`, importing an old file will silently drop or corrupt data.
 * These tests make that failure visible before it reaches a saved campaign.
 */

import { describe, it, expect } from 'vitest';
import { migrateCharacterStore } from '../characterStore';
import { migrateCombatStore } from '../combatStore';
import { migrateImageStore } from '../imageStore';
import { migrateNotesStore } from '../notesStore';
import { migrateEncounterStore } from '../encounterStore';

const CONTRACT_BROKEN =
  'Migration contract broken — store shape changed without a migration. ' +
  'See the comment at the top of this file for how to add one.';

// Frozen snapshots of each store's persisted shape at each version.
// Never edit these — they represent real data that may exist in the wild.
// Add a new snapshot when you bump a version; keep all old ones.

const v0Characters = {
  characters: [
    {
      id: 1,
      name: 'Bruenor',
      charClass: 'Fighter',
      background: 'Soldier',
      ac: 18,
      pp: 10,
      pi: 10,
      init: 2,
      sheetUrl: 'https://dndbeyond.com'
    }
  ]
};

const v0Images = {
  folders: [
    {
      folderName: 'Goblins',
      images: [{ url: 'https://example.com/goblin.png', title: 'Goblin' }]
    }
  ]
};

const v0Notes = { notes: 'Session notes here.' };

const v0Combat = { actors: [], selectedIndex: 0, round: 1 };

describe('combatStore migrations', () => {
  it('v0 state is preserved', () => {
    expect(migrateCombatStore(v0Combat, 0), CONTRACT_BROKEN).toEqual(v0Combat);
  });
});

describe('characterStore migrations', () => {
  it('v0 state is preserved', () => {
    expect(migrateCharacterStore(v0Characters, 0), CONTRACT_BROKEN).toEqual(v0Characters);
  });
});

describe('imageStore migrations', () => {
  it('v0 state is preserved', () => {
    expect(migrateImageStore(v0Images, 0), CONTRACT_BROKEN).toEqual(v0Images);
  });
});

describe('notesStore migrations', () => {
  it('v0 state is preserved', () => {
    expect(migrateNotesStore(v0Notes, 0), CONTRACT_BROKEN).toEqual(v0Notes);
  });
});

// v0: original shape — maxHp + notes, no full stat block fields
const v0Encounters = {
  statBlocks: [{ id: 'abc', name: 'Goblin', maxHp: 7, ac: 15, notes: 'CR 1/4 humanoid' }],
  templates: [
    {
      id: 'xyz',
      name: 'Goblin Ambush',
      entries: [{ id: 'e1', statBlockId: 'abc', instanceName: 'Goblin 1' }]
    }
  ]
};

// v1: maxHp renamed to hp, notes dropped
const v1Encounters = {
  statBlocks: [{ id: 'abc', name: 'Goblin', hp: 7, ac: 15 }],
  templates: [
    {
      id: 'xyz',
      name: 'Goblin Ambush',
      entries: [{ id: 'e1', statBlockId: 'abc', instanceName: 'Goblin 1' }]
    }
  ]
};

describe('encounterStore migrations', () => {
  it('v1 state is preserved', () => {
    expect(migrateEncounterStore(structuredClone(v1Encounters), 1), CONTRACT_BROKEN).toEqual(
      v1Encounters
    );
  });

  it('v0 → v1: maxHp renamed to hp, notes dropped', () => {
    const result = migrateEncounterStore(structuredClone(v0Encounters), 0) as {
      statBlocks: Record<string, unknown>[];
      templates: (typeof v0Encounters)['templates'];
    };
    expect(result.statBlocks[0].hp, CONTRACT_BROKEN).toBe(7);
    expect(result.statBlocks[0].maxHp, CONTRACT_BROKEN).toBeUndefined();
    expect(result.statBlocks[0].notes, CONTRACT_BROKEN).toBeUndefined();
    expect(result.statBlocks[0].ac, CONTRACT_BROKEN).toBe(15);
    expect(result.templates, CONTRACT_BROKEN).toEqual(v0Encounters.templates);
  });
});
