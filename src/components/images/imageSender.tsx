import { ChangeEvent, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Send } from 'lucide-react';
import { Image } from '../../store/imageStore';

interface ImageSenderProps {
  onSendImage: (image: Image) => void;
}

export default function ImageSender({ onSendImage }: ImageSenderProps) {
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setImageUrl(event.target.value);
    setError(null);
  };

  const handleSend = () => {
    const url = imageUrl.trim();
    if (!url) return;
    setLoading(true);
    setError(null);
    const img = new window.Image();
    img.onload = () => {
      onSendImage({ id: crypto.randomUUID(), url });
      setImageUrl('');
      setLoading(false);
    };
    img.onerror = () => {
      setError("That URL didn't load as an image.");
      setLoading(false);
    };
    img.src = url;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className='flex flex-col gap-1'>
      <div className='flex gap-2'>
        <Input
          placeholder='Paste image URL…'
          value={imageUrl}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className='flex-1'
        />
        <Button onClick={handleSend} disabled={!imageUrl.trim() || loading} size='sm'>
          {loading ? <Loader2 className='h-4 w-4 animate-spin' /> : <Send className='h-4 w-4' />}
        </Button>
      </div>
      {error && <p className='text-xs text-destructive'>{error}</p>}
    </div>
  );
}
