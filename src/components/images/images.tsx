import FolderList from './folder-list';
import ImageSender from './imageSender';
import { sendMessage } from '../../lib/sync';
import { useImageStore } from '../../store/imageStore';
import { useUiStore } from '../../store/uiStore';
import { Image } from '../../store/imageStore';

export default function Images() {
  const folders = useImageStore((s) => s.folders);
  const createFolder = useImageStore((s) => s.createFolder);
  const renameFolder = useImageStore((s) => s.renameFolder);
  const deleteFolder = useImageStore((s) => s.deleteFolder);
  const addImage = useImageStore((s) => s.addImage);
  const deleteImage = useImageStore((s) => s.deleteImage);
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
        <FolderList
          folders={folders}
          onCreateFolder={createFolder}
          onRenameFolder={renameFolder}
          onDeleteFolder={deleteFolder}
          onSendImage={sendImageToPlayerView}
          onAddPhoto={addImage}
          onDeleteImage={({ folderName, image }) => deleteImage(folderName, image)}
        />
      </section>
    </div>
  );
}
