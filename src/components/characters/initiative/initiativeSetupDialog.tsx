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

function newInitiative(characters: Character[]): Actor[] {
  return characters.map((c) => ({ id: c.id, name: c.name, init: 0, visible: true, active: true }));
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
  const [actors, setActors] = useState<Actor[]>(() => newInitiative(characters));

  const handleStartInit = () => {
    const sorted = [...actors].sort((a, b) => b.init - a.init);
    onStartInitiative(sorted);
    setActors(newInitiative(characters));
  };

  const handleReset = () => setActors(newInitiative(characters));

  const addActor = () => {
    const maxId = actors.length > 0 ? Math.max(...actors.map((a) => a.id)) + 1 : 1;
    setActors([...actors, { id: maxId, name: 'New Actor', init: 0, visible: true, active: true }]);
  };

  const deleteActor = (id: number) => setActors(actors.filter((a) => a.id !== id));

  const updateActor = (id: number, patch: Partial<Actor>) =>
    setActors(actors.map((a) => (a.id === id ? { ...a, ...patch } : a)));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Set Up Initiative</DialogTitle>
        </DialogHeader>

        <div className='space-y-1 max-h-80 overflow-y-auto'>
          <div className='grid grid-cols-[3rem_1fr_4rem_3rem] gap-1 px-1 text-xs text-muted-foreground mb-1'>
            <span>Init</span>
            <span>Name</span>
            <span className='text-center'>Visible</span>
            <span />
          </div>
          {actors.map((actor) => (
            <div key={actor.id} className='grid grid-cols-[3rem_1fr_4rem_3rem] gap-1 items-center'>
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
        </div>

        <Button variant='outline' size='sm' onClick={addActor} className='w-full'>
          <Plus className='h-4 w-4 mr-1' />
          Add Actor
        </Button>

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
