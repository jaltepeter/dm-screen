import { Image, useImageStore } from '../../store/imageStore';

interface ImageThumbnailProps {
  image: Image;
  action: React.ReactNode;
  imgClassName?: string;
}

export default function ImageThumbnail({ image, action, imgClassName }: ImageThumbnailProps) {
  const setImageAspectRatio = useImageStore((s) => s.setImageAspectRatio);

  // Backfill aspect ratio the first time an image loads, so the player view
  // can lay it out by role (wide location vs square portrait) without measuring.
  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (image.aspectRatio != null) return;
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (naturalWidth && naturalHeight) {
      setImageAspectRatio(image.id, naturalWidth / naturalHeight);
    }
  };

  return (
    <div className='relative bg-card rounded overflow-hidden group'>
      <img
        src={image.url}
        alt={image.title}
        onLoad={handleLoad}
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
