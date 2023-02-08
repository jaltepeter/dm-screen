import { Accordion, useMediaQuery } from '@mui/material';
import { useEffect, useState } from 'react';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FileCopyIcon from '@mui/icons-material/FileCopyOutlined';
import FolderList from '../components/folder-list';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import PanoramaIcon from '@mui/icons-material/Panorama';
import PrintIcon from '@mui/icons-material/Print';
import SaveIcon from '@mui/icons-material/Save';
import SendIcon from '@mui/icons-material/Send';
import ShareIcon from '@mui/icons-material/Share';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

const DmScreen = () => {

  const [message, setMessage] = useState('');
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('images');
    const initialValue = JSON.parse(saved);
    return initialValue || [{ folderName: 'Goblins', images: ["https://legendary-digital-network-assets.s3.amazonaws.com/geekandsundry/wp-content/uploads/2016/11/goblin-step1.png"] }];
  });

  const authChannel = new BroadcastChannel('auth');

  useEffect(() => {
    document.title = "DM Screen";
  }, []);

  useEffect(() => {
    console.debug('saving images');
    localStorage.setItem('images', JSON.stringify(data));
  }, [data]);

  const handleChange = (event) => {
    setMessage(event.target.value);
  };

  const handleAddPhoto = ({ folderName, url }) => {
    console.log(`Adding photo ${url} to ${folderName}`);
    setData(
      data.map((folder) =>
        folder.folderName === folderName
          ? { ...folder, images: [...folder.images, url] }
          : { ...folder }
      )
    );
  };

  const handleBroadcastImage = () => {
    if (!data.includes(message)) {
      setData([...data, message]);
    }
    sendImage(message);
    setMessage('');
  };

  const handleOpenPlayerView = () => {
    window.open('/dm-screen/players', '_blank');
  };

  const matches = useMediaQuery('(min-width:600px)');

  const handleEvent = (item) => {
    sendImage(item);
  };

  const handleDelete = (item) => {
    deleteImage(item);
  }

  const deleteImage = ({ folderName, url }) => {
    console.log(data);

    setData(
      data.map((folder) =>
        folder.folderName === folderName
          ? { ...folder, images: folder.images.filter(e => e !== url) }
          : { ...folder }
      )
    );
  }

  const sendImage = (url) => {
    authChannel.postMessage({ cmd: 'image', payload: url });
  };

  return (
    <div>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              DM Screen
            </Typography>
            <Button color="inherit" variant='outlined' onClick={handleOpenPlayerView} endIcon={<PanoramaIcon />}>Open Player View</Button>
          </Toolbar>
        </AppBar>
      </Box>
      <Box sx={{ width: '100%', p: 1 }}>
        <h2>Send an image to the player view</h2>
        <FormControl fullWidth sx={{ m: 0 }}>
          <InputLabel htmlFor="outlined-adornment-amount">Image URL</InputLabel>
          <OutlinedInput
            id="outlined"
            label="Image URL"
            value={message}
            onChange={handleChange}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="send to player view"
                  onClick={handleBroadcastImage}
                  edge='end'><SendIcon /></IconButton>
              </InputAdornment>
            }
          />
        </FormControl>
      </Box>
      <Box m={2}>
        <FolderList images={data} onSendImage={handleEvent} onAddPhoto={handleAddPhoto} onDeleteImage={deleteImage} />
      </Box>

    </div>
  );
};

export default DmScreen;