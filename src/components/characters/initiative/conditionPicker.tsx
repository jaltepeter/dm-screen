import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export const CONDITIONS: Record<string, { label: string; className: string }> = {
  blinded: { label: 'BLIND', className: 'bg-slate-500/20 text-slate-400' },
  charmed: { label: 'CHARM', className: 'bg-pink-500/20 text-pink-400' },
  deafened: { label: 'DEAF', className: 'bg-zinc-500/20 text-zinc-400' },
  exhaustion: { label: 'EXHST', className: 'bg-amber-500/20 text-amber-400' },
  frightened: { label: 'FRGHT', className: 'bg-purple-500/20 text-purple-400' },
  grappled: { label: 'GRPL', className: 'bg-orange-500/20 text-orange-400' },
  incapacitated: { label: 'INCAP', className: 'bg-red-500/20 text-red-400' },
  invisible: { label: 'INVIS', className: 'bg-indigo-500/20 text-indigo-400' },
  paralyzed: { label: 'PARA', className: 'bg-yellow-500/20 text-yellow-400' },
  petrified: { label: 'PETR', className: 'bg-stone-500/20 text-stone-400' },
  poisoned: { label: 'PSND', className: 'bg-green-500/20 text-green-400' },
  prone: { label: 'PRONE', className: 'bg-amber-700/20 text-amber-600' },
  restrained: { label: 'RSTR', className: 'bg-orange-700/20 text-orange-600' },
  stunned: { label: 'STUN', className: 'bg-cyan-500/20 text-cyan-400' },
  unconscious: { label: 'UNCON', className: 'bg-gray-500/20 text-gray-400' }
};

interface ConditionPickerProps {
  conditions: string[];
  onToggle: (condition: string) => void;
}

export default function ConditionPicker({ conditions, onToggle }: ConditionPickerProps) {
  const activeCount = conditions.length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className={`h-6 w-6 relative ${activeCount > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
          <ShieldAlert className='h-3.5 w-3.5' />
          {activeCount > 0 && (
            <span className='absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-primary text-[8px] text-primary-foreground flex items-center justify-center font-bold leading-none'>
              {activeCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-48 p-2' align='end'>
        <div className='grid grid-cols-3 gap-1'>
          {Object.entries(CONDITIONS).map(([key, { label, className }]) => {
            const active = conditions.includes(key);
            return (
              <button
                key={key}
                onClick={() => onToggle(key)}
                className={`w-10 text-center text-[10px] font-bold px-0 py-1 rounded transition-opacity ${className} ${
                  active ? 'opacity-100 ring-1 ring-current' : 'opacity-40 hover:opacity-70'
                }`}>
                {label}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
