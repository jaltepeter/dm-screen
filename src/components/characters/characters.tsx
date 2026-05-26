import { useRef, useState } from 'react';
import PlayerDetails from './playerDetails';
import { Textarea } from '@/components/ui/textarea';
import { useCharacterStore } from '../../store/characterStore';
import { useNotesStore } from '../../store/notesStore';

export default function Characters() {
  const characters = useCharacterStore((s) => s.characters);
  const notes = useNotesStore((s) => s.notes);
  const setNotes = useNotesStore((s) => s.setNotes);

  const [savedVisible, setSavedVisible] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleNotesChange = (value: string) => {
    setNotes(value);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    if (fadeTimer.current) clearTimeout(fadeTimer.current);
    saveTimer.current = setTimeout(() => {
      setSavedVisible(true);
      fadeTimer.current = setTimeout(() => setSavedVisible(false), 1500);
    }, 800);
  };

  return (
    <div className='space-y-4'>
      <section>
        <h2 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2'>
          Characters
        </h2>
        <PlayerDetails characters={characters} />
      </section>

      <section>
        <div className='flex items-center justify-between mb-2'>
          <h2 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
            Notes
          </h2>
          <span
            className={`text-xs text-muted-foreground transition-opacity duration-500 ${
              savedVisible ? 'opacity-100' : 'opacity-0'
            }`}>
            Saved
          </span>
        </div>
        <Textarea
          value={notes}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder='Session notes…'
          className='min-h-32 resize-y text-sm font-mono'
        />
      </section>
    </div>
  );
}
