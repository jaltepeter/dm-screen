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
import { Character } from '../../store/characterStore';

interface ManageCharactersDialogProps {
  characters: Character[];
  isOpen: boolean;
  onClose: () => void;
  onAddCharacter: () => void;
  onEditCharacter: (character: Character) => void;
  onDeleteCharacter: (id: number) => void;
}

type EditingCell = { id: number; field: keyof Character } | null;

export default function ManageCharactersDialog({
  characters,
  isOpen,
  onClose,
  onAddCharacter,
  onEditCharacter,
  onDeleteCharacter
}: ManageCharactersDialogProps) {
  const [editing, setEditing] = useState<EditingCell>(null);
  const [draft, setDraft] = useState('');

  const startEdit = (char: Character, field: keyof Character) => {
    setEditing({ id: char.id, field });
    setDraft(String(char[field] ?? ''));
  };

  const commitEdit = (char: Character) => {
    if (!editing) return;
    const { field } = editing;
    const numFields: (keyof Character)[] = ['ac', 'pp', 'pi', 'init'];
    const value = numFields.includes(field) ? Number(draft) : draft;
    onEditCharacter({ ...char, [field]: value });
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='max-w-4xl max-h-[80vh] flex flex-col'>
        <DialogHeader>
          <DialogTitle>Manage Characters</DialogTitle>
        </DialogHeader>
        <div className='overflow-auto flex-1'>
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
                      onClick={() => onDeleteCharacter(char.id)}>
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <Button variant='outline' size='sm' onClick={onAddCharacter} className='mt-2 self-start'>
          <Plus className='h-4 w-4 mr-1' />
          Add Character
        </Button>
      </DialogContent>
    </Dialog>
  );
}
