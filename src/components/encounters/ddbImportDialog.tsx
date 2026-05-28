import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { StatBlock } from '../../store/encounterStore';
import { parseDdbStatBlock } from '../../lib/ddbParser';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (partial: Omit<StatBlock, 'id'>) => void;
}

export default function DdbImportDialog({ isOpen, onClose, onSelect }: Props) {
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Import from D&amp;D Beyond</DialogTitle>
        </DialogHeader>
        <div className='space-y-3'>
          <p className='text-sm text-muted-foreground'>
            Go to a monster page on D&amp;D Beyond, select all stat block content, copy it, then
            paste below.
          </p>
          <Textarea
            autoFocus
            placeholder='Paste here…'
            className='text-sm resize-none h-10'
            onPaste={(e) => {
              e.preventDefault();
              setError(null);
              if (!e.clipboardData.types.includes('text/html')) {
                setError(
                  "Couldn't find a D&D Beyond stat block. Make sure you've copied from a monster page."
                );
                return;
              }
              const result = parseDdbStatBlock(e.clipboardData.getData('text/html'));
              if (!result) {
                setError(
                  "Couldn't find a D&D Beyond stat block. Make sure you've copied from a monster page."
                );
                return;
              }
              onSelect(result);
              handleClose();
            }}
          />
          {error && <p className='text-sm text-destructive'>{error}</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
