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
import { Trash2, Plus } from 'lucide-react';
import { Actor } from '../../../lib/sync';
import ConfirmDialog from '@/components/ui/confirmDialog';
import { Character } from '../../../store/characterStore';
import { useEncounterStore } from '../../../store/encounterStore';

function newPlayerActors(characters: Character[]): Actor[] {
  return characters.map((c) => ({
    id: crypto.randomUUID(),
    kind: 'player' as const,
    name: c.name,
    init: 0,
    visible: true,
    active: true,
    conditions: []
  }));
}

interface InitiativeSetupDialogProps {
  characters: Character[];
  isOpen: boolean;
  handleClose: () => void;
  onStartInitiative: (actors: Actor[]) => void;
}

export default function InitiativeSetupDialog({
  characters,
  isOpen,
  onStartInitiative,
  handleClose
}: InitiativeSetupDialogProps) {
  const [actors, setActors] = useState<Actor[]>(() => newPlayerActors(characters));
  const [loadEncounterId, setLoadEncounterId] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const encounterTemplates = useEncounterStore((s) => s.templates);
  const statBlocks = useEncounterStore((s) => s.statBlocks);

  const players = actors.filter((a) => a.kind === 'player');
  const npcs = actors.filter((a) => a.kind === 'npc');

  const handleStartInit = () => {
    const sorted = [...actors].sort((a, b) => b.init - a.init);
    onStartInitiative(sorted);
    setActors(newPlayerActors(characters));
  };

  const handleReset = () => setActors(newPlayerActors(characters));

  const addNpc = () => {
    setActors([
      ...actors,
      {
        id: crypto.randomUUID(),
        kind: 'npc',
        name: 'New NPC',
        init: 0,
        maxHp: 10,
        hp: 10,
        visible: true,
        active: true,
        conditions: []
      }
    ]);
  };

  const loadEncounter = () => {
    if (!loadEncounterId) return;
    const template = encounterTemplates.find((t) => t.id === loadEncounterId);
    if (!template) return;
    const npcActors: Actor[] = template.entries.map((entry) => {
      const sb = statBlocks.find((s) => s.id === entry.statBlockId);
      const maxHp = sb?.hp ?? 10;
      return {
        id: crypto.randomUUID(),
        kind: 'npc' as const,
        name: entry.instanceName,
        init: 0,
        maxHp,
        hp: maxHp,
        statBlockId: entry.statBlockId,
        visible: true,
        active: true,
        conditions: []
      };
    });
    setActors([...actors.filter((a) => a.kind === 'player'), ...npcActors]);
  };

  const updateActor = (id: string, patch: Partial<Actor>) =>
    setActors(actors.map((a) => (a.id === id ? { ...a, ...patch } : a)));

  const pendingDelete = actors.find((a) => a.id === pendingDeleteId) ?? null;

  return (
    <>
      <ConfirmDialog
        open={!!pendingDeleteId}
        title='Remove NPC?'
        description={
          pendingDelete ? `"${pendingDelete.name}" will be removed from the lineup.` : undefined
        }
        onConfirm={() => {
          if (pendingDeleteId) setActors(actors.filter((a) => a.id !== pendingDeleteId));
          setPendingDeleteId(null);
        }}
        onCancel={() => setPendingDeleteId(null)}
      />
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Set Up Initiative</DialogTitle>
          </DialogHeader>

          <div className='space-y-4 max-h-[60vh] overflow-y-auto'>
            {/* Players section */}
            <div className='space-y-1'>
              <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide px-1'>
                Players
              </p>
              <div className='grid grid-cols-[3rem_1fr_4rem] gap-1 px-1 text-xs text-muted-foreground mb-1'>
                <span>Init</span>
                <span>Name</span>
                <span className='text-center'>Visible</span>
              </div>
              {players.map((actor) => (
                <div key={actor.id} className='grid grid-cols-[3rem_1fr_4rem] gap-1 items-center'>
                  <Input
                    type='number'
                    value={actor.init}
                    onChange={(e) => updateActor(actor.id, { init: Number(e.target.value) })}
                    className='h-8 text-sm px-2'
                  />
                  <span className='text-sm px-2 py-1'>{actor.name}</span>
                  <div className='flex justify-center'>
                    <Switch
                      checked={actor.visible}
                      onCheckedChange={(checked) => updateActor(actor.id, { visible: checked })}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* NPCs section */}
            <div className='space-y-1'>
              <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide px-1'>
                NPCs
              </p>
              {encounterTemplates.length > 0 && (
                <div className='flex gap-2 items-center px-1 pb-1'>
                  <select
                    value={loadEncounterId}
                    onChange={(e) => setLoadEncounterId(e.target.value)}
                    className='flex-1 h-8 rounded-md border border-input bg-background px-2 text-sm'>
                    <option value=''>Load encounter…</option>
                    {encounterTemplates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={loadEncounter}
                    disabled={!loadEncounterId}>
                    Load
                  </Button>
                </div>
              )}
              {npcs.length > 0 && (
                <div className='grid grid-cols-[3rem_1fr_4rem_4rem_3rem] gap-1 px-1 text-xs text-muted-foreground mb-1'>
                  <span>Init</span>
                  <span>Name</span>
                  <span className='text-center'>Max HP</span>
                  <span className='text-center'>Visible</span>
                  <span />
                </div>
              )}
              {npcs.map((actor) => (
                <div
                  key={actor.id}
                  className='grid grid-cols-[3rem_1fr_4rem_4rem_3rem] gap-1 items-center'>
                  <Input
                    type='number'
                    value={actor.init}
                    onChange={(e) => updateActor(actor.id, { init: Number(e.target.value) })}
                    className='h-8 text-sm px-2'
                  />
                  <Input
                    value={actor.name}
                    onChange={(e) => updateActor(actor.id, { name: e.target.value })}
                    className='h-8 text-sm'
                  />
                  <Input
                    type='number'
                    value={actor.maxHp ?? 0}
                    onChange={(e) => {
                      const maxHp = Math.max(1, Number(e.target.value));
                      updateActor(actor.id, { maxHp, hp: maxHp });
                    }}
                    className='h-8 text-sm px-2'
                  />
                  <div className='flex justify-center'>
                    <Switch
                      checked={actor.visible}
                      onCheckedChange={(checked) => updateActor(actor.id, { visible: checked })}
                    />
                  </div>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8'
                    onClick={() => setPendingDeleteId(actor.id)}>
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </div>
              ))}
              <Button variant='outline' size='sm' onClick={addNpc} className='w-full'>
                <Plus className='h-4 w-4 mr-1' />
                Add NPC
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={handleReset}>
              Reset
            </Button>
            <Button onClick={handleStartInit}>Start!</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
