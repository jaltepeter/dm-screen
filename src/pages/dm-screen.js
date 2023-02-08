import { useEffect, useState } from 'react';

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

const DmScreen = () => {

  const [message, setMessage] = useState('');

  const [updated, setUpdated] = useState(message);

  const authChannel = new BroadcastChannel('auth');

  useEffect(() => {
    document.title = "DM Screen";
  }, []);

  const handleChange = (event) => {
    setMessage(event.target.value);
  };

  const handleBroadcastImage = () => {
    authChannel.postMessage({ cmd: 'image', payload: message });
    setUpdated(message);
  };

  const handleOpenPlayerView = () => {
    window.open('/players', '_blank');
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
    </div>
  );
};

export default DmScreen;