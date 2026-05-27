import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import NativeSelect from '@/components/ui/native-select';
import { Trash2, Plus } from 'lucide-react';
import { EncounterEntry, EncounterTemplate, useEncounterStore } from '../../store/encounterStore';
import DeleteConfirmDialog from '@/components/ui/delete-confirm-dialog';
import { useConfirmDelete } from '@/lib/useConfirmDelete';

function nextInstanceName(entries: EncounterEntry[], baseName: string): string {
  const count = entries.filter((e) => e.instanceName.startsWith(baseName)).length;
  return `${baseName} ${count + 1}`;
}

export default function ManageEncountersDialog() {
  const statBlocks = useEncounterStore((s) => s.statBlocks);
  const templates = useEncounterStore((s) => s.templates);
  const addTemplate = useEncounterStore((s) => s.addTemplate);
  const editTemplate = useEncounterStore((s) => s.editTemplate);
  const deleteTemplateFn = useEncounterStore((s) => s.deleteTemplate);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addStatBlockId, setAddStatBlockId] = useState<string>('');
  const deleteTemplate = useConfirmDelete<EncounterTemplate>();
  const deleteEntry = useConfirmDelete<EncounterEntry>();

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
    deleteTemplateFn(id);
    if (selectedId === id) setSelectedId(null);
  };

  return (
    <>
      <DeleteConfirmDialog
        target={deleteTemplate.target}
        title='Delete encounter?'
        getDescription={(t) => `"${t.name}" will be permanently deleted.`}
        onConfirm={(t) => handleDeleteTemplate(t.id)}
        onCancel={deleteTemplate.clearDelete}
      />
      <DeleteConfirmDialog
        target={deleteEntry.target}
        title='Remove entry?'
        getDescription={(e) => `"${e.instanceName}" will be removed.`}
        onConfirm={(e) => handleDeleteEntry(e.id)}
        onCancel={deleteEntry.clearDelete}
      />
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
                    deleteTemplate.requestDelete(t);
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
                    Add NPCs first (NPCs tab).
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
                      <NativeSelect
                        value={entry.statBlockId}
                        onChange={(e) => handleEditEntryStatBlock(entry.id, e.target.value)}>
                        {!sb && <option value=''>— missing —</option>}
                        {statBlocks.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </NativeSelect>
                      <Input
                        value={entry.instanceName}
                        onChange={(e) => handleEditEntryName(entry.id, e.target.value)}
                        className='h-8 text-sm'
                      />
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-8 w-8'
                        onClick={() => deleteEntry.requestDelete(entry)}>
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
                  <NativeSelect
                    value={addStatBlockId}
                    onChange={(e) => setAddStatBlockId(e.target.value)}
                    className='flex-1'>
                    <option value=''>Select stat block…</option>
                    {statBlocks.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (HP {s.hp}
                        {s.ac != null ? `, AC ${s.ac}` : ''})
                      </option>
                    ))}
                  </NativeSelect>
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
    </>
  );
}
