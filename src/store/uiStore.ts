import { create } from 'zustand';

interface PlayerViewState {
  lastSentImage: { url: string; title?: string } | null;
  initiativeActive: boolean;
  setLastSentImage: (img: { url: string; title?: string } | null) => void;
  setInitiativeActive: (active: boolean) => void;
}

export const useUiStore = create<PlayerViewState>()((set) => ({
  lastSentImage: null,
  initiativeActive: false,
  setLastSentImage: (img) => set({ lastSentImage: img }),
  setInitiativeActive: (active) => set({ initiativeActive: active })
}));
