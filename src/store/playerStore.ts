import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
    { name: 'dm-screen/player' }
  )
);
