import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const STORE_KEY = 'dm-screen/ui';

interface UiState {
  lastSentImage: { url: string; title?: string } | null;
  initiativeActive: boolean;
  setLastSentImage: (img: { url: string; title?: string } | null) => void;
  setInitiativeActive: (active: boolean) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      lastSentImage: null,
      initiativeActive: false,
      setLastSentImage: (img) => set({ lastSentImage: img }),
      setInitiativeActive: (active) => set({ initiativeActive: active })
    }),
    {
      name: STORE_KEY,
      partialize: (state) => ({ lastSentImage: state.lastSentImage })
    }
  )
);
