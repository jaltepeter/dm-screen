import { ChevronRight } from 'lucide-react';
import { Actor } from '../../../lib/sync';

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
            key={index}
            className={`flex items-center gap-1.5 px-2 py-1 rounded text-sm ${
              isCurrent ? 'bg-white/10 font-semibold' : 'text-white/70'
            } ${!actor.active ? 'line-through opacity-50' : ''}`}>
            {isCurrent ? (
              <ChevronRight className='h-3.5 w-3.5 shrink-0' />
            ) : (
              <span className='w-3.5' />
            )}
            <span className='flex-1'>{actor.visible ? actor.name : '? ? ? ? ? ?'}</span>
            <span className='tabular-nums text-white/50'>{actor.init}</span>
          </li>
        );
      })}
    </ul>
  );
}
