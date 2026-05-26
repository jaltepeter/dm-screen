import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Image } from '../../store/imageStore';

interface ImageGridProps {
  images: Image[];
  onSendImage: (image: Image) => void;
}

export default function ImageGrid({ images, onSendImage }: ImageGridProps) {
  return (
    <div className='grid grid-cols-4 gap-2'>
      {images.map((image) => (
        <div key={image.url} className='relative bg-card rounded overflow-hidden group'>
          <img
            src={image.url}
            alt={image.title}
            className='w-full h-24 object-cover transition-transform duration-200 group-hover:scale-105'
          />
          <div className='absolute inset-x-0 bottom-0 bg-black/60 flex items-center justify-between px-1 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity'>
            {image.title && (
              <span className='text-xs text-white/80 truncate flex-1 mr-1'>{image.title}</span>
            )}
            <Button
              variant='ghost'
              size='icon'
              className='h-6 w-6 ml-auto'
              onClick={() => onSendImage(image)}>
              <Send className='h-3.5 w-3.5' />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
