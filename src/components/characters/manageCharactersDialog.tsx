import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus } from 'lucide-react';
import { Character, useCharacterStore } from '../../store/characterStore';
import ConfirmDialog from '@/components/ui/confirmDialog';

interface ManageCharactersDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type EditingCell = { id: number; field: keyof Character } | null;

export default function ManageCharactersDialog({ isOpen, onClose }: ManageCharactersDialogProps) {
  const { characters, addCharacter, editCharacter, deleteCharacter } = useCharacterStore();
  const [editing, setEditing] = useState<EditingCell>(null);
  const [draft, setDraft] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const startEdit = (char: Character, field: keyof Character) => {
    setEditing({ id: char.id, field });
    setDraft(String(char[field] ?? ''));
  };

  const commitEdit = (char: Character) => {
    if (!editing) return;
    const { field } = editing;
    const numFields: (keyof Character)[] = ['ac', 'pp', 'pi', 'init'];
    const value = numFields.includes(field) ? Number(draft) : draft;
    editCharacter({ ...char, [field]: value });
    setEditing(null);
  };

  const isEditing = (id: number, field: keyof Character) =>
    editing?.id === id && editing?.field === field;

  const EditableCell = ({
    char,
    field,
    className
  }: {
    char: Character;
    field: keyof Character;
    className?: string;
  }) => {
    if (isEditing(char.id, field)) {
      return (
        <Input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => commitEdit(char)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitEdit(char);
            if (e.key === 'Escape') setEditing(null);
          }}
          className={`h-7 text-sm px-1 ${className ?? ''}`}
        />
      );
    }
    return (
      <span
        className={`cursor-pointer hover:underline hover:text-foreground ${className ?? ''}`}
        onClick={() => startEdit(char, field)}>
        {String(char[field] ?? '')}
      </span>
    );
  };

  const pendingDelete = characters.find((c) => c.id === pendingDeleteId) ?? null;

  return (
    <>
      <ConfirmDialog
        open={!!pendingDeleteId}
        title='Delete character?'
        description={
          pendingDelete ? `"${pendingDelete.name}" will be permanently deleted.` : undefined
        }
        onConfirm={() => {
          if (pendingDeleteId != null) deleteCharacter(pendingDeleteId);
          setPendingDeleteId(null);
        }}
        onCancel={() => setPendingDeleteId(null)}
      />
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className='top-0 left-0 translate-x-0 translate-y-0 flex h-screen max-h-screen w-screen max-w-none sm:max-w-none m-0 rounded-none p-0 gap-0 flex-col'>
          <DialogHeader className='px-4 py-3 border-b shrink-0'>
            <DialogTitle>Manage Characters</DialogTitle>
          </DialogHeader>
          <div className='overflow-auto flex-1 p-4'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Background</TableHead>
                  <TableHead className='text-center'>AC</TableHead>
                  <TableHead className='text-center'>PP</TableHead>
                  <TableHead className='text-center'>PI</TableHead>
                  <TableHead className='text-center'>Init</TableHead>
                  <TableHead>Sheet URL</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {characters.map((char) => (
                  <TableRow key={char.id}>
                    <TableCell>
                      <EditableCell char={char} field='name' />
                    </TableCell>
                    <TableCell>
                      <EditableCell char={char} field='charClass' />
                    </TableCell>
                    <TableCell>
                      <EditableCell char={char} field='background' />
                    </TableCell>
                    <TableCell className='text-center'>
                      <EditableCell char={char} field='ac' className='tabular-nums' />
                    </TableCell>
                    <TableCell className='text-center'>
                      <EditableCell char={char} field='pp' className='tabular-nums' />
                    </TableCell>
                    <TableCell className='text-center'>
                      <EditableCell char={char} field='pi' className='tabular-nums' />
                    </TableCell>
                    <TableCell className='text-center'>
                      <EditableCell char={char} field='init' className='tabular-nums' />
                    </TableCell>
                    <TableCell>
                      <EditableCell char={char} field='sheetUrl' className='text-xs' />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-7 w-7'
                        onClick={() => setPendingDeleteId(char.id)}>
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className='px-4 py-3 border-t shrink-0'>
            <Button variant='outline' size='sm' onClick={addCharacter}>
              <Plus className='h-4 w-4 mr-1' />
              Add Character
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
