import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Images } from 'lucide-react';
import ImageGrid from './imageGrid';
import { Image, ImageFolder } from '../../store/imageStore';

interface FolderListProps {
  folders: ImageFolder[];
  onSendImage: (image: Image) => void;
}

export default function FolderList({ folders, onSendImage }: FolderListProps) {
  if (folders.length === 0) {
    return (
      <div className='flex flex-col items-center gap-2 py-12 text-muted-foreground'>
        <Images className='h-8 w-8 opacity-25' />
        <p className='text-sm'>No folders yet. Use the menu to add some.</p>
      </div>
    );
  }

  return (
    <Accordion
      type='single'
      collapsible
      defaultValue={folders[0]?.folderName}
      className='space-y-1'>
      {folders.map((folder) => (
        <AccordionItem key={folder.folderName} value={folder.folderName} className='border rounded'>
          <AccordionTrigger className='px-3 hover:no-underline'>
            <span className='flex items-center gap-1.5 text-sm font-medium'>
              {folder.folderName}
              <span className='text-xs text-muted-foreground font-normal leading-none'>
                ({folder.images.length})
              </span>
            </span>
          </AccordionTrigger>
          <AccordionContent className='px-3 pb-3'>
            {folder.images.length > 0 ? (
              <ImageGrid images={folder.images} onSendImage={onSendImage} />
            ) : (
              <p className='text-sm text-muted-foreground py-2'>No images yet.</p>
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
