import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
    { name: 'dm-screen/dm-session' }
  )
);
