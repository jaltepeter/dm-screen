import { ChangeEvent, useState } from 'react';

import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import SendIcon from '@mui/icons-material/Send';
import { Typography } from '@mui/material';
import { Image } from '../../store/imageStore';

interface ImageSenderProps {
  onSendImage: (image: Image) => void;
}

export default function ImageSender({ onSendImage }: ImageSenderProps) {
  const [imageUrl, setImageUrl] = useState('');

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setImageUrl(event.target.value);
  };

  const handleSendImage = () => {
    if (imageUrl) {
      onSendImage({ url: imageUrl });
      setImageUrl('');
    }
  };

  const boxStyle = {
    width: '100%',
    p: 1
  };

  return (
    <Box sx={boxStyle}>
      <Typography variant='h4'>Send an image to the player view</Typography>
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
