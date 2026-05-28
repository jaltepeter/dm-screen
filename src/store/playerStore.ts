import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const STORE_KEY = 'dm-screen/player';

interface PlayerStore {
  playerName: string;
  setPlayerName: (name: string) => void;
}

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set) => ({
      playerName: '',
      setPlayerName: (playerName) => set({ playerName })
    }),
    { name: STORE_KEY }
  )
);
