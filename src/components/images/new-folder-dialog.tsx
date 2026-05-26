import { ChangeEvent, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SimpleDialog from '@/components/ui/simple-dialog';

interface NewFolderDialogProps {
  open: boolean;
  onClose: () => void;
  existingFolderNames: string[];
  onCreate: (name: string) => void;
}

export default function NewFolderDialog({
  open,
  onClose,
  existingFolderNames,
  onCreate
}: NewFolderDialogProps) {
  const [folderNameInput, setFolderNameInput] = useState('');
  const [nameError, setNameError] = useState('');

  const handleCreate = () => {
    const name = folderNameInput.trim();
    if (!name) return;
    if (existingFolderNames.some((n) => n === name)) {
      setNameError('A folder with that name already exists');
      return;
    }
    onCreate(name);
    onClose();
  };

  return (
    <SimpleDialog
      open={open}
      onClose={onClose}
      title='New Folder'
      onSubmit={handleCreate}
      submitLabel='Create'
      submitDisabled={!folderNameInput.trim()}>
      <div className='space-y-1'>
        <Label htmlFor='new-folder'>Folder name</Label>
        <Input
          id='new-folder'
          autoFocus
          value={folderNameInput}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setNameError('');
            setFolderNameInput(e.target.value);
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
        />
        {nameError && <p className='text-sm text-destructive'>{nameError}</p>}
      </div>
    </SimpleDialog>
  );
}
