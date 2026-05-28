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
import { migrateCampaignStore } from '../campaignStore';
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

const v1Images = {
  folders: [
    {
      folderName: 'Goblins',
      images: [
        {
          id: 'a1b2c3d4-0000-0000-0000-000000000001',
          url: 'https://example.com/goblin.png',
          title: 'Goblin'
        }
      ]
    }
  ]
};

const v2Images = Object.freeze({
  folders: [
    {
      folderName: 'Goblins',
      displayOrder: 0,
      images: [
        {
          id: 'a1b2c3d4-0000-0000-0000-000000000001',
          url: 'https://example.com/goblin.png',
          title: 'Goblin',
          displayOrder: 0
        }
      ]
    }
  ]
});

const v0Notes = { notes: 'Session notes here.' };

const v0Combat = { actors: [], selectedIndex: 0, round: 1 };

const v1Combat = Object.freeze({ actors: [], selectedIndex: 0, round: 1, started: false });

describe('combatStore migrations', () => {
  it('v1 state is preserved', () => {
    expect(migrateCombatStore(structuredClone(v1Combat), 1), CONTRACT_BROKEN).toEqual(v1Combat);
  });

  it('v0 → v1: started added as false', () => {
    const result = migrateCombatStore(structuredClone(v0Combat), 0) as typeof v1Combat;
    expect(result.started, CONTRACT_BROKEN).toBe(false);
    expect(result.actors, CONTRACT_BROKEN).toEqual([]);
    expect(result.round, CONTRACT_BROKEN).toBe(1);
  });
});

const v1Characters = {
  characters: [
    {
      id: '1',
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

const v2Characters = {
  characters: [
    {
      id: '1',
      name: 'Bruenor',
      charClass: 'Fighter',
      background: 'Soldier',
      ac: 18,
      pp: 10,
      pi: 10,
      init: 2,
      sheetUrl: 'https://dndbeyond.com',
      campaignId: undefined
    }
  ]
};

describe('characterStore migrations', () => {
  it('v2 state is preserved', () => {
    expect(migrateCharacterStore(structuredClone(v2Characters), 2), CONTRACT_BROKEN).toEqual(
      v2Characters
    );
  });

  it('v1 → v2: campaignId added as undefined', () => {
    const result = migrateCharacterStore(structuredClone(v1Characters), 1) as typeof v2Characters;
    expect(result.characters[0].campaignId, CONTRACT_BROKEN).toBeUndefined();
    expect(result.characters[0].name, CONTRACT_BROKEN).toBe('Bruenor');
  });

  it('v0 → v1: numeric id converted to string', () => {
    const result = migrateCharacterStore(structuredClone(v0Characters), 0) as typeof v1Characters;
    expect(result.characters[0].id, CONTRACT_BROKEN).toBe('1');
    expect(result.characters[0].name, CONTRACT_BROKEN).toBe('Bruenor');
  });
});

const v0Campaigns = {
  campaigns: [{ id: 'abc', name: 'Lost Mines', slug: 'lost-mines-abc1', createdAt: 0 }],
  activeCampaignId: null
};

const v1Campaigns = {
  campaigns: [
    { id: 'abc', name: 'Lost Mines', slug: 'lost-mines-abc1', description: undefined, createdAt: 0 }
  ],
  activeCampaignId: null
};

describe('campaignStore migrations', () => {
  it('v1 state is preserved', () => {
    expect(migrateCampaignStore(structuredClone(v1Campaigns), 1), CONTRACT_BROKEN).toEqual(
      v1Campaigns
    );
  });

  it('v0 → v1: description added as undefined', () => {
    const result = migrateCampaignStore(structuredClone(v0Campaigns), 0) as typeof v1Campaigns;
    expect(result.campaigns[0].description, CONTRACT_BROKEN).toBeUndefined();
    expect(result.campaigns[0].name, CONTRACT_BROKEN).toBe('Lost Mines');
  });
});

describe('imageStore migrations', () => {
  it('v2 state is preserved', () => {
    expect(migrateImageStore(structuredClone(v2Images), 2), CONTRACT_BROKEN).toEqual(v2Images);
  });

  it('v1 → v2: displayOrder stamped from array index', () => {
    const result = migrateImageStore(structuredClone(v1Images), 1) as typeof v2Images;
    expect(result.folders[0].displayOrder, CONTRACT_BROKEN).toBe(0);
    expect(result.folders[0].images[0].displayOrder, CONTRACT_BROKEN).toBe(0);
  });

  it('v0 → v1: images get a stable id', () => {
    const result = migrateImageStore(structuredClone(v0Images), 0) as typeof v1Images;
    const image = result.folders[0].images[0];
    expect(typeof image.id, CONTRACT_BROKEN).toBe('string');
    expect(image.id.length, CONTRACT_BROKEN).toBeGreaterThan(0);
    expect(image.url, CONTRACT_BROKEN).toBe('https://example.com/goblin.png');
    expect(image.title, CONTRACT_BROKEN).toBe('Goblin');
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

// v1 with a string proficiencyBonus — the shape that existed before v2
const v1EncountersWithProfBonus = {
  statBlocks: [{ id: 'abc', name: 'Goblin', hp: 7, ac: 15, proficiencyBonus: '+2' }],
  templates: []
};

// v2: proficiencyBonus is a number
const v2Encounters = {
  statBlocks: [{ id: 'abc', name: 'Goblin', hp: 7, ac: 15, proficiencyBonus: 2 }],
  templates: []
};

describe('encounterStore migrations', () => {
  it('v2 state is preserved', () => {
    expect(migrateEncounterStore(structuredClone(v2Encounters), 2), CONTRACT_BROKEN).toEqual(
      v2Encounters
    );
  });

  it('v1 → v2: proficiencyBonus string converted to number', () => {
    const result = migrateEncounterStore(structuredClone(v1EncountersWithProfBonus), 1) as {
      statBlocks: Record<string, unknown>[];
    };
    expect(result.statBlocks[0].proficiencyBonus, CONTRACT_BROKEN).toBe(2);
  });

  it('v1 → v2: missing proficiencyBonus stays undefined', () => {
    const result = migrateEncounterStore(structuredClone(v1Encounters), 1) as {
      statBlocks: Record<string, unknown>[];
    };
    expect(result.statBlocks[0].proficiencyBonus, CONTRACT_BROKEN).toBeUndefined();
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
