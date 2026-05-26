import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface FullscreenDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function FullscreenDialog({
  open,
  onClose,
  title,
  children
}: FullscreenDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className='top-0 left-0 translate-x-0 translate-y-0 flex h-screen max-h-screen w-screen max-w-none sm:max-w-none m-0 rounded-none p-0 gap-0 flex-col'>
        <DialogHeader className='px-4 py-3 border-b shrink-0'>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
