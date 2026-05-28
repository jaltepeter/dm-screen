import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Image } from '../../store/imageStore';
import ImageThumbnail from './image-thumbnail';

interface ImageGridProps {
  images: Image[];
  onSendImage: (image: Image) => void;
}

export default function ImageGrid({ images, onSendImage }: ImageGridProps) {
  return (
    <div className='grid grid-cols-6 gap-2'>
      {images.map((image) => (
        <HoverCard key={image.id} openDelay={300}>
          <HoverCardTrigger asChild>
            <div>
              <ImageThumbnail
                image={image}
                imgClassName='w-full h-24 object-cover'
                action={
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-6 w-6 ml-auto'
                    onClick={() => onSendImage(image)}>
                    <Send className='h-3.5 w-3.5' />
                  </Button>
                }
              />
            </div>
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
      ))}
    </div>
  );
}
