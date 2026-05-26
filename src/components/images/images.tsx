import FolderList from './folder-list';
import ImageSender from './imageSender';
import { sendMessage } from '../../lib/sync';
import { useImageStore, Image } from '../../store/imageStore';
import { useUiStore } from '../../store/uiStore';

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
        <h2 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2'>
          Quick Send
        </h2>
        <ImageSender onSendImage={sendImageToPlayerView} />
      </section>

      <section>
        <h2 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2'>
          Saved Images
        </h2>
        <FolderList folders={folders} onSendImage={sendImageToPlayerView} />
      </section>
    </div>
  );
}
