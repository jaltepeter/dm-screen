import { ChangeEvent, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SimpleDialog from '@/components/ui/simple-dialog';

interface AddImageDialogProps {
  open: boolean;
  onClose: () => void;
  targetFolder: string;
  onSave: (url: string, title: string) => void;
}

export default function AddImageDialog({
  open,
  onClose,
  targetFolder,
  onSave
}: AddImageDialogProps) {
  const [url, setUrl] = useState('');
  const [imageTitle, setImageTitle] = useState('');

  const handleSave = () => {
    if (!url.trim()) return;
    onSave(url.trim(), imageTitle.trim());
    onClose();
  };

  return (
    <SimpleDialog
      open={open}
      onClose={onClose}
      title='Add Image'
      description={`Save an image URL to "${targetFolder}".`}
      onSubmit={handleSave}
      submitDisabled={!url.trim()}>
      <div className='space-y-3'>
        <div className='space-y-1'>
          <Label htmlFor='add-img-title'>Title (optional)</Label>
          <Input
            id='add-img-title'
            value={imageTitle}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setImageTitle(e.target.value)}
            placeholder='Dragon cave map'
          />
        </div>
        <div className='space-y-1'>
          <Label htmlFor='add-img-url'>Image URL</Label>
          <Input
            id='add-img-url'
            autoFocus
            value={url}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
            placeholder='https://…'
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
        </div>
      </div>
    </SimpleDialog>
  );
}
