import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Campaign {
  id: string;
  name: string;
  slug: string;
  createdAt: number;
}

interface CampaignStore {
  campaigns: Campaign[];
  activeCampaignId: string | null;
  addCampaign: (name: string) => Campaign;
  renameCampaign: (id: string, name: string) => void;
  deleteCampaign: (id: string) => void;
  setActiveCampaign: (id: string | null) => void;
}

function nameToSlug(name: string, id: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  // Append 4-char suffix from UUID to prevent cross-DM room collisions
  const suffix = id.replace(/-/g, '').slice(0, 4);
  return `${base}-${suffix}`;
}

export const STORE_KEY = 'dm-screen/campaigns';

export function migrateCampaignStore(
  state: unknown,
  _version: number
): { campaigns: Campaign[]; activeCampaignId: string | null } {
  return state as { campaigns: Campaign[]; activeCampaignId: string | null };
}

export const useCampaignStore = create<CampaignStore>()(
  persist(
    (set, get) => ({
      campaigns: [],
      activeCampaignId: null,

      addCampaign: (name) => {
        const id = crypto.randomUUID();
        const campaign: Campaign = { id, name, slug: nameToSlug(name, id), createdAt: Date.now() };
        set({ campaigns: [...get().campaigns, campaign] });
        return campaign;
      },

      renameCampaign: (id, name) => {
        set({
          campaigns: get().campaigns.map((c) =>
            c.id === id ? { ...c, name, slug: nameToSlug(name, id) } : c
          )
        });
      },

      deleteCampaign: (id) => {
        const next = get().campaigns.filter((c) => c.id !== id);
        const activeId = get().activeCampaignId;
        set({ campaigns: next, activeCampaignId: activeId === id ? null : activeId });
      },

      setActiveCampaign: (id) => set({ activeCampaignId: id })
    }),
    {
      name: STORE_KEY,
      version: 0,
      migrate: migrateCampaignStore
    }
  )
);
