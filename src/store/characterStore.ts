import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Character {
  id: string;
  name: string;
  charClass: string;
  background: string;
  ac: number;
  pp: number;
  pi: number;
  init: number;
  sheetUrl?: string;
}

interface CharacterStore {
  characters: Character[];
  addCharacter: () => void;
  editCharacter: (character: Character) => void;
  deleteCharacter: (id: string) => void;
}

const DEFAULT_CHARACTERS: Character[] = [
  {
    id: crypto.randomUUID(),
    name: 'Bruenor',
    charClass: 'Fighter',
    background: 'Soldier',
    ac: 18,
    pp: 10,
    pi: 10,
    init: 2,
    sheetUrl: 'https://dndbeyond.com'
  },
  {
    id: crypto.randomUUID(),
    name: 'Meepo',
    charClass: 'Rogue',
    background: 'Criminal',
    ac: 14,
    pp: 15,
    pi: 13,
    init: 3,
    sheetUrl: 'https://dndbeyond.com'
  }
];

export const STORE_KEY = 'dm-screen/characters';

export function migrateCharacterStore(
  state: unknown,
  version: number
): { characters: Character[] } {
  let s = state as { characters: Character[] };
  if (version < 1) {
    // Convert numeric ids to strings to align with all other entity types.
    s = {
      ...s,
      characters: s.characters.map((c) => ({
        ...c,
        id: String((c as unknown as { id: number }).id)
      }))
    };
  }
  return s;
}

export const useCharacterStore = create<CharacterStore>()(
  persist(
    (set, get) => ({
      characters: DEFAULT_CHARACTERS,

      addCharacter: () => {
        const { characters } = get();
        set({
          characters: [
            ...characters,
            {
              id: crypto.randomUUID(),
              name: 'New Character',
              charClass: 'Fighter',
              background: 'Soldier',
              ac: 10,
              pp: 10,
              pi: 10,
              init: 10
            }
          ]
        });
      },

      editCharacter: (character) => {
        set({
          characters: get().characters.map((c) =>
            c.id === character.id ? { ...c, ...character } : c
          )
        });
      },

      deleteCharacter: (id) => {
        set({ characters: get().characters.filter((c) => c.id !== id) });
      }
    }),
    {
      name: STORE_KEY,
      version: 1,
      migrate: migrateCharacterStore
    }
  )
);
