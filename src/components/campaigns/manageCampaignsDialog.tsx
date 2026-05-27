import { useState } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DeleteConfirmDialog from '@/components/ui/delete-confirm-dialog';
import { useConfirmDelete } from '@/lib/useConfirmDelete';
import { Campaign, useCampaignStore } from '../../store/campaignStore';

interface ManageCampaignsDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function ManageCampaignsDialog({ open, onClose }: ManageCampaignsDialogProps) {
  const { campaigns, addCampaign, renameCampaign, deleteCampaign } = useCampaignStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [newName, setNewName] = useState('');
  const { target: deleteTarget, requestDelete, clearDelete } = useConfirmDelete<Campaign>();

  const startRename = (c: Campaign) => {
    setEditingId(c.id);
    setDraft(c.name);
  };

  const commitRename = (id: string) => {
    if (draft.trim()) renameCampaign(id, draft.trim());
    setEditingId(null);
  };

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) return;
    addCampaign(name);
    setNewName('');
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
      <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>Campaigns</DialogTitle>
          </DialogHeader>

          <div className='space-y-1 max-h-72 overflow-y-auto'>
            {campaigns.length === 0 && (
              <p className='text-sm text-muted-foreground px-1 py-2'>No campaigns yet.</p>
            )}
            {campaigns.map((c) => (
              <div key={c.id} className='flex items-center gap-2 group'>
                {editingId === c.id ? (
                  <Input
                    autoFocus
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onBlur={() => commitRename(c.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitRename(c.id);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    className='h-8 text-sm flex-1'
                  />
                ) : (
                  <button
                    onClick={() => startRename(c)}
                    className='flex-1 text-left text-sm px-1 py-1 rounded hover:bg-muted truncate'>
                    {c.name}
                  </button>
                )}
                <span className='text-xs text-muted-foreground shrink-0 font-mono'>{c.slug}</span>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100'
                  onClick={() => requestDelete(c)}>
                  <Trash2 className='h-3.5 w-3.5' />
                </Button>
              </div>
            ))}
          </div>

          <div className='flex gap-2 pt-2 border-t'>
            <Input
              placeholder='New campaign name…'
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              className='h-8 text-sm flex-1'
            />
            <Button variant='outline' size='sm' onClick={handleAdd} disabled={!newName.trim()}>
              <Plus className='h-4 w-4 mr-1' />
              Add
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
