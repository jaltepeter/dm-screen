import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { SkipBack, SkipForward, Sword, Swords } from 'lucide-react';
import InitiativeEndDialog from './initiativeEndDialog';
import InitiativeSetupDialog from './initiativeSetupDialog';
import { Actor, sendMessage } from '../../../lib/sync';
import { Character } from '../../../store/characterStore';
import { useUiStore } from '../../../store/uiStore';

interface InitiativeTrackerProps {
  characters: Character[];
}

export default function InitiativeTracker({ characters }: InitiativeTrackerProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [actors, setActors] = useState<Actor[]>([]);
  const [setupOpen, setSetupOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);
  const setInitiativeActive = useUiStore((s) => s.setInitiativeActive);

  useEffect(() => {
    sendMessage({ cmd: 'init_update', payload: { actors, index: selectedIndex } });
  }, [selectedIndex, actors]);

  useEffect(() => {
    setInitiativeActive(actors.length > 0);
  }, [actors.length, setInitiativeActive]);

  const nextTurn = () => {
    for (let i = selectedIndex + 1; i < actors.length + selectedIndex + 1; i++) {
      if (actors[i % actors.length].active) {
        setSelectedIndex(i % actors.length);
        break;
      }
    }
  };

  const prevTurn = () => {
    for (let i = 1; i <= actors.length; i++) {
      const index = (selectedIndex - i + actors.length) % actors.length;
      if (actors[index].active) {
        setSelectedIndex(index);
        break;
      }
    }
  };

  const startInitiative = (newActors: Actor[]) => {
    setSetupOpen(false);
    setActors(newActors);
    setSelectedIndex(0);
  };

  const handleReset = () => {
    setActors([]);
    setEndOpen(false);
  };

  const toggleVisible = (id: number) =>
    setActors(actors.map((a) => (a.id === id ? { ...a, visible: !a.visible } : a)));

  const toggleActive = (id: number) =>
    setActors(actors.map((a) => (a.id === id ? { ...a, active: !a.active } : a)));

  const round = actors.length > 0 ? Math.floor(selectedIndex / actors.length) + 1 : null;

  return (
    <div className='space-y-3'>
      <InitiativeSetupDialog
        characters={characters}
        isOpen={setupOpen}
        handleClose={() => setSetupOpen(false)}
        onStartInitiative={startInitiative}
      />
      <InitiativeEndDialog
        isOpen={endOpen}
        handleClose={() => setEndOpen(false)}
        handleEndInitiative={handleReset}
      />

      {actors.length > 0 ? (
        <>
          <div className='text-xs text-muted-foreground'>Round {round}</div>
          <div className='space-y-0.5'>
            <div className='grid grid-cols-[2.5rem_1fr_4rem_4rem] gap-1 px-1 text-xs text-muted-foreground'>
              <span>Init</span>
              <span>Name</span>
              <span className='text-center'>Vis</span>
              <span className='text-center'>Alive</span>
            </div>
            {actors.map((actor, index) => (
              <div
                key={actor.id}
                className={`grid grid-cols-[2.5rem_1fr_4rem_4rem] gap-1 items-center px-1 py-0.5 rounded text-sm border-l-2 transition-colors ${
                  selectedIndex === index ? 'bg-primary/10 border-primary' : 'border-transparent'
                }`}>
                <span className='tabular-nums text-muted-foreground'>{actor.init}</span>
                <span
                  className={`flex items-center gap-1.5 ${
                    actor.active ? '' : 'line-through text-muted-foreground'
                  }`}>
                  {selectedIndex === index && <Sword className='h-3 w-3 text-primary shrink-0' />}
                  {actor.name}
                </span>
                <div className='flex justify-center'>
                  <Switch
                    checked={actor.visible}
                    onCheckedChange={() => toggleVisible(actor.id)}
                    className='scale-75'
                  />
                </div>
                <div className='flex justify-center'>
                  <Switch
                    checked={actor.active}
                    onCheckedChange={() => toggleActive(actor.id)}
                    className='scale-75'
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className='flex flex-col items-center gap-2 py-12 text-muted-foreground'>
          <Swords className='h-8 w-8 opacity-25' />
          <p className='text-sm'>No combat active</p>
        </div>
      )}

      <div className='flex items-center gap-2'>
        <Button variant='outline' size='icon' onClick={prevTurn} disabled={actors.length === 0}>
          <SkipBack className='h-4 w-4' />
        </Button>
        <Button variant='outline' size='icon' onClick={nextTurn} disabled={actors.length === 0}>
          <SkipForward className='h-4 w-4' />
        </Button>
        <div className='flex-1' />
        {actors.length === 0 ? (
          <Button size='sm' onClick={() => setSetupOpen(true)}>
            New Combat
          </Button>
        ) : (
          <Button variant='destructive' size='sm' onClick={() => setEndOpen(true)}>
            End
          </Button>
        )}
      </div>
    </div>
  );
}
