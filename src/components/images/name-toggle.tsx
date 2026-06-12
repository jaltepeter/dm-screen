import { Eye, EyeOff } from 'lucide-react';

interface NameToggleProps {
  /** Whether the name is currently shown to players. */
  shown: boolean;
  onClick: () => void;
}

/**
 * Overlay button shown on a staged image tile. Flips whether the image's name is
 * sent to players right now — independent of the saved "hide name" setting.
 */
export default function NameToggle({ shown, onClick }: NameToggleProps) {
  return (
    <button
      type='button'
      onClick={onClick}
      title={
        shown ? 'Name shown to players — click to hide' : 'Name hidden from players — click to show'
      }
      aria-label={shown ? 'Hide name from players' : 'Show name to players'}
      className='absolute top-1 right-1 z-10 inline-flex h-6 w-6 items-center justify-center rounded bg-black/70 text-white hover:bg-black/90'>
      {shown ? <Eye className='h-3.5 w-3.5' /> : <EyeOff className='h-3.5 w-3.5' />}
    </button>
  );
}
