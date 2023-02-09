import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import PropTypes from 'prop-types';
import SendIcon from '@mui/icons-material/Send';
import { useState } from 'react';

ImageSender.propTypes = {
  onSendImage: PropTypes.func
};

export default function ImageSender({ onSendImage }) {
  const [imageUrl, setImageUrl] = useState('');

  const handleChange = (event) => {
    setImageUrl(event.target.value);
  };

  const handleSendImage = () => {
    if (imageUrl) {
      onSendImage(imageUrl);
      setImageUrl('');
    }
  };

  const boxStyle = {
    width: '100%',
    p: 1
  };

  return (
    <Box sx={boxStyle}>
      <h2>Send an image to the player view</h2>
      <FormControl fullWidth>
        <InputLabel>Image URL</InputLabel>
        <OutlinedInput
          id='outlined'
          label='Image URL'
          value={imageUrl}
          onChange={handleChange}
          endAdornment={
            <InputAdornment position='end'>
              <IconButton aria-label='send to player view' onClick={handleSendImage} edge='end'>
                <SendIcon />
              </IconButton>
            </InputAdornment>
          }
        />
      </FormControl>
    </Box>
  );
}
