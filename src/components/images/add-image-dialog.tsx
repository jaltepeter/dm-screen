import { ChangeEvent, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SimpleDialog from '@/components/ui/simple-dialog';

interface AddImageDialogProps {
  open: boolean;
  onClose: () => void;
  targetFolder: string;
  onSave: (url: string, title: string) => boolean;
  initialValues?: { url: string; title: string };
}

export default function AddImageDialog({
  open,
  onClose,
  targetFolder,
  onSave,
  initialValues
}: AddImageDialogProps) {
  const isEdit = !!initialValues;
  const [url, setUrl] = useState(initialValues?.url ?? '');
  const [imageTitle, setImageTitle] = useState(initialValues?.title ?? '');
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
      title={isEdit ? 'Edit Image' : 'Add Image'}
      description={
        isEdit ? `Edit image in "${targetFolder}".` : `Save an image URL to "${targetFolder}".`
      }
      onSubmit={handleSave}
      submitDisabled={!url.trim()}>
      <div className='space-y-3'>
        <div className='space-y-1'>
          <Label htmlFor='add-img-title'>Title (optional)</Label>
          <Input
            id='add-img-title'
            value={imageTitle}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setImageTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
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
