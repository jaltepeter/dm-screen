import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const STORE_KEY = 'dm-screen/dm-session';

interface DmSessionStore {
  wantLive: boolean;
  setWantLive: (want: boolean) => void;
}

export const useDmSessionStore = create<DmSessionStore>()(
  persist(
    (set) => ({
      wantLive: true,
      setWantLive: (wantLive) => set({ wantLive })
    }),
    { name: STORE_KEY }
  )
);
