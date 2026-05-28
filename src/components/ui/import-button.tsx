import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ConfirmDialog from '@/components/ui/confirmDialog';
import { importData } from '@/lib/exportImport';

interface ImportButtonProps {
  variant?: React.ComponentProps<typeof Button>['variant'];
  size?: React.ComponentProps<typeof Button>['size'];
  className?: string;
  children?: React.ReactNode;
}

export interface ImportButtonHandle {
  openFileDialog: () => void;
}

const ImportButton = forwardRef<ImportButtonHandle, ImportButtonProps>(function ImportButton(
  { variant = 'outline', size = 'sm', className, children },
  ref
) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  useImperativeHandle(ref, () => ({
    openFileDialog: () => fileInputRef.current?.click()
  }));

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => fileInputRef.current?.click()}>
        {children ?? (
          <>
            <Download className='h-4 w-4' />
            Import
          </>
        )}
      </Button>
      <input
        ref={fileInputRef}
        type='file'
        accept='.json'
        className='hidden'
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) setPendingFile(file);
          e.target.value = '';
        }}
      />
      <ConfirmDialog
        open={pendingFile !== null}
        title='Overwrite all data?'
        description='This will replace all campaigns, characters, encounters, images, and notes with the contents of the file. This cannot be undone.'
        confirmLabel='Import'
        onConfirm={() => {
          if (pendingFile) importData(pendingFile);
          setPendingFile(null);
        }}
        onCancel={() => setPendingFile(null)}
      />
    </>
  );
});

export default ImportButton;
