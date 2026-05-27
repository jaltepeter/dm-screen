import { useEffect, useRef, useState } from 'react';
import { Bug } from 'lucide-react';
import { DebugEvent, onDebugEvent } from '../../lib/sync';

const STORAGE_KEY = 'dm-screen/debug-open';

function formatTime(ts: number): string {
  return new Date(ts).toTimeString().slice(0, 8);
}

function EventRow({ e }: { e: DebugEvent }) {
  const [expanded, setExpanded] = useState(false);
  const hasPayload = e.payload !== undefined;

  return (
    <div
      className={`py-0.5 ${hasPayload ? 'cursor-pointer hover:bg-white/5 rounded px-1 -mx-1' : 'px-0'}`}
      onClick={() => hasPayload && setExpanded((x) => !x)}>
      <div className='flex items-baseline gap-1.5'>
        <span
          className={`shrink-0 w-3 text-center ${e.direction === 'sent' ? 'text-amber-400' : 'text-sky-400'}`}>
          {e.direction === 'sent' ? '→' : '←'}
        </span>
        <span className='text-white/80 shrink-0'>{e.cmd}</span>
        {!expanded && hasPayload && (
          <span className='text-white/30 truncate'>{JSON.stringify(e.payload).slice(0, 60)}</span>
        )}
        <span className='text-white/20 shrink-0 ml-auto'>{formatTime(e.timestamp)}</span>
      </div>
      {expanded && hasPayload && (
        <pre className='mt-1 text-white/50 whitespace-pre-wrap break-all text-[10px] leading-relaxed'>
          {JSON.stringify(e.payload, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default function DebugPanel() {
  const [open, setOpen] = useState(() => localStorage.getItem(STORAGE_KEY) === 'true');
  const [log, setLog] = useState<DebugEvent[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(open));
    if (!open) return;
    return onDebugEvent((event) => {
      setLog((prev) => [...prev, event].slice(-200));
    });
  }, [open]);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log, open]);

  return (
    <>
      {open && (
        <div className='fixed bottom-8 left-2 w-120 max-h-96 bg-black/95 border border-white/10 rounded-lg flex flex-col text-xs font-mono z-50'>
          <div className='flex items-center justify-between px-2 py-1.5 border-b border-white/10 shrink-0'>
            <span className='text-white/40 uppercase tracking-wider text-[10px]'>Sync Debug</span>
            <button
              onClick={() => setLog([])}
              className='text-white/30 hover:text-white/60 transition-colors'>
              clear
            </button>
          </div>
          <div className='overflow-y-auto flex-1 px-2 py-1'>
            {log.length === 0 && <p className='text-white/20 py-2 text-center'>No events yet</p>}
            {log.map((e, i) => (
              <EventRow key={i} e={e} />
            ))}
            <div ref={bottomRef} />
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        className={`fixed bottom-2 left-2 p-1.5 rounded transition-colors z-50 ${
          open ? 'text-white/60 bg-white/10' : 'text-white/15 hover:text-white/40'
        }`}
        title='Toggle sync debug'>
        <Bug className='h-3.5 w-3.5' />
      </button>
    </>
  );
}
