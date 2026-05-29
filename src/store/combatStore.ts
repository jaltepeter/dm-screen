import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Actor } from '../lib/sync';

interface CombatStore {
  actors: Actor[];
  selectedIndex: number;
  round: number;
  started: boolean;
  setActors: (actors: Actor[]) => void;
  setSelectedIndex: (index: number) => void;
  setRound: (round: number) => void;
  setStarted: (started: boolean) => void;
  reset: () => void;
}

export const STORE_KEY = 'dm-screen/combat';

export function migrateCombatStore(state: unknown, version: number): unknown {
  if (version < 1) {
    (state as Record<string, unknown>).started = false;
  }
  return state;
}

export const useCombatStore = create<CombatStore>()(
  persist(
    (set) => ({
      actors: [],
      selectedIndex: 0,
      round: 1,
      started: false,
      setActors: (actors) => set({ actors }),
      setSelectedIndex: (selectedIndex) => set({ selectedIndex }),
      setRound: (round) => set({ round }),
      setStarted: (started) => set({ started }),
      reset: () => set({ actors: [], selectedIndex: 0, round: 1, started: false })
    }),
    {
      name: STORE_KEY,
      version: 1,
      migrate: migrateCombatStore
    }
  )
);
