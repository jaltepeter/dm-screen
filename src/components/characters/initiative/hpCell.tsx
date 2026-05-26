import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus } from 'lucide-react';

interface HpCellProps {
  hp: number | undefined;
  maxHp: number;
  onCommit: (newHp: number) => void;
}

const HOLD_DELAY = 500;
const HOLD_INTERVAL = 500;
const COMMIT_DELAY = 1250;

export default function HpCell({ hp, maxHp, onCommit }: HpCellProps) {
  const base = hp ?? maxHp;
  const [localHp, setLocalHp] = useState(base);
  const [delta, setDelta] = useState(0);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const localHpRef = useRef(base);
  const deltaRef = useRef(0);
  const commitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tapDirRef = useRef<1 | -1 | null>(null);
  const onCommitRef = useRef(onCommit);
  useEffect(() => {
    onCommitRef.current = onCommit;
  });

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const scheduleCommit = () => {
    if (commitTimerRef.current) clearTimeout(commitTimerRef.current);
    commitTimerRef.current = setTimeout(() => {
      onCommitRef.current(localHpRef.current);
      deltaRef.current = 0;
      setDelta(0);
    }, COMMIT_DELAY);
  };

  const applyChange = (amount: number) => {
    const prev = localHpRef.current;
    const next = Math.max(0, prev + amount);
    localHpRef.current = next;
    deltaRef.current += next - prev;
    setLocalHp(next);
    setDelta(deltaRef.current);
    scheduleCommit();
  };

  const stopHold = () => {
    if (holdDelayRef.current) {
      // Released before hold kicked in — fire the single ±1 tap now
      clearTimeout(holdDelayRef.current);
      holdDelayRef.current = null;
      if (tapDirRef.current !== null) applyChange(tapDirRef.current);
    }
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
    tapDirRef.current = null;
  };

  const startHold = (dir: 1 | -1) => {
    tapDirRef.current = dir;
    holdDelayRef.current = setTimeout(() => {
      holdDelayRef.current = null; // mark fired so stopHold skips the tap
      applyChange(dir * 10);
      holdIntervalRef.current = setInterval(() => applyChange(dir * 10), HOLD_INTERVAL);
    }, HOLD_DELAY);
  };

  const commitEdit = () => {
    const newHp = Math.max(0, Number(draft) || 0);
    if (commitTimerRef.current) clearTimeout(commitTimerRef.current);
    localHpRef.current = newHp;
    deltaRef.current = 0;
    setLocalHp(newHp);
    setDelta(0);
    setEditing(false);
    onCommitRef.current(newHp);
  };

  return (
    <div className='flex items-center justify-center gap-0.5'>
      <Button
        variant='ghost'
        size='icon'
        className='h-6 w-6 shrink-0 select-none'
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          startHold(-1);
        }}
        onPointerUp={stopHold}
        onPointerLeave={stopHold}
        onPointerCancel={stopHold}>
        <Minus className='h-3 w-3' />
      </Button>

      <div className='relative'>
        {editing ? (
          <Input
            ref={inputRef}
            type='number'
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitEdit();
              if (e.key === 'Escape') setEditing(false);
            }}
            className='h-6 w-10 text-xs px-1 text-center'
          />
        ) : (
          <span
            className='tabular-nums text-sm w-6 text-center cursor-pointer select-none block'
            title='Double-click to type a value'
            onDoubleClick={() => {
              stopHold();
              setDraft(String(localHp));
              setEditing(true);
            }}>
            {localHp}
          </span>
        )}
        {!editing && delta !== 0 && (
          <span
            className={`absolute top-full left-1/2 -translate-x-1/2 text-[10px] font-bold tabular-nums leading-none pointer-events-none whitespace-nowrap ${
              delta < 0 ? 'text-red-400' : 'text-green-400'
            }`}>
            {delta > 0 ? '+' : ''}
            {delta}
          </span>
        )}
      </div>

      <span className='text-xs text-muted-foreground'>/{maxHp}</span>

      <Button
        variant='ghost'
        size='icon'
        className='h-6 w-6 shrink-0 select-none'
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          startHold(1);
        }}
        onPointerUp={stopHold}
        onPointerLeave={stopHold}
        onPointerCancel={stopHold}>
        <Plus className='h-3 w-3' />
      </Button>
    </div>
  );
}
