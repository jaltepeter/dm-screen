import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface StatBlock {
  id: string;
  name: string;
  size?: string;
  creatureType?: string;
  proficiencyBonus?: number;
  ac?: number;
  acDesc?: string;
  hp: number;
  hitDice?: string;
  speed?: string;
  str?: number;
  dex?: number;
  con?: number;
  int?: number;
  wis?: number;
  cha?: number;
  savingThrows?: string;
  skills?: string;
  damageVulnerabilities?: string;
  damageResistances?: string;
  damageImmunities?: string;
  conditionImmunities?: string;
  senses?: string;
  languages?: string;
  sourceUrl?: string;
  body?: string;
}

export interface EncounterEntry {
  id: string;
  statBlockId: string;
  instanceName: string;
}

export interface EncounterTemplate {
  id: string;
  name: string;
  entries: EncounterEntry[];
}

interface EncounterStore {
  statBlocks: StatBlock[];
  templates: EncounterTemplate[];

  addStatBlock: (initial?: Partial<Omit<StatBlock, 'id'>>) => string;
  editStatBlock: (statBlock: StatBlock) => void;
  deleteStatBlock: (id: string) => void;

  addTemplate: () => string;
  editTemplate: (template: EncounterTemplate) => void;
  deleteTemplate: (id: string) => void;
}

export const STORE_KEY = 'dm-screen/encounters';

export function migrateEncounterStore(state: unknown, version: number): unknown {
  const s = state as Record<string, unknown>;
  if (version < 1) {
    const statBlocks = (s.statBlocks ?? []) as Record<string, unknown>[];
    s.statBlocks = statBlocks.map((sb) => {
      const migrated: Record<string, unknown> = { ...sb, hp: (sb.maxHp as number) ?? 10 };
      delete migrated.maxHp;
      delete migrated.notes;
      return migrated;
    });
  }
  if (version < 2) {
    const statBlocks = (s.statBlocks ?? []) as Record<string, unknown>[];
    s.statBlocks = statBlocks.map((sb) => {
      if (typeof sb.proficiencyBonus === 'string') {
        const n = Number(sb.proficiencyBonus);
        return { ...sb, proficiencyBonus: isNaN(n) ? undefined : n };
      }
      return sb;
    });
  }
  return s;
}

export const useEncounterStore = create<EncounterStore>()(
  persist(
    (set, get) => ({
      statBlocks: [],
      templates: [],

      addStatBlock: (initial) => {
        const id = crypto.randomUUID();
        const defaults: Omit<StatBlock, 'id'> = {
          name: 'New Creature',
          size: 'Small',
          creatureType: 'Humanoid (Goblinoid)',
          proficiencyBonus: 2,
          ac: 15,
          acDesc: 'leather armor, shield',
          hp: 7,
          hitDice: '2d6',
          speed: '30 ft.',
          str: 8,
          dex: 14,
          con: 10,
          int: 10,
          wis: 8,
          cha: 8,
          skills: 'Stealth +6',
          senses: 'Darkvision 60 ft., Passive Perception 9',
          languages: 'Common, Goblin',
          body: `## Traits\n\n***Nimble Escape.*** The goblin can take the Disengage or Hide action as a bonus action on each of its turns.\n\n## Actions\n\n***Scimitar.*** *Melee Weapon Attack:* +4 to hit, reach 5 ft., one target. *Hit:* 5 (1d6 + 2) slashing damage.\n\n***Shortbow.*** *Ranged Weapon Attack:* +4 to hit, range 80/320 ft., one target. *Hit:* 5 (1d6 + 2) piercing damage.`
        };
        set({ statBlocks: [...get().statBlocks, { ...defaults, ...initial, id }] });
        return id;
      },
      editStatBlock: (statBlock) => {
        set({ statBlocks: get().statBlocks.map((s) => (s.id === statBlock.id ? statBlock : s)) });
      },
      deleteStatBlock: (id) => {
        set({ statBlocks: get().statBlocks.filter((s) => s.id !== id) });
      },

      addTemplate: () => {
        const id = crypto.randomUUID();
        set({ templates: [...get().templates, { id, name: 'New Encounter', entries: [] }] });
        return id;
      },
      editTemplate: (template) => {
        set({
          templates: get().templates.map((t) => (t.id === template.id ? template : t))
        });
      },
      deleteTemplate: (id) => {
        set({ templates: get().templates.filter((t) => t.id !== id) });
      }
    }),
    {
      name: STORE_KEY,
      version: 2,
      migrate: migrateEncounterStore
    }
  )
);
