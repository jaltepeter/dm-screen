import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Actor } from '../lib/sync';

interface CombatStore {
  actors: Actor[];
  selectedIndex: number;
  round: number;
  setActors: (actors: Actor[]) => void;
  setSelectedIndex: (index: number) => void;
  setRound: (round: number) => void;
  reset: () => void;
}

export function migrateCombatStore(state: unknown, _version: number): unknown {
  return state;
}

export const useCombatStore = create<CombatStore>()(
  persist(
    (set) => ({
      actors: [],
      selectedIndex: 0,
      round: 1,
      setActors: (actors) => set({ actors }),
      setSelectedIndex: (selectedIndex) => set({ selectedIndex }),
      setRound: (round) => set({ round }),
      reset: () => set({ actors: [], selectedIndex: 0, round: 1 })
    }),
    {
      name: 'dm-screen/combat',
      version: 0,
      migrate: migrateCombatStore
    }
  )
);
