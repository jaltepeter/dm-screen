import { useState } from 'react';
import FolderList from './folder-list';
import ImageSender from './imageSender';
import { sendMessage } from '../../lib/sync';
import { useImageStore, Image } from '../../store/imageStore';
import { useUiStore } from '../../store/uiStore';
import SectionHeader from '@/components/ui/section-header';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';

export default function Images() {
  const folders = useImageStore((s) => s.folders);
  const setLastSentImage = useUiStore((s) => s.setLastSentImage);
  const [search, setSearch] = useState('');

  const sendImageToPlayerView = (item: Image) => {
    sendMessage({ cmd: 'image', payload: item });
    setLastSentImage(item);
  };

  return (
    <div className='space-y-4'>
      <section>
        <SectionHeader className='mb-2'>Quick Send</SectionHeader>
        <ImageSender onSendImage={sendImageToPlayerView} />
      </section>

      <section>
        <SectionHeader className='mb-2'>Saved Images</SectionHeader>
        <div className='relative mb-3'>
          <Input
            placeholder='Search images…'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='pr-8'
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className='absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'>
              <X className='h-4 w-4' />
            </button>
          )}
        </div>
        <FolderList folders={folders} search={search} onSendImage={sendImageToPlayerView} />
      </section>
    </div>
  );
}
