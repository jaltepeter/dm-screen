import ManageCharactersDialog from './manageCharactersDialog';
import PlayerDetails from './playerDetails';
import { Textarea } from '@/components/ui/textarea';
import { useCharacterStore } from '../../store/characterStore';
import { useNotesStore } from '../../store/notesStore';

interface CharactersProps {
  isManageCharDialogOpen: boolean;
  onCloseManageCharDialog: () => void;
}

export default function Characters({
  isManageCharDialogOpen,
  onCloseManageCharDialog
}: CharactersProps) {
  const characters = useCharacterStore((s) => s.characters);
  const addCharacter = useCharacterStore((s) => s.addCharacter);
  const editCharacter = useCharacterStore((s) => s.editCharacter);
  const deleteCharacter = useCharacterStore((s) => s.deleteCharacter);
  const notes = useNotesStore((s) => s.notes);
  const setNotes = useNotesStore((s) => s.setNotes);

  return (
    <>
      <ManageCharactersDialog
        characters={characters}
        isOpen={isManageCharDialogOpen}
        onClose={onCloseManageCharDialog}
        onAddCharacter={addCharacter}
        onEditCharacter={editCharacter}
        onDeleteCharacter={deleteCharacter}
      />

      <div className='space-y-4'>
        <section>
          <h2 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2'>
            Characters
          </h2>
          <PlayerDetails characters={characters} />
        </section>

        <section>
          <h2 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2'>
            Notes
          </h2>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder='Session notes…'
            className='min-h-32 resize-y text-sm font-mono'
          />
        </section>
      </div>
    </>
  );
}
