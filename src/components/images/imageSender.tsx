import { ChangeEvent, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { Image } from '../../store/imageStore';

interface ImageSenderProps {
  onSendImage: (image: Image) => void;
}

export default function ImageSender({ onSendImage }: ImageSenderProps) {
  const [imageUrl, setImageUrl] = useState('');

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setImageUrl(event.target.value);
  };

  const handleSend = () => {
    if (imageUrl.trim()) {
      onSendImage({ url: imageUrl.trim() });
      setImageUrl('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className='flex gap-2'>
      <Input
        placeholder='Paste image URL…'
        value={imageUrl}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className='flex-1'
      />
      <Button onClick={handleSend} disabled={!imageUrl.trim()} size='sm'>
        <Send className='h-4 w-4' />
      </Button>
    </div>
  );
}
