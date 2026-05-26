import { Button } from '@/components/ui/button';
import { Users, Images, Upload, Download } from 'lucide-react';

interface DrawerContentsProps {
  onImport: () => void;
  onExport: () => void;
  onClickManageCharacters: () => void;
  onClickManageImages: () => void;
}

export default function DrawerContents({
  onImport,
  onExport,
  onClickManageCharacters,
  onClickManageImages
}: DrawerContentsProps) {
  return (
    <div className='flex flex-col gap-1 p-2'>
      <Button variant='ghost' className='justify-start gap-2' onClick={onClickManageCharacters}>
        <Users className='h-4 w-4' />
        Manage Characters
      </Button>
      <Button variant='ghost' className='justify-start gap-2' onClick={onClickManageImages}>
        <Images className='h-4 w-4' />
        Manage Images
      </Button>
      <div className='h-px bg-border my-1' />
      <Button variant='ghost' className='justify-start gap-2' onClick={onExport}>
        <Upload className='h-4 w-4' />
        Export Data
      </Button>
      <Button variant='ghost' className='justify-start gap-2' onClick={onImport}>
        <Download className='h-4 w-4' />
        Import Data
      </Button>
    </div>
  );
}
