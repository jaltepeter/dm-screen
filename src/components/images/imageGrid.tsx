import { Trash2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Image } from '../../store/imageStore';

interface ImageGridProps {
  folderName: string;
  images: Image[];
  onSendImage: (image: Image) => void;
  onDeleteImage: (args: { folderName: string; image: Image }) => void;
}

export default function ImageGrid({
  folderName,
  images,
  onSendImage,
  onDeleteImage
}: ImageGridProps) {
  return (
    <div className='grid grid-cols-4 gap-2'>
      {images.map((image) => (
        <div key={image.url} className='relative bg-card rounded overflow-hidden group'>
          <img src={image.url} alt={image.title} className='w-full h-24 object-cover' />
          <div className='absolute inset-x-0 bottom-0 bg-black/60 flex items-center justify-between px-1 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity'>
            {image.title && (
              <span className='text-xs text-white/80 truncate flex-1 mr-1'>{image.title}</span>
            )}
            <div className='flex gap-0.5 ml-auto'>
              <Button
                variant='ghost'
                size='icon'
                className='h-6 w-6'
                onClick={() => onDeleteImage({ folderName, image })}>
                <Trash2 className='h-3.5 w-3.5' />
              </Button>
              <Button
                variant='ghost'
                size='icon'
                className='h-6 w-6'
                onClick={() => onSendImage(image)}>
                <Send className='h-3.5 w-3.5' />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
