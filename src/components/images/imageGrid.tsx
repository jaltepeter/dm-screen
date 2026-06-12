import { Check, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Image } from '../../store/imageStore';
import ImageThumbnail from './image-thumbnail';
import { cn } from '../../lib/utils';

interface ImageGridProps {
  images: Image[];
  stagedIds: Set<string>;
  onToggleImage: (image: Image) => void;
}

export default function ImageGrid({ images, stagedIds, onToggleImage }: ImageGridProps) {
  return (
    <div className='grid grid-cols-6 gap-2'>
      {images.map((image) => {
        const staged = stagedIds.has(image.id);
        return (
          <HoverCard key={image.id} openDelay={300}>
            <HoverCardTrigger asChild>
              <button
                type='button'
                onClick={() => onToggleImage(image)}
                className={cn(
                  'block text-left rounded ring-2 ring-offset-1 ring-offset-background transition-shadow',
                  staged ? 'ring-primary' : 'ring-transparent'
                )}>
                <ImageThumbnail
                  image={image}
                  imgClassName='w-full h-24 object-cover'
                  action={
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-6 w-6 ml-auto pointer-events-none'
                      tabIndex={-1}>
                      {staged ? (
                        <Check className='h-3.5 w-3.5 text-primary' />
                      ) : (
                        <Plus className='h-3.5 w-3.5' />
                      )}
                    </Button>
                  }
                />
              </button>
            </HoverCardTrigger>
            <HoverCardContent side='right' sideOffset={8} className='w-[min(480px,55vw)] p-2'>
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
        );
      })}
    </div>
  );
}
