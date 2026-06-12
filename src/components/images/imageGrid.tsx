import { Check, EyeOff, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Image } from '../../store/imageStore';
import ImageThumbnail from './image-thumbnail';
import NameToggle from './name-toggle';
import { cn } from '../../lib/utils';

interface ImageGridProps {
  images: Image[];
  stagedIds: Set<string>;
  nameShownIds: Set<string>;
  onToggleImage: (image: Image) => void;
  onToggleName: (image: Image) => void;
}

export default function ImageGrid({
  images,
  stagedIds,
  nameShownIds,
  onToggleImage,
  onToggleName
}: ImageGridProps) {
  return (
    <div className='grid grid-cols-6 gap-2'>
      {images.map((image) => {
        const staged = stagedIds.has(image.id);
        return (
          <div key={image.id} className='relative'>
            <HoverCard openDelay={300} closeDelay={0}>
              <HoverCardTrigger asChild>
                <button
                  type='button'
                  onClick={() => onToggleImage(image)}
                  className={cn(
                    'block w-full text-left rounded ring-2 ring-offset-1 ring-offset-background transition-shadow',
                    staged ? 'ring-primary' : 'ring-transparent'
                  )}>
                  <ImageThumbnail
                    image={image}
                    imgClassName='w-full h-24 object-cover'
                    action={
                      <div className='flex items-center gap-1 ml-auto'>
                        {image.hideName && image.title && (
                          <EyeOff
                            className='h-3.5 w-3.5 text-amber-400'
                            aria-label='Name hidden from players by default'
                          />
                        )}
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-6 w-6 pointer-events-none'
                          tabIndex={-1}>
                          {staged ? (
                            <Check className='h-3.5 w-3.5 text-primary' />
                          ) : (
                            <Plus className='h-3.5 w-3.5' />
                          )}
                        </Button>
                      </div>
                    }
                  />
                </button>
              </HoverCardTrigger>
              <HoverCardContent
                side='right'
                sideOffset={8}
                className='pointer-events-none w-[min(480px,55vw)] p-2'>
                <img
                  src={image.url}
                  alt={image.title}
                  className='w-full rounded object-contain max-h-[70vh]'
                />
                {image.title && (
                  <p className='text-xs text-muted-foreground mt-1 truncate'>{image.title}</p>
                )}
              </HoverCardContent>
            </HoverCard>
            {staged && image.title && (
              <NameToggle shown={nameShownIds.has(image.id)} onClick={() => onToggleName(image)} />
            )}
          </div>
        );
      })}
    </div>
  );
}
