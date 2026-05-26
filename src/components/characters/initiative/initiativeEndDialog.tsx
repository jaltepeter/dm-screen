import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface InitiativeEndDialogProps {
  isOpen: boolean;
  handleClose: () => void;
  handleEndInitiative: () => void;
}

export default function InitiativeEndDialog({
  isOpen,
  handleClose,
  handleEndInitiative
}: InitiativeEndDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>End Initiative?</DialogTitle>
          <DialogDescription>
            This will end the current combat and delete all entries from the initiative tracker.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant='outline' onClick={handleClose}>
            Cancel
          </Button>
          <Button variant='destructive' onClick={handleEndInitiative}>
            End Initiative
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
