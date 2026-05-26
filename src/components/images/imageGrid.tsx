import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Image } from '../../store/imageStore';
import ImageThumbnail from './image-thumbnail';

interface ImageGridProps {
  images: Image[];
  onSendImage: (image: Image) => void;
}

export default function ImageGrid({ images, onSendImage }: ImageGridProps) {
  return (
    <div className='grid grid-cols-4 gap-2'>
      {images.map((image) => (
        <ImageThumbnail
          key={image.url}
          image={image}
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
      ))}
    </div>
  );
}
