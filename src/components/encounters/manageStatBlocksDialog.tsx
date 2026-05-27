import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Search } from 'lucide-react';
import { StatBlock, useEncounterStore } from '../../store/encounterStore';
import Open5eSearchDialog from './open5eSearchDialog';
import StatBlockEditorPanel from './statBlockEditorPanel';
import DeleteConfirmDialog from '@/components/ui/delete-confirm-dialog';
import { useConfirmDelete } from '@/lib/useConfirmDelete';

export default function ManageStatBlocksDialog() {
  const statBlocks = useEncounterStore((s) => s.statBlocks);
  const addStatBlock = useEncounterStore((s) => s.addStatBlock);
  const editStatBlock = useEncounterStore((s) => s.editStatBlock);
  const deleteStatBlock = useEncounterStore((s) => s.deleteStatBlock);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { target: deleteTarget, requestDelete, clearDelete } = useConfirmDelete<StatBlock>();

  const selected = statBlocks.find((s) => s.id === selectedId) ?? null;

  const handleImport = (partial: Omit<StatBlock, 'id'>) => {
    setSelectedId(addStatBlock(partial));
  };

  const handleAddManual = () => {
    setSelectedId(addStatBlock());
  };

  const handleDelete = (id: string) => {
    deleteStatBlock(id);
    if (selectedId === id) setSelectedId(null);
  };

  return (
    <>
      <DeleteConfirmDialog
        target={deleteTarget}
        title='Delete stat block?'
        getDescription={(sb) => `"${sb.name}" will be permanently deleted.`}
        onConfirm={(sb) => handleDelete(sb.id)}
        onCancel={clearDelete}
      />
      <Open5eSearchDialog
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelect={handleImport}
      />
      <div className='flex flex-1 min-h-0'>
        {/* List panel */}
        <div className='w-56 border-r flex flex-col shrink-0'>
          <div className='flex-1 overflow-y-auto p-2 space-y-0.5'>
            {statBlocks.length === 0 && (
              <p className='text-xs text-muted-foreground px-2 py-4 text-center'>
                No stat blocks yet.
              </p>
            )}
            {statBlocks.map((sb) => (
              <div
                key={sb.id}
                className={`flex items-center gap-1 rounded px-2 py-1.5 cursor-pointer group ${
                  selectedId === sb.id ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'
                }`}
                onClick={() => setSelectedId(sb.id)}>
                <span className='flex-1 min-w-0'>
                  <span className='block text-sm truncate'>{sb.name}</span>
                  {sb.creatureType && (
                    <span className='block text-xs text-muted-foreground truncate'>
                      {[sb.size, sb.creatureType].filter(Boolean).join(' ')}
                    </span>
                  )}
                </span>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-6 w-6 opacity-0 group-hover:opacity-100 shrink-0'
                  onClick={(e) => {
                    e.stopPropagation();
                    requestDelete(sb);
                  }}>
                  <Trash2 className='h-3.5 w-3.5' />
                </Button>
              </div>
            ))}
          </div>
          <div className='p-2 border-t space-y-1'>
            <Button
              variant='outline'
              size='sm'
              className='w-full'
              onClick={() => setIsSearchOpen(true)}>
              <Search className='h-4 w-4 mr-1' />
              Add from Open5e
            </Button>
            <Button variant='outline' size='sm' className='w-full' onClick={handleAddManual}>
              <Plus className='h-4 w-4 mr-1' />
              Add Manually
            </Button>
          </div>
        </div>

        {/* Editor panel */}
        <div className='flex-1 min-h-0 overflow-hidden'>
          {!selected ? (
            <div className='flex h-full items-center justify-center'>
              <p className='text-sm text-muted-foreground'>Select a stat block or add a new one.</p>
            </div>
          ) : (
            <StatBlockEditorPanel
              statBlock={selected}
              onChange={(updated) => editStatBlock(updated)}
            />
          )}
        </div>
      </div>
    </>
  );
}
