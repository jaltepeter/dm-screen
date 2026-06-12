import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { StageImage } from '../lib/sync';

export const STORE_KEY = 'dm-screen/ui';

interface UiState {
  /** Images currently shown on the player view. */
  stage: StageImage[];
  initiativeActive: boolean;
  setStage: (stage: StageImage[]) => void;
  setInitiativeActive: (active: boolean) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      stage: [],
      initiativeActive: false,
      setStage: (stage) => set({ stage }),
      setInitiativeActive: (active) => set({ initiativeActive: active })
    }),
    {
      name: STORE_KEY,
      partialize: (state) => ({ stage: state.stage })
    }
  )
);
