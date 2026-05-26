import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus } from 'lucide-react';
import { EncounterEntry, useEncounterStore } from '../../store/encounterStore';
import ConfirmDialog from '@/components/ui/confirmDialog';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

function nextInstanceName(entries: EncounterEntry[], baseName: string): string {
  const count = entries.filter((e) => e.instanceName.startsWith(baseName)).length;
  return `${baseName} ${count + 1}`;
}

export default function ManageEncountersDialog({ isOpen, onClose }: Props) {
  const statBlocks = useEncounterStore((s) => s.statBlocks);
  const templates = useEncounterStore((s) => s.templates);
  const addTemplate = useEncounterStore((s) => s.addTemplate);
  const editTemplate = useEncounterStore((s) => s.editTemplate);
  const deleteTemplate = useEncounterStore((s) => s.deleteTemplate);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addStatBlockId, setAddStatBlockId] = useState<string>('');
  const [pendingDeleteTemplateId, setPendingDeleteTemplateId] = useState<string | null>(null);
  const [pendingDeleteEntryId, setPendingDeleteEntryId] = useState<string | null>(null);

  const selected = templates.find((t) => t.id === selectedId) ?? null;

  const handleSelectTemplate = (id: string) => {
    setSelectedId(id);
    setAddStatBlockId('');
  };

  const handleNewTemplate = () => {
    setSelectedId(addTemplate());
  };

  const handleRenameTemplate = (name: string) => {
    if (!selected) return;
    editTemplate({ ...selected, name });
  };

  const handleAddEntry = () => {
    if (!selected || !addStatBlockId) return;
    const sb = statBlocks.find((s) => s.id === addStatBlockId);
    if (!sb) return;
    const instanceName = nextInstanceName(selected.entries, sb.name);
    editTemplate({
      ...selected,
      entries: [...selected.entries, { id: crypto.randomUUID(), statBlockId: sb.id, instanceName }]
    });
  };

  const handleDeleteEntry = (entryId: string) => {
    if (!selected) return;
    editTemplate({ ...selected, entries: selected.entries.filter((e) => e.id !== entryId) });
    setPendingDeleteEntryId(null);
  };

  const handleEditEntryName = (entryId: string, instanceName: string) => {
    if (!selected) return;
    editTemplate({
      ...selected,
      entries: selected.entries.map((e) => (e.id === entryId ? { ...e, instanceName } : e))
    });
  };

  const handleEditEntryStatBlock = (entryId: string, statBlockId: string) => {
    if (!selected) return;
    editTemplate({
      ...selected,
      entries: selected.entries.map((e) => (e.id === entryId ? { ...e, statBlockId } : e))
    });
  };

  const handleDeleteTemplate = (id: string) => {
    deleteTemplate(id);
    if (selectedId === id) setSelectedId(null);
    setPendingDeleteTemplateId(null);
  };

  const pendingDeleteTemplate = templates.find((t) => t.id === pendingDeleteTemplateId) ?? null;
  const pendingDeleteEntry = selected?.entries.find((e) => e.id === pendingDeleteEntryId) ?? null;

  return (
    <>
      <ConfirmDialog
        open={!!pendingDeleteTemplateId}
        title='Delete encounter?'
        description={
          pendingDeleteTemplate
            ? `"${pendingDeleteTemplate.name}" will be permanently deleted.`
            : undefined
        }
        onConfirm={() => pendingDeleteTemplateId && handleDeleteTemplate(pendingDeleteTemplateId)}
        onCancel={() => setPendingDeleteTemplateId(null)}
      />
      <ConfirmDialog
        open={!!pendingDeleteEntryId}
        title='Remove entry?'
        description={
          pendingDeleteEntry ? `"${pendingDeleteEntry.instanceName}" will be removed.` : undefined
        }
        onConfirm={() => pendingDeleteEntryId && handleDeleteEntry(pendingDeleteEntryId)}
        onCancel={() => setPendingDeleteEntryId(null)}
      />
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className='top-0 left-0 translate-x-0 translate-y-0 flex h-screen max-h-screen w-screen max-w-none sm:max-w-none m-0 rounded-none p-0 gap-0 flex-col'>
          <DialogHeader className='px-4 py-3 border-b shrink-0'>
            <DialogTitle>Encounters</DialogTitle>
          </DialogHeader>

          <div className='flex flex-1 min-h-0'>
            {/* Template list */}
            <div className='w-56 border-r flex flex-col shrink-0'>
              <div className='flex-1 overflow-y-auto p-2 space-y-0.5'>
                {templates.length === 0 && (
                  <p className='text-xs text-muted-foreground px-2 py-4 text-center'>
                    No encounters yet.
                  </p>
                )}
                {templates.map((t) => (
                  <div
                    key={t.id}
                    className={`flex items-center gap-1 rounded px-2 py-1.5 cursor-pointer group ${
                      selectedId === t.id ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'
                    }`}
                    onClick={() => handleSelectTemplate(t.id)}>
                    <span className='flex-1 text-sm truncate'>{t.name}</span>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-6 w-6 opacity-0 group-hover:opacity-100 shrink-0'
                      onClick={(e) => {
                        e.stopPropagation();
                        setPendingDeleteTemplateId(t.id);
                      }}>
                      <Trash2 className='h-3.5 w-3.5' />
                    </Button>
                  </div>
                ))}
              </div>
              <div className='p-2 border-t'>
                <Button variant='outline' size='sm' className='w-full' onClick={handleNewTemplate}>
                  <Plus className='h-4 w-4 mr-1' />
                  New Encounter
                </Button>
              </div>
            </div>

            {/* Editor panel */}
            <div className='flex-1 flex flex-col min-h-0 overflow-hidden'>
              {!selected ? (
                <div className='flex-1 flex items-center justify-center'>
                  <p className='text-sm text-muted-foreground'>
                    Select an encounter or create a new one.
                  </p>
                </div>
              ) : (
                <>
                  <div className='px-4 py-3 border-b shrink-0'>
                    <Input
                      value={selected.name}
                      onChange={(e) => handleRenameTemplate(e.target.value)}
                      className='h-8 text-sm font-medium max-w-sm'
                      placeholder='Encounter name'
                    />
                  </div>

                  <div className='flex-1 overflow-y-auto p-4 space-y-1'>
                    {statBlocks.length === 0 && (
                      <p className='text-sm text-muted-foreground py-4 text-center'>
                        Add stat blocks first (Stat Blocks in the menu).
                      </p>
                    )}

                    {/* Column headers */}
                    {selected.entries.length > 0 && (
                      <div className='grid grid-cols-[1fr_1fr_2rem] gap-2 px-1 text-xs text-muted-foreground mb-1'>
                        <span>Stat Block</span>
                        <span>Name</span>
                        <span />
                      </div>
                    )}

                    {selected.entries.map((entry) => {
                      const sb = statBlocks.find((s) => s.id === entry.statBlockId);
                      return (
                        <div
                          key={entry.id}
                          className='grid grid-cols-[1fr_1fr_2rem] gap-2 items-center'>
                          <select
                            value={entry.statBlockId}
                            onChange={(e) => handleEditEntryStatBlock(entry.id, e.target.value)}
                            className='h-8 rounded-md border border-input bg-background px-2 text-sm'>
                            {!sb && <option value=''>— missing —</option>}
                            {statBlocks.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                          <Input
                            value={entry.instanceName}
                            onChange={(e) => handleEditEntryName(entry.id, e.target.value)}
                            className='h-8 text-sm'
                          />
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8'
                            onClick={() => setPendingDeleteEntryId(entry.id)}>
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </div>
                      );
                    })}

                    {selected.entries.length === 0 && statBlocks.length > 0 && (
                      <p className='text-sm text-muted-foreground py-4 text-center'>
                        No monsters yet. Add one below.
                      </p>
                    )}
                  </div>

                  {/* Add entry row */}
                  {statBlocks.length > 0 && (
                    <div className='px-4 py-3 border-t shrink-0 flex gap-2 items-center'>
                      <select
                        value={addStatBlockId}
                        onChange={(e) => setAddStatBlockId(e.target.value)}
                        className='flex-1 h-8 rounded-md border border-input bg-background px-2 text-sm'>
                        <option value=''>Select stat block…</option>
                        {statBlocks.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} (HP {s.hp}
                            {s.ac != null ? `, AC ${s.ac}` : ''})
                          </option>
                        ))}
                      </select>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={handleAddEntry}
                        disabled={!addStatBlockId}>
                        <Plus className='h-4 w-4 mr-1' />
                        Add
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
