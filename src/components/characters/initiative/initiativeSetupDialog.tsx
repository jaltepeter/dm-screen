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
import { Character } from '../../../store/characterStore';

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

  const deleteActor = (id: string) => setActors(actors.filter((a) => a.id !== id));

  const updateActor = (id: string, patch: Partial<Actor>) =>
    setActors(actors.map((a) => (a.id === id ? { ...a, ...patch } : a)));

  return (
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
                  onClick={() => deleteActor(actor.id)}>
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
  );
}
