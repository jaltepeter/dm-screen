import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Campaign {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: number;
}

interface CampaignStore {
  campaigns: Campaign[];
  activeCampaignId: string | null;
  addCampaign: (name: string) => Campaign;
  updateCampaign: (
    id: string,
    patch: Partial<Pick<Campaign, 'name' | 'slug' | 'description'>>
  ) => void;
  deleteCampaign: (id: string) => void;
  setActiveCampaign: (id: string | null) => void;
}

export function nameToSlug(name: string, id: string): string {
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
  version: number
): { campaigns: Campaign[]; activeCampaignId: string | null } {
  const s = state as { campaigns: Campaign[]; activeCampaignId: string | null };
  if (version < 1) {
    // description field added; existing campaigns have none
    s.campaigns = s.campaigns.map((c) => ({ description: undefined, ...c }));
  }
  return s;
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

      updateCampaign: (id, patch) => {
        set({
          campaigns: get().campaigns.map((c) => (c.id === id ? { ...c, ...patch } : c))
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
      version: 1,
      migrate: migrateCampaignStore
    }
  )
);
