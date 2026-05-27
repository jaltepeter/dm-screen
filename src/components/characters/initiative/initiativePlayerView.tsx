import { ChevronRight } from 'lucide-react';
import { Actor } from '../../../lib/sync';
import { CONDITIONS } from './conditionPicker';

interface InitiativePlayerViewProps {
  actors: Actor[];
  turnNumber: number;
  round: number;
  large?: boolean;
}

export default function InitiativePlayerView({
  actors,
  turnNumber,
  round,
  large = false
}: InitiativePlayerViewProps) {
  return (
    <div className={large ? 'space-y-4' : 'space-y-2'}>
      <p
        className={`font-semibold text-white/50 uppercase tracking-wider ${large ? 'text-sm' : 'text-xs'}`}>
        Round {round}
      </p>
      <ul className={large ? 'space-y-2' : 'space-y-1'}>
        {actors.map((actor, index) => {
          const isCurrent = index === turnNumber;
          return (
            <li
              key={actor.id}
              className={`flex flex-col rounded border-l-2 transition-colors ${large ? 'px-5 py-3' : 'px-3 py-1.5'} ${
                isCurrent
                  ? 'bg-white/10 border-white/60 font-semibold'
                  : 'bg-white/5 border-transparent text-white/60'
              } ${!actor.active ? 'opacity-40' : ''}`}>
              <div className={`flex items-center gap-2 ${!actor.active ? 'line-through' : ''}`}>
                {isCurrent ? (
                  <ChevronRight className={large ? 'h-6 w-6 shrink-0' : 'h-4 w-4 shrink-0'} />
                ) : (
                  <span className={large ? 'w-6' : 'w-4'} />
                )}
                <span
                  className={
                    isCurrent ? (large ? 'text-2xl' : 'text-base') : large ? 'text-xl' : 'text-sm'
                  }>
                  {actor.visible ? actor.name : '? ? ? ? ? ?'}
                </span>
              </div>
              {actor.conditions.length > 0 && (
                <div className={`grid grid-cols-5 gap-1 mt-1 ${large ? 'pl-8' : 'pl-6'}`}>
                  {actor.conditions.map((c) => {
                    const cond = CONDITIONS[c];
                    return cond ? (
                      <span
                        key={c}
                        className={`w-10 text-center font-bold py-0.5 rounded ${large ? 'text-xs' : 'text-[10px]'} ${cond.className}`}>
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
