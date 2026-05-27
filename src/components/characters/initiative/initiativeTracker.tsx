import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { SkipBack, SkipForward, Sword, Swords } from 'lucide-react';
import ConditionPicker, { CONDITIONS } from './conditionPicker';
import HpCell from './hpCell';
import InitiativeEndDialog from './initiativeEndDialog';
import InitiativeSetupDialog from './initiativeSetupDialog';
import { Actor, sendMessage } from '../../../lib/sync';
import { useCombatStore } from '../../../store/combatStore';
import { useUiStore } from '../../../store/uiStore';
import { useEncounterStore } from '../../../store/encounterStore';
import StatBlockCard from '../../encounters/statBlockCard';

export default function InitiativeTracker() {
  const { actors, selectedIndex, round, setActors, setSelectedIndex, setRound, reset } =
    useCombatStore();
  const [setupOpen, setSetupOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);
  const [viewingStatBlockId, setViewingStatBlockId] = useState<string | null>(null);
  const setInitiativeActive = useUiStore((s) => s.setInitiativeActive);
  const statBlocks = useEncounterStore((s) => s.statBlocks);

  useEffect(() => {
    if (actors.length === 0) return;
    sendMessage({ cmd: 'init_update', payload: { actors, index: selectedIndex } });
  }, [selectedIndex, actors]);

  useEffect(() => {
    setInitiativeActive(actors.length > 0);
  }, [actors.length, setInitiativeActive]);

  const autoFollow = (nextActors: Actor[], nextIndex: number) => {
    const a = nextActors[nextIndex];
    if (a?.kind === 'npc' && a.statBlockId) setViewingStatBlockId(a.statBlockId);
  };

  const nextTurn = () => {
    for (let i = selectedIndex + 1; i < actors.length + selectedIndex + 1; i++) {
      if (actors[i % actors.length].active) {
        // i >= actors.length means we wrapped past the end of the list — new round
        if (i >= actors.length) setRound(round + 1);
        const nextIndex = i % actors.length;
        setSelectedIndex(nextIndex);
        autoFollow(actors, nextIndex);
        break;
      }
    }
  };

  const prevTurn = () => {
    for (let i = 1; i <= actors.length; i++) {
      const index = (selectedIndex - i + actors.length) % actors.length;
      if (actors[index].active) {
        setSelectedIndex(index);
        autoFollow(actors, index);
        break;
      }
    }
  };

  const startInitiative = (newActors: Actor[]) => {
    setSetupOpen(false);
    setActors(newActors);
    setSelectedIndex(0);
    setRound(1);
    autoFollow(newActors, 0);
  };

  const handleReset = () => {
    reset();
    setEndOpen(false);
    setViewingStatBlockId(null);
  };

  const toggleVisible = (id: string) =>
    setActors(actors.map((a) => (a.id === id ? { ...a, visible: !a.visible } : a)));

  const toggleActive = (id: string) =>
    setActors(actors.map((a) => (a.id === id ? { ...a, active: !a.active } : a)));

  const toggleCondition = (id: string, condition: string) =>
    setActors(
      actors.map((a) =>
        a.id !== id
          ? a
          : {
              ...a,
              conditions: a.conditions.includes(condition)
                ? a.conditions.filter((c) => c !== condition)
                : [...a.conditions, condition]
            }
      )
    );

  const updateHp = (id: string, rawHp: number) => {
    setActors(
      actors.map((a) => {
        if (a.id !== id) return a;
        const hp = Math.max(0, rawHp);
        // Auto-mark inactive when HP reaches 0
        return { ...a, hp, active: hp > 0 ? a.active : false };
      })
    );
  };

  const handleNpcNameClick = (actor: Actor) => {
    if (!actor.statBlockId) return;
    setViewingStatBlockId((prev) => (prev === actor.statBlockId ? null : actor.statBlockId!));
  };

  const viewingStatBlock = viewingStatBlockId
    ? (statBlocks.find((s) => s.id === viewingStatBlockId) ?? null)
    : null;

  return (
    <div className='flex flex-col h-full'>
      <InitiativeSetupDialog
        isOpen={setupOpen}
        handleClose={() => setSetupOpen(false)}
        onStartInitiative={startInitiative}
      />
      <InitiativeEndDialog
        isOpen={endOpen}
        handleClose={() => setEndOpen(false)}
        handleEndInitiative={handleReset}
      />
      <div className='shrink-0 p-3 space-y-3'>
        {actors.length > 0 ? (
          <>
            <div className='text-xs text-muted-foreground'>Round {round}</div>
            <div className='space-y-0.5'>
              <div className='grid grid-cols-[2.5rem_1fr_7.5rem_4rem_4rem_2rem] gap-1 px-1 text-xs text-muted-foreground'>
                <span>Init</span>
                <span>Name</span>
                <span className='text-center'>HP</span>
                <span className='text-center'>Vis</span>
                <span className='text-center'>Alive</span>
                <span />
              </div>
              {actors.map((actor, index) => (
                <div key={actor.id}>
                  <div
                    className={`grid grid-cols-[2.5rem_1fr_7.5rem_4rem_4rem_2rem] gap-1 items-center px-1 py-0.5 rounded text-sm border-l-2 transition-colors ${
                      selectedIndex === index
                        ? 'bg-primary/10 border-primary'
                        : 'border-transparent'
                    }`}>
                    <span className='tabular-nums text-muted-foreground'>{actor.init}</span>
                    <span
                      className={`flex items-center gap-1.5 ${
                        actor.active ? '' : 'line-through text-muted-foreground'
                      } ${
                        actor.kind === 'npc' && actor.statBlockId
                          ? 'cursor-pointer hover:underline'
                          : ''
                      }`}
                      onClick={() => handleNpcNameClick(actor)}>
                      {selectedIndex === index && (
                        <Sword className='h-3 w-3 text-primary shrink-0' />
                      )}
                      {actor.name}
                    </span>
                    <div className='flex items-center justify-center gap-0.5'>
                      {actor.kind === 'npc' && actor.maxHp !== undefined && (
                        <HpCell
                          hp={actor.hp}
                          maxHp={actor.maxHp}
                          onCommit={(newHp) => updateHp(actor.id, newHp)}
                        />
                      )}
                    </div>
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
                    <div className='flex justify-center'>
                      <ConditionPicker
                        conditions={actor.conditions}
                        onToggle={(c) => toggleCondition(actor.id, c)}
                      />
                    </div>
                  </div>
                  {actor.conditions.length > 0 && (
                    <div className='flex flex-wrap gap-1 px-1 pb-0.5'>
                      {actor.conditions.map((c) => {
                        const cond = CONDITIONS[c];
                        return cond ? (
                          <span
                            key={c}
                            className={`w-10 text-center text-[10px] font-bold py-0.5 rounded ${cond.className}`}>
                            {cond.label}
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
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

      {viewingStatBlock && (
        <>
          <hr className='shrink-0 border-t border-border' />
          <div className='flex-1 overflow-auto px-3 pb-3 pt-3 min-h-0'>
            <StatBlockCard statBlock={viewingStatBlock} />
          </div>
        </>
      )}
    </div>
  );
}
