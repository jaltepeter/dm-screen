import { ChevronRight } from 'lucide-react';
import { Actor } from '../../../lib/sync';
import { CONDITIONS } from './conditionPicker';

interface InitiativePlayerViewProps {
  actors: Actor[];
  turnNumber: number;
}

export default function InitiativePlayerView({ actors, turnNumber }: InitiativePlayerViewProps) {
  return (
    <ul className='space-y-0.5'>
      {actors.map((actor, index) => {
        const isCurrent = index === turnNumber;
        return (
          <li
            key={actor.id}
            className={`flex flex-col px-2 py-1 rounded text-sm ${
              isCurrent ? 'bg-white/10 font-semibold' : 'text-white/70'
            } ${!actor.active ? 'opacity-50' : ''}`}>
            <div className={`flex items-center gap-1.5 ${!actor.active ? 'line-through' : ''}`}>
              {isCurrent ? (
                <ChevronRight className='h-3.5 w-3.5 shrink-0' />
              ) : (
                <span className='w-3.5' />
              )}
              <span className='flex-1'>{actor.visible ? actor.name : '? ? ? ? ? ?'}</span>
              <span className='tabular-nums text-white/50'>{actor.init}</span>
            </div>
            {actor.conditions.length > 0 && (
              <div className='flex flex-wrap gap-1 mt-0.5 pl-5'>
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
          </li>
        );
      })}
    </ul>
  );
}
