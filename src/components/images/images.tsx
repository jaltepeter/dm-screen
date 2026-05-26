import FolderList from './folder-list';
import ImageSender from './imageSender';
import { sendMessage } from '../../lib/sync';
import { useImageStore, Image } from '../../store/imageStore';
import { useUiStore } from '../../store/uiStore';
import SectionHeader from '@/components/ui/section-header';

export default function Images() {
  const folders = useImageStore((s) => s.folders);
  const setLastSentImage = useUiStore((s) => s.setLastSentImage);

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
        <FolderList folders={folders} onSendImage={sendImageToPlayerView} />
      </section>
    </div>
  );
}
