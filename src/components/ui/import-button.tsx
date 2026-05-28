import { forwardRef, useImperativeHandle, useRef } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
          if (file) importData(file);
          e.target.value = '';
        }}
      />
    </>
  );
});

export default ImportButton;
