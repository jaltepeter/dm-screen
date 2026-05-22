import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Character {
  id: number;
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
  deleteCharacter: (id: number) => void;
}

const DEFAULT_CHARACTERS: Character[] = [
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
  },
  {
    id: 2,
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

export const useCharacterStore = create<CharacterStore>()(
  persist(
    (set, get) => ({
      characters: DEFAULT_CHARACTERS,

      addCharacter: () => {
        const { characters } = get();
        const nextId = characters.length > 0 ? Math.max(...characters.map((c) => c.id)) + 1 : 1;
        set({
          characters: [
            ...characters,
            {
              id: nextId,
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
      name: 'dm-screen/characters',
      version: 0,
      migrate: (state) => state
    }
  )
);
