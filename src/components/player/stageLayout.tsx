import { StageImage } from '../../lib/sync';

/** Images at or above this width/height ratio read as "wide" (location/backdrop). */
const WIDE_RATIO = 1.4;

function isWide(img: StageImage): boolean {
  return (img.aspectRatio ?? 1) >= WIDE_RATIO;
}

function Portrait({
  img,
  className = '',
  maxH = 'max-h-full'
}: {
  img: StageImage;
  className?: string;
  /** Tailwind max-height class bounding the image (keeps it off the focal point). */
  maxH?: string;
}) {
  return (
    <figure className={`relative flex items-end justify-center min-h-0 ${className}`}>
      <img
        src={img.url}
        alt={img.title}
        className={`min-h-0 ${maxH} max-w-full object-contain rounded-lg shadow-2xl shadow-black/60`}
      />
      {/* Name overlays the image bottom — no reserved band, so portraits line up. */}
      {img.title && (
        <figcaption className='absolute inset-x-0 bottom-2 flex justify-center px-2'>
          <span className='px-3 py-0.5 rounded-full bg-black/70 text-white/95 text-lg font-medium truncate max-w-[90%]'>
            {img.title}
          </span>
        </figcaption>
      )}
    </figure>
  );
}

/**
 * Lays images out by role inferred from aspect ratio:
 *  - one image            → full-screen contain
 *  - one wide + portraits → wide as backdrop, portraits as a bottom row
 *  - all portraits        → centered row
 *  - anything else        → contain grid
 */
export default function StageLayout({ images }: { images: StageImage[] }) {
  if (images.length === 0) return null;

  if (images.length === 1) {
    const img = images[0];
    return <img src={img.url} alt={img.title} className='w-full h-full object-contain' />;
  }

  const wides = images.filter(isWide);
  const portraits = images.filter((i) => !isWide(i));

  // Location + characters: backdrop scales to fit (whole image visible);
  // portraits are capped to the lower ~30vh and anchored to the bottom, so the
  // top ~70% of the scene (the focal point) is never covered. A scrim grounds them.
  if (wides.length === 1 && portraits.length >= 1) {
    const backdrop = wides[0];
    return (
      <div className='relative w-full h-full'>
        <img
          src={backdrop.url}
          alt={backdrop.title}
          className='absolute inset-0 w-full h-full object-contain object-top'
        />
        <div className='absolute inset-x-0 bottom-0 flex items-end justify-center gap-8 px-8 pb-4'>
          {portraits.map((img) => (
            <Portrait key={img.id} img={img} maxH='max-h-[30vh]' className='max-w-[32%]' />
          ))}
        </div>
      </div>
    );
  }

  // All portraits: even row across the middle.
  if (wides.length === 0) {
    return (
      <div className='flex items-center justify-center gap-6 w-full h-full p-6'>
        {portraits.map((img) => (
          <Portrait key={img.id} img={img} className='flex-1' />
        ))}
      </div>
    );
  }

  // Fallback: contain grid.
  const cols = images.length <= 4 ? 2 : 3;
  return (
    <div
      className='grid gap-3 w-full h-full p-3'
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
      {images.map((img) => (
        <img
          key={img.id}
          src={img.url}
          alt={img.title}
          className='w-full h-full min-h-0 object-contain'
        />
      ))}
    </div>
  );
}
