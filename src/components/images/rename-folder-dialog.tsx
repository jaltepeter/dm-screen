import { ChangeEvent, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SimpleDialog from '@/components/ui/simple-dialog';

interface RenameFolderDialogProps {
  open: boolean;
  onClose: () => void;
  targetFolder: string;
  existingFolderNames: string[];
  onRename: (newName: string) => void;
}

export default function RenameFolderDialog({
  open,
  onClose,
  targetFolder,
  existingFolderNames,
  onRename
}: RenameFolderDialogProps) {
  const [folderNameInput, setFolderNameInput] = useState(targetFolder);
  const [nameError, setNameError] = useState('');

  const handleRename = () => {
    if (existingFolderNames.some((n) => n === folderNameInput && n !== targetFolder)) {
      setNameError('A folder with that name already exists');
      return;
    }
    onRename(folderNameInput.trim());
    onClose();
  };

  return (
    <SimpleDialog open={open} onClose={onClose} title='Rename Folder' onSubmit={handleRename}>
      <div className='space-y-1'>
        <Label htmlFor='rename-folder'>New name</Label>
        <Input
          id='rename-folder'
          autoFocus
          value={folderNameInput}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setNameError('');
            setFolderNameInput(e.target.value);
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleRename()}
        />
        {nameError && <p className='text-sm text-destructive'>{nameError}</p>}
      </div>
    </SimpleDialog>
  );
}
