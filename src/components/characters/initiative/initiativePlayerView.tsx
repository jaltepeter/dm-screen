import { ChevronRight } from 'lucide-react';
import { Actor } from '../../../lib/sync';
import { CONDITIONS } from './conditionPicker';

interface InitiativePlayerViewProps {
  actors: Actor[];
  turnNumber: number;
  round: number;
}

export default function InitiativePlayerView({
  actors,
  turnNumber,
  round
}: InitiativePlayerViewProps) {
  return (
    <div className='space-y-2'>
      <p className='text-xs font-semibold text-white/50 uppercase tracking-wider'>Round {round}</p>
      <ul className='space-y-1'>
        {actors.map((actor, index) => {
          const isCurrent = index === turnNumber;
          return (
            <li
              key={actor.id}
              className={`flex flex-col px-3 py-1.5 rounded border-l-2 transition-colors ${
                isCurrent
                  ? 'bg-white/10 border-white/60 font-semibold'
                  : 'bg-white/5 border-transparent text-white/60'
              } ${!actor.active ? 'opacity-40' : ''}`}>
              <div className={`flex items-center gap-2 ${!actor.active ? 'line-through' : ''}`}>
                {isCurrent ? (
                  <ChevronRight className='h-4 w-4 shrink-0' />
                ) : (
                  <span className='w-4' />
                )}
                <span className={isCurrent ? 'text-base' : 'text-sm'}>
                  {actor.visible ? actor.name : '? ? ? ? ? ?'}
                </span>
              </div>
              {actor.conditions.length > 0 && (
                <div className='grid grid-cols-5 gap-1 mt-1 pl-6'>
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
    </div>
  );
}
