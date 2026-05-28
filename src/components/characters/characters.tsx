import { useEffect, useRef, useState } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import PlayerDetails from './playerDetails';
import SectionHeader from '@/components/ui/section-header';
import { Button } from '@/components/ui/button';
import { useCharacterStore } from '../../store/characterStore';
import { useNotesStore } from '../../store/notesStore';
import { useCampaignStore } from '../../store/campaignStore';

const MD_COMPONENTS: Components = {
  h1: ({ children }) => <h1 className='text-lg font-bold mb-2 mt-3 first:mt-0'>{children}</h1>,
  h2: ({ children }) => <h2 className='text-base font-bold mb-1.5 mt-3 first:mt-0'>{children}</h2>,
  h3: ({ children }) => <h3 className='text-sm font-semibold mb-1 mt-2 first:mt-0'>{children}</h3>,
  p: ({ children }) => <p className='mb-2 last:mb-0 leading-relaxed'>{children}</p>,
  ul: ({ children }) => <ul className='list-disc pl-4 mb-2 space-y-0.5'>{children}</ul>,
  ol: ({ children }) => <ol className='list-decimal pl-4 mb-2 space-y-0.5'>{children}</ol>,
  li: ({ children }) => <li className='leading-relaxed'>{children}</li>,
  strong: ({ children }) => <strong className='font-semibold'>{children}</strong>,
  em: ({ children }) => <em className='italic'>{children}</em>,
  pre: ({ children }) => (
    <pre className='bg-muted rounded p-2 overflow-x-auto text-xs font-mono my-2'>{children}</pre>
  ),
  code: ({ children }) => (
    <code className='bg-muted px-1 py-0.5 rounded text-xs font-mono'>{children}</code>
  ),
  hr: () => <hr className='border-border my-3' />,
  blockquote: ({ children }) => (
    <blockquote className='border-l-2 border-muted-foreground/40 pl-3 italic text-muted-foreground my-2'>
      {children}
    </blockquote>
  )
};

export default function Characters() {
  const allCharacters = useCharacterStore((s) => s.characters);
  const activeCampaignId = useCampaignStore((s) => s.activeCampaignId);
  const characters = activeCampaignId
    ? allCharacters.filter((c) => c.campaignId === activeCampaignId)
    : allCharacters;
  const notes = useNotesStore((s) => s.notes);
  const setNotes = useNotesStore((s) => s.setNotes);

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [savedVisible, setSavedVisible] = useState(false);
  const [undoValue, setUndoValue] = useState<string | null>(null);
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (fadeTimer.current) clearTimeout(fadeTimer.current);
      if (undoTimer.current) clearTimeout(undoTimer.current);
    },
    []
  );

  const showSaved = () => {
    setSavedVisible(true);
    if (fadeTimer.current) clearTimeout(fadeTimer.current);
    fadeTimer.current = setTimeout(() => setSavedVisible(false), 1500);
  };

  const handleSave = () => {
    setUndoValue(notes);
    setNotes(editValue);
    setIsEditing(false);
    showSaved();
    if (undoTimer.current) clearTimeout(undoTimer.current);
    undoTimer.current = setTimeout(() => setUndoValue(null), 60000);
  };

  const handleUndo = () => {
    if (undoValue === null) return;
    setNotes(undoValue);
    setUndoValue(null);
    if (undoTimer.current) clearTimeout(undoTimer.current);
  };

  const handleEnterEdit = () => {
    setEditValue(notes);
    setIsEditing(true);
  };

  return (
    <div className='flex flex-col flex-1 min-h-0 gap-4'>
      <section className='shrink-0'>
        <SectionHeader className='mb-2'>Characters</SectionHeader>
        <PlayerDetails characters={characters} />
      </section>

      <section className='flex flex-col flex-1 min-h-0'>
        <div className='flex items-center justify-between mb-2'>
          <SectionHeader>Notes</SectionHeader>
          <div className='flex items-center gap-2'>
            {isEditing && (
              <Button size='sm' onMouseDown={(e) => e.preventDefault()} onClick={handleSave}>
                Save
              </Button>
            )}
            {!isEditing && undoValue !== null && (
              <button
                onClick={handleUndo}
                className='text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground'>
                Undo
              </button>
            )}
            <span
              className={`text-xs text-muted-foreground transition-opacity duration-500 ${
                savedVisible ? 'opacity-100' : 'opacity-0'
              }`}>
              Saved
            </span>
          </div>
        </div>

        {isEditing ? (
          <textarea
            autoFocus
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && handleSave()}
            onBlur={handleSave}
            className='flex-1 min-h-0 overflow-y-auto w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
          />
        ) : (
          <div
            onDoubleClick={handleEnterEdit}
            className='flex-1 min-h-0 overflow-y-auto rounded-md border border-input bg-background px-3 py-2 text-sm cursor-text'>
            {notes ? (
              <ReactMarkdown components={MD_COMPONENTS}>{notes}</ReactMarkdown>
            ) : (
              <span className='text-muted-foreground'>Session notes…</span>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
