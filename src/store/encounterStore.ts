import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface StatBlock {
  id: string;
  name: string;
  size?: string;
  creatureType?: string;
  proficiencyBonus?: string;
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

  addStatBlock: (initial?: Omit<StatBlock, 'id'>) => string;
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
  return s;
}

export const useEncounterStore = create<EncounterStore>()(
  persist(
    (set, get) => ({
      statBlocks: [],
      templates: [],

      addStatBlock: (initial) => {
        const id = crypto.randomUUID();
        set({
          statBlocks: [...get().statBlocks, { name: 'New Creature', hp: 10, ...initial, id }]
        });
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
      version: 1,
      migrate: migrateEncounterStore
    }
  )
);
