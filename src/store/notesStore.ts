import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NotesStore {
  notes: string;
  setNotes: (notes: string) => void;
}

export const STORE_KEY = 'dm-screen/notes';

export function migrateNotesStore(state: unknown, _version: number): { notes: string } {
  return state as { notes: string };
}

export const useNotesStore = create<NotesStore>()(
  persist(
    (set) => ({
      notes: '',
      setNotes: (notes) => set({ notes })
    }),
    {
      name: STORE_KEY,
      version: 0,
      migrate: migrateNotesStore
    }
  )
);
