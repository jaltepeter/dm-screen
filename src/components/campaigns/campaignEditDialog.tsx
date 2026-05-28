import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Campaign, nameToSlug, toBaseSlug } from '../../store/campaignStore';

interface CampaignEditDialogProps {
  open: boolean;
  campaign: Campaign | null;
  onClose: () => void;
  onSave: (patch: { name: string; slug: string; description?: string }) => void;
}

function CampaignEditForm({ campaign, onClose, onSave }: Omit<CampaignEditDialogProps, 'open'>) {
  const isNew = campaign === null;
  const [name, setName] = useState(campaign?.name ?? '');
  const [slug, setSlug] = useState(campaign?.slug ?? '');
  const [description, setDescription] = useState(campaign?.description ?? '');
  const [slugTouched, setSlugTouched] = useState(false);

  const slugChanged = !isNew && slug !== campaign.slug;

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugTouched && isNew) {
      setSlug(nameToSlug(value, 'preview').replace(/-[a-z0-9]{4}$/, ''));
    }
  };

  const handleSlugChange = (value: string) => {
    setSlugTouched(true);
    setSlug(toBaseSlug(value));
  };

  const handleSave = () => {
    if (!name.trim() || !slug.trim()) return;
    onSave({ name: name.trim(), slug: slug.trim(), description: description.trim() || undefined });
    onClose();
  };

  return (
    <div className='space-y-4'>
      <div className='space-y-1.5'>
        <Label htmlFor='campaign-name'>Name</Label>
        <Input
          id='campaign-name'
          autoFocus
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          placeholder='Curse of Strahd'
        />
      </div>

      <div className='space-y-1.5'>
        <Label htmlFor='campaign-slug'>Room code</Label>
        <Input
          id='campaign-slug'
          value={slug}
          onChange={(e) => handleSlugChange(e.target.value)}
          placeholder='curse-of-strahd-a3f2'
          className='font-mono text-sm'
        />
        {slugChanged && (
          <p className='flex items-start gap-1.5 text-xs text-amber-400'>
            <AlertTriangle className='h-3.5 w-3.5 shrink-0 mt-0.5' />
            Players using the old code won&apos;t be able to connect — share the new URL with them.
          </p>
        )}
      </div>

      <div className='space-y-1.5'>
        <Label htmlFor='campaign-description'>Description</Label>
        <Textarea
          id='campaign-description'
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder='A gothic horror campaign set in Barovia…'
          className='resize-none text-sm min-h-20'
        />
      </div>

      <DialogFooter>
        <Button variant='outline' onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!name.trim() || !slug.trim()}>
          {isNew ? 'Create' : 'Save'}
        </Button>
      </DialogFooter>
    </div>
  );
}

export default function CampaignEditDialog({
  open,
  campaign,
  onClose,
  onSave
}: CampaignEditDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>{campaign === null ? 'New Campaign' : 'Edit Campaign'}</DialogTitle>
        </DialogHeader>
        {open && <CampaignEditForm campaign={campaign} onClose={onClose} onSave={onSave} />}
      </DialogContent>
    </Dialog>
  );
}
