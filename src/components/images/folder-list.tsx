import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Check, Images, Plus } from 'lucide-react';
import ImageGrid from './imageGrid';
import ImageThumbnail from './image-thumbnail';
import { Button } from '@/components/ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Image, ImageFolder } from '../../store/imageStore';
import { cn } from '../../lib/utils';

interface FolderListProps {
  folders: ImageFolder[];
  search: string;
  stagedIds: Set<string>;
  onToggleImage: (image: Image) => void;
}

export default function FolderList({ folders, search, stagedIds, onToggleImage }: FolderListProps) {
  const [openFolder, setOpenFolder] = useState<string>(folders[0]?.folderName ?? '');

  if (folders.length === 0) {
    return (
      <div className='flex flex-col items-center gap-2 py-12 text-muted-foreground'>
        <Images className='h-8 w-8 opacity-25' />
        <p className='text-sm'>No folders yet. Use the menu to add some.</p>
      </div>
    );
  }

  const sortedFolders = [...folders].sort((a, b) => a.displayOrder - b.displayOrder);

  if (search) {
    const term = search.toLowerCase();
    const matches = sortedFolders.flatMap((folder) =>
      [...folder.images]
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .filter((img) =>
          img.title ? img.title.toLowerCase().includes(term) : img.url.toLowerCase().includes(term)
        )
        .map((img) => ({ img, folderName: folder.folderName }))
    );

    if (matches.length === 0) {
      return <p className='text-sm text-muted-foreground py-2'>No matching images.</p>;
    }

    return (
      <div className='grid grid-cols-6 gap-2'>
        {matches.map(({ img, folderName }) => {
          const staged = stagedIds.has(img.id);
          return (
            <HoverCard key={img.id} openDelay={300}>
              <HoverCardTrigger asChild>
                <button
                  type='button'
                  onClick={() => onToggleImage(img)}
                  className={cn(
                    'block text-left rounded ring-2 ring-offset-1 ring-offset-background transition-shadow',
                    staged ? 'ring-primary' : 'ring-transparent'
                  )}>
                  <ImageThumbnail
                    image={img}
                    imgClassName='w-full h-24 object-cover'
                    action={
                      <>
                        <span className='text-xs text-white/50 truncate flex-1 mr-1'>
                          {folderName}
                        </span>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-6 w-6 shrink-0 pointer-events-none'
                          tabIndex={-1}>
                          {staged ? (
                            <Check className='h-3.5 w-3.5 text-primary' />
                          ) : (
                            <Plus className='h-3.5 w-3.5' />
                          )}
                        </Button>
                      </>
                    }
                  />
                </button>
              </HoverCardTrigger>
              <HoverCardContent side='right' sideOffset={8} className='w-[min(480px,55vw)] p-2'>
                <img
                  src={img.url}
                  alt={img.title}
                  className='w-full rounded object-contain max-h-[70vh]'
                />
                {img.title && (
                  <p className='text-xs text-muted-foreground mt-1 truncate'>{img.title}</p>
                )}
                <p className='text-xs text-muted-foreground/60 mt-0.5 truncate'>{folderName}</p>
              </HoverCardContent>
            </HoverCard>
          );
        })}
      </div>
    );
  }

  return (
    <Accordion
      type='single'
      collapsible
      value={openFolder}
      onValueChange={setOpenFolder}
      className='space-y-1'>
      {sortedFolders.map((folder) => {
        const sortedImages = [...folder.images].sort((a, b) => a.displayOrder - b.displayOrder);
        return (
          <AccordionItem
            key={folder.folderName}
            value={folder.folderName}
            className='border rounded'>
            <AccordionTrigger className='px-3 hover:no-underline'>
              <span className='flex items-center gap-1.5 text-sm font-medium'>
                {folder.folderName}
                <span className='text-xs text-muted-foreground font-normal leading-none'>
                  ({sortedImages.length})
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent className='px-3 pb-3'>
              {sortedImages.length > 0 ? (
                <ImageGrid
                  images={sortedImages}
                  stagedIds={stagedIds}
                  onToggleImage={onToggleImage}
                />
              ) : (
                <p className='text-sm text-muted-foreground py-2'>No images yet.</p>
              )}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
