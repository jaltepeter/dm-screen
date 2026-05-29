import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { ChevronsUpDown, Check } from 'lucide-react';
import { Actor } from '../../../lib/sync';
import { useEncounterStore } from '../../../store/encounterStore';
import { cn, randomNpcName, rollInitiative, dexModifier } from '@/lib/utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (actors: Actor[]) => void;
}

function freshDraft() {
  return {
    name: randomNpcName(),
    init: rollInitiative(),
    maxHp: 10,
    hp: 10,
    visible: true,
    statBlockId: undefined as string | undefined
  };
}

export default function AddCombatantDialog({ isOpen, onClose, onAdd }: Props) {
  const [draft, setDraft] = useState(freshDraft);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState('');
  const statBlocks = useEncounterStore((s) => s.statBlocks);

  const filtered = statBlocks.filter((sb) => sb.name.toLowerCase().includes(search.toLowerCase()));

  const selectedBlock = statBlocks.find((sb) => sb.id === draft.statBlockId);

  const pickStatBlock = (id: string) => {
    const sb = statBlocks.find((s) => s.id === id);
    if (!sb) return;
    const init = rollInitiative(sb.dex !== undefined ? dexModifier(sb.dex) : 0);
    setDraft((d) => ({ ...d, name: sb.name, init, maxHp: sb.hp, hp: sb.hp, statBlockId: sb.id }));
    setSearch('');
    setPickerOpen(false);
  };

  const clearStatBlock = () => {
    setDraft((d) => ({ ...d, statBlockId: undefined }));
    setPickerOpen(false);
  };

  const handleAdd = () => {
    onAdd([
      {
        id: crypto.randomUUID(),
        kind: 'npc',
        active: true,
        conditions: [],
        name: draft.name,
        init: draft.init,
        maxHp: draft.maxHp,
        hp: draft.hp,
        visible: draft.visible,
        ...(draft.statBlockId ? { statBlockId: draft.statBlockId } : {})
      }
    ]);
    setDraft(freshDraft);
    onClose();
  };

  const handleClose = () => {
    setDraft(freshDraft);
    setSearch('');
    setPickerOpen(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className='max-w-xs'>
        <DialogHeader>
          <DialogTitle>Add Combatant</DialogTitle>
        </DialogHeader>

        <div className='space-y-3'>
          {statBlocks.length > 0 && (
            <div className='grid grid-cols-[3.5rem_1fr] gap-2 items-start'>
              <label className='text-xs text-muted-foreground mt-2'>NPC</label>
              <div className='relative'>
                <Button
                  variant='outline'
                  size='sm'
                  className='h-8 w-full justify-between font-normal text-sm'
                  onClick={() => setPickerOpen((o) => !o)}>
                  <span className='truncate'>
                    {selectedBlock ? selectedBlock.name : 'Pick stat block…'}
                  </span>
                  <ChevronsUpDown className='h-3.5 w-3.5 shrink-0 opacity-50 ml-1' />
                </Button>
                {pickerOpen && (
                  <>
                    <div className='fixed inset-0 z-9' onClick={() => setPickerOpen(false)} />
                    <div className='absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-md'>
                      <div className='p-2 border-b'>
                        <Input
                          placeholder='Search…'
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className='h-7 text-sm'
                          autoFocus
                        />
                      </div>
                      <div className='max-h-48 overflow-y-auto'>
                        {filtered.length === 0 ? (
                          <p className='py-3 text-center text-xs text-muted-foreground'>
                            No results
                          </p>
                        ) : (
                          filtered.map((sb) => (
                            <button
                              key={sb.id}
                              className={cn(
                                'flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent cursor-pointer text-left',
                                draft.statBlockId === sb.id && 'bg-accent'
                              )}
                              onClick={() => pickStatBlock(sb.id)}>
                              <Check
                                className={cn(
                                  'h-3.5 w-3.5 shrink-0',
                                  draft.statBlockId === sb.id ? 'opacity-100' : 'opacity-0'
                                )}
                              />
                              {sb.name}
                            </button>
                          ))
                        )}
                      </div>
                      {selectedBlock && (
                        <div className='border-t p-2'>
                          <button
                            className='w-full text-xs text-muted-foreground hover:text-foreground text-left px-1'
                            onClick={clearStatBlock}>
                            Clear selection
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          <div className='grid grid-cols-[3.5rem_1fr] gap-2 items-center'>
            <label className='text-xs text-muted-foreground'>Init</label>
            <Input
              type='number'
              value={draft.init}
              onChange={(e) => setDraft((d) => ({ ...d, init: Number(e.target.value) }))}
              onFocus={(e) => e.target.select()}
              className='h-8 text-sm px-2'
              autoFocus={statBlocks.length === 0}
            />
          </div>
          <div className='grid grid-cols-[3.5rem_1fr] gap-2 items-center'>
            <label className='text-xs text-muted-foreground'>Name</label>
            <Input
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              className='h-8 text-sm'
            />
          </div>
          <div className='grid grid-cols-[3.5rem_1fr] gap-2 items-center'>
            <label className='text-xs text-muted-foreground'>Max HP</label>
            <Input
              type='number'
              value={draft.maxHp}
              onChange={(e) => {
                const v = Math.max(1, Number(e.target.value));
                setDraft((d) => ({ ...d, maxHp: v, hp: v }));
              }}
              onFocus={(e) => e.target.select()}
              className='h-8 text-sm px-2'
            />
          </div>
          <div className='grid grid-cols-[3.5rem_1fr] gap-2 items-center'>
            <label className='text-xs text-muted-foreground'>Visible</label>
            <Switch
              checked={draft.visible}
              onCheckedChange={(checked) => setDraft((d) => ({ ...d, visible: checked }))}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!draft.name.trim()}>
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
