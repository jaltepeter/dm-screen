import { Image } from '../../store/imageStore';

interface ImageThumbnailProps {
  image: Image;
  action: React.ReactNode;
  imgClassName?: string;
}

export default function ImageThumbnail({ image, action, imgClassName }: ImageThumbnailProps) {
  return (
    <div className='relative bg-card rounded overflow-hidden group'>
      <img
        src={image.url}
        alt={image.title}
        className={
          imgClassName ??
          'w-full h-48 object-cover transition-transform duration-200 group-hover:scale-105'
        }
      />
      <div className='absolute inset-x-0 bottom-0 bg-black/60 flex items-center justify-between px-1 py-0.5 opacity-100'>
        {image.title && (
          <span className='text-xs text-white/80 truncate flex-1 mr-1'>{image.title}</span>
        )}
        {action}
      </div>
    </div>
  );
}
