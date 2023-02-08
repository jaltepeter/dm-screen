import { useEffect, useState } from 'react';
import { useMediaQuery } from '@mui/material';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import PanoramaIcon from '@mui/icons-material/Panorama';
import SendIcon from '@mui/icons-material/Send';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import ImageList  from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem'

const DmScreen = () => {

  const [message, setMessage] = useState('');
  const [images, setImages] = useState(() => {
    const saved = localStorage.getItem('images');
    const initialValue = JSON.parse(saved);
    return initialValue || [];
  });

  const authChannel = new BroadcastChannel('auth');

  useEffect(() => {
    document.title = "DM Screen";
  }, []);

  useEffect(() => {
    console.debug('saving images');
    localStorage.setItem('images', JSON.stringify(images));
  }, [images]);

  const handleChange = (event) => {
    setMessage(event.target.value);
  };

  const handleImageClick = (item) => {
    authChannel.postMessage({ cmd: 'image', payload: item });
  }

  const handleBroadcastImage = () => {
    if (!images.includes(message)) {
      setImages([...images, message]);
    }
    authChannel.postMessage({ cmd: 'image', payload: message });
  };

  const handleOpenPlayerView = () => {
    window.open('/dm-screen/players', '_blank');
  };

  const matches = useMediaQuery('(min-width:600px)');

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
      <Box sx={{ width: '100%', height: 450, overflowY: 'scroll' }}>
      <ImageList variant="masonry" cols={5} gap={8}>
        {images.map((item) => (
          <ImageListItem key={item}
          >
            <img
              src={`${item}?w=248&fit=crop&auto=format`}
              srcSet={`${item}?w=248&fit=crop&auto=format&dpr=2 2x`}
              loading="lazy"   
              onClick={() => handleImageClick(item)}           
            />
          </ImageListItem>
        ))}
      </ImageList>
      </Box>
    </div>
  );
};

export default DmScreen;