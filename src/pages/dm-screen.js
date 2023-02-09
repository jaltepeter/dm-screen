import { useEffect, useState } from 'react';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FolderList from '../components/folder-list';
import ImageSender from '../components/imageSender';
import PanoramaIcon from '@mui/icons-material/Panorama';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

const DmScreen = () => {

  const pageTitle = 'Dm Screen';

  const localStorageKey_ImageData = 'imageData'

  const broadcastChannel = new BroadcastChannel('auth');

  const [localStorageData, setData] = useState(() => {
    const initialData = JSON.parse(localStorage.getItem(localStorageKey_ImageData));
    return initialData ||
      [{
        folderName: 'Goblins',
        images: ['https://legendary-digital-network-assets.s3.amazonaws.com/geekandsundry/wp-content/uploads/2016/11/goblin-step1.png']
      }];
  });

  useEffect(() => {
    document.title = pageTitle;
  }, []);

  useEffect(() => {
    localStorage.setItem(localStorageKey_ImageData, JSON.stringify(localStorageData));
  }, [localStorageData]); 

  const handleAddPhoto = ({ folderName, url }) => {
    setData(
      localStorageData.map((folder) =>
        folder.folderName === folderName
          ? { ...folder, images: [...folder.images, url] }
          : { ...folder }
      )
    );
  };

  const handleOpenPlayerView = () => {
    window.open('/dm-screen/players', '_blank');
  };

  const handleEvent = (item) => {
    sendImageToPlayerView(item);
  };

  const handleDelete = ({ folderName, url }) => {
    setData(
      localStorageData.map((folder) =>
        folder.folderName === folderName
          ? { ...folder, images: folder.images.filter(e => e !== url) }
          : { ...folder }
      )
    );
  }

  const sendImageToPlayerView = (url) => {
    broadcastChannel.postMessage({ cmd: 'image', payload: url });
  };

  return (
    <div>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position='static'>
          <Toolbar>
            <Typography
              variant='h6'
              component='div'
              sx={{ flexGrow: 1 }}>
              DM Screen
            </Typography>
            <Button
              color='inherit'
              variant='outlined'
              onClick={handleOpenPlayerView}
              endIcon={<PanoramaIcon />}
            >Open Player View</Button>
          </Toolbar>
        </AppBar>
      </Box>
      <ImageSender onSendImage={handleEvent} />
      <Box m={2}>
        <FolderList
          images={localStorageData}
          onSendImage={handleEvent}
          onAddPhoto={handleAddPhoto}
          onDeleteImage={handleDelete} />
      </Box>
    </div>
  );
};

export default DmScreen;