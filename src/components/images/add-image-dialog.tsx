import { ChangeEvent, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SimpleDialog from '@/components/ui/simple-dialog';

interface AddImageDialogProps {
  open: boolean;
  onClose: () => void;
  targetFolder: string;
  onSave: (url: string, title: string) => boolean;
}

export default function AddImageDialog({
  open,
  onClose,
  targetFolder,
  onSave
}: AddImageDialogProps) {
  const [url, setUrl] = useState('');
  const [imageTitle, setImageTitle] = useState('');
  const [dupeError, setDupeError] = useState(false);

  const handleClose = () => {
    setUrl('');
    setImageTitle('');
    setDupeError(false);
    onClose();
  };

  const handleSave = () => {
    if (!url.trim()) return;
    const added = onSave(url.trim(), imageTitle.trim());
    if (!added) {
      setDupeError(true);
      return;
    }
    handleClose();
  };

  return (
    <SimpleDialog
      open={open}
      onClose={handleClose}
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
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setUrl(e.target.value);
              setDupeError(false);
            }}
            placeholder='https://…'
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            aria-describedby={dupeError ? 'add-img-dupe-error' : undefined}
          />
          {dupeError && (
            <p id='add-img-dupe-error' className='text-xs text-destructive'>
              This URL already exists in &quot;{targetFolder}&quot;.
            </p>
          )}
        </div>
      </div>
    </SimpleDialog>
  );
}
