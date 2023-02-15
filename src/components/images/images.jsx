import { getLocalStorageImages, saveImages } from '../../data/localStorageManager';
import { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import { DefaultImages } from '../../data/defaultData';
import FolderList from './folder-list';
import Grid from '@mui/material/Grid';
import ImageSender from './imageSender';
import { Section } from '../section';
import Typography from '@mui/material/Typography';

export default function Images() {
  const [images, setImages] = useState(() => {
    return getLocalStorageImages() || DefaultImages();
  });

  useEffect(() => {
    saveImages(images);
  }, [images]);

  const handleCreateFolder = () => {
    const numNewFolders = images.filter((f) => f.folderName.startsWith('New Folder')).length;
    const suffix = numNewFolders > 0 ? ` ${numNewFolders + 1}` : '';
    const newFolder = {
      folderName: `New Folder${suffix}`,
      images: []
    };
    setImages([...images, newFolder]);
  };

  const handleRenameFolder = (oldFolderName, newFolderName) => {
    const folders = images.map((f) =>
      f.folderName === oldFolderName ? { ...f, folderName: newFolderName } : f
    );
    setImages(folders);
  };

  const handleDeleteFolder = (folderName) => {
    setImages(images.filter((i) => i.folderName != folderName));
  };

  const handleEvent = (item) => {
    sendImageToPlayerView(item);
  };

  const broadcastChannel = new BroadcastChannel('dm-screen');

  const sendImageToPlayerView = (url) => {
    broadcastChannel.postMessage({ cmd: 'image', payload: url });
  };

  /**
   * Add a new image to the specified folder
   * @param {string} folderName - The name of the folder to add images to
   * @param {string} url - URL of the image to add
   */
  const handleAddImage = (folderName, url) => {
    if (!url) return;

    const imageFolders = images.map((folder) =>
      folder.folderName === folderName
        ? { ...folder, images: [...folder.images, { url: url }] }
        : { ...folder }
    );
    setImages(imageFolders);
  };

  const handleDeleteImage = ({ folderName, image }) => {
    const imageFolders = images.map((folder) =>
      folder.folderName === folderName
        ? { ...folder, images: folder.images.filter((i) => i !== image) }
        : { ...folder }
    );
    setImages(imageFolders);
  };

  return (
    <Grid container spacing={2} mb={2} alignItems='stretch'>
      <Grid item md={8} sm={12}>
        <Section>
          <Typography variant='h4'>Saved Images</Typography>
          <Box m={1}>
            <FolderList
              folders={images}
              onCreateFolder={handleCreateFolder}
              onRenameFolder={handleRenameFolder}
              onDeleteFolder={handleDeleteFolder}
              onSendImage={handleEvent}
              onAddPhoto={handleAddImage}
              onDeleteImage={handleDeleteImage}
            />
          </Box>
        </Section>
      </Grid>
      <Grid item md={4} sm={12}>
        <Section>
          <ImageSender onSendImage={handleEvent} />
        </Section>
      </Grid>
    </Grid>
  );
}
