import { useState } from 'react';
import { Plus, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DeleteConfirmDialog from '@/components/ui/delete-confirm-dialog';
import { useConfirmDelete } from '@/lib/useConfirmDelete';
import { Character, useCharacterStore } from '../../store/characterStore';
import { useCampaignStore } from '../../store/campaignStore';
import CharacterEditDialog, { CharacterPatch } from './characterEditDialog';

export default function ManageCharactersPanel() {
  const { characters, addCharacter, editCharacter, deleteCharacter } = useCharacterStore();
  const campaigns = useCampaignStore((s) => s.campaigns);
  const activeCampaignId = useCampaignStore((s) => s.activeCampaignId);
  const { target: deleteTarget, requestDelete, clearDelete } = useConfirmDelete<Character>();
  const [editing, setEditing] = useState<Character | null | 'new'>(null);

  const handleSave = (patch: CharacterPatch) => {
    if (editing === 'new') {
      addCharacter(patch.campaignId, patch);
    } else if (editing) {
      editCharacter({ ...editing, ...patch });
    }
  };

  const groups: { label: string; chars: Character[] }[] = [
    ...campaigns
      .map((c) => ({
        label: c.name,
        chars: characters.filter((ch) => ch.campaignId === c.id)
      }))
      .filter((g) => g.chars.length > 0),
    {
      label: 'Unassigned',
      chars: characters.filter((ch) => !ch.campaignId)
    }
  ].filter((g) => g.chars.length > 0);

  return (
    <>
      <DeleteConfirmDialog
        target={deleteTarget}
        title='Delete character?'
        getDescription={(c) => `"${c.name}" will be permanently deleted.`}
        onConfirm={(c) => deleteCharacter(c.id)}
        onCancel={clearDelete}
      />

      <CharacterEditDialog
        open={editing !== null}
        character={editing === 'new' ? null : editing}
        campaigns={campaigns}
        defaultCampaignId={activeCampaignId ?? undefined}
        onClose={() => setEditing(null)}
        onSave={handleSave}
      />

      <div className='flex flex-col flex-1 min-h-0'>
        <div className='flex-1 overflow-auto p-4 space-y-6'>
          {characters.length === 0 && (
            <p className='text-sm text-muted-foreground py-2'>
              No characters yet. Add one to get started.
            </p>
          )}
          {groups.map((group) => (
            <div key={group.label}>
              <h3 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2'>
                {group.label}
              </h3>
              <div className='grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3'>
                {group.chars.map((char) => (
                  <button
                    key={char.id}
                    onClick={() => setEditing(char)}
                    className='group relative text-left rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/50'>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive'
                      onClick={(e) => {
                        e.stopPropagation();
                        requestDelete(char);
                      }}>
                      <Trash2 className='h-3.5 w-3.5' />
                    </Button>
                    <p className='font-semibold text-sm truncate pr-8'>{char.name}</p>
                    {(char.charClass || char.background) && (
                      <p className='text-xs text-muted-foreground mt-0.5 truncate'>
                        {[char.charClass, char.background].filter(Boolean).join(' · ')}
                      </p>
                    )}
                    {char.sheetUrl && (
                      <a
                        href={char.sheetUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        onClick={(e) => e.stopPropagation()}
                        className='absolute bottom-3 right-3 text-muted-foreground hover:text-foreground'>
                        <ExternalLink className='h-3 w-3' />
                      </a>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className='px-4 py-3 border-t shrink-0'>
          <Button variant='outline' size='sm' onClick={() => setEditing('new')}>
            <Plus className='h-4 w-4 mr-1' />
            Add Character
          </Button>
        </div>
      </div>
    </>
  );
}
