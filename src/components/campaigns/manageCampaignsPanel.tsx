import { useState } from 'react';
import { Plus, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DeleteConfirmDialog from '@/components/ui/delete-confirm-dialog';
import { useConfirmDelete } from '@/lib/useConfirmDelete';
import { Campaign, useCampaignStore } from '../../store/campaignStore';
import { useCharacterStore } from '../../store/characterStore';
import CampaignEditDialog from './campaignEditDialog';

export default function ManageCampaignsPanel() {
  const { campaigns, activeCampaignId, addCampaign, updateCampaign, deleteCampaign } =
    useCampaignStore();
  const characters = useCharacterStore((s) => s.characters);
  const { target: deleteTarget, requestDelete, clearDelete } = useConfirmDelete<Campaign>();
  const [editing, setEditing] = useState<Campaign | null | 'new'>(null);

  const pcCount = (campaignId: string) =>
    characters.filter((c) => c.campaignId === campaignId).length;

  const handleSave = (patch: { name: string; slug: string; description?: string }) => {
    if (editing === 'new') {
      const c = addCampaign(patch.name);
      updateCampaign(c.id, { slug: patch.slug, description: patch.description });
    } else if (editing) {
      updateCampaign(editing.id, patch);
    }
  };

  return (
    <>
      <DeleteConfirmDialog
        target={deleteTarget}
        title='Delete campaign?'
        getDescription={(c) =>
          `"${c.name}" will be permanently deleted. Characters assigned to it will become unassigned.`
        }
        onConfirm={(c) => deleteCampaign(c.id)}
        onCancel={clearDelete}
      />

      <CampaignEditDialog
        open={editing !== null}
        campaign={editing === 'new' ? null : editing}
        onClose={() => setEditing(null)}
        onSave={handleSave}
      />

      <div className='flex flex-col flex-1 min-h-0'>
        <div className='flex-1 overflow-auto p-4'>
          {campaigns.length === 0 && (
            <p className='text-sm text-muted-foreground py-2'>
              No campaigns yet. Create one to get started.
            </p>
          )}
          <div className='grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3'>
            {campaigns.map((c) => (
              <button
                key={c.id}
                onClick={() => setEditing(c)}
                className={`group relative text-left rounded-lg border p-4 transition-colors hover:bg-muted/50 ${
                  activeCampaignId === c.id
                    ? 'border-amber-500/60 bg-amber-500/5'
                    : 'border-border bg-card'
                }`}>
                {activeCampaignId === c.id && (
                  <span className='absolute top-3 right-3 text-[10px] font-semibold uppercase tracking-wider text-amber-400'>
                    Active
                  </span>
                )}
                <p className='font-semibold text-sm truncate pr-12'>{c.name}</p>
                <p className='text-xs font-mono text-muted-foreground mt-0.5 truncate'>{c.slug}</p>
                {c.description && (
                  <p className='text-xs text-muted-foreground mt-2 line-clamp-2'>{c.description}</p>
                )}
                <div className='flex items-center justify-between mt-3'>
                  <span className='flex items-center gap-1 text-xs text-muted-foreground'>
                    <Users className='h-3 w-3' />
                    {pcCount(c.id)} PC{pcCount(c.id) !== 1 ? 's' : ''}
                  </span>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive'
                    onClick={(e) => {
                      e.stopPropagation();
                      requestDelete(c);
                    }}>
                    <Trash2 className='h-3.5 w-3.5' />
                  </Button>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className='px-4 py-3 border-t shrink-0'>
          <Button variant='outline' size='sm' onClick={() => setEditing('new')}>
            <Plus className='h-4 w-4 mr-1' />
            New Campaign
          </Button>
        </div>
      </div>
    </>
  );
}
