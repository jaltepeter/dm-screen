import Box from '@mui/material/Box';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import PropTypes from 'prop-types';
import SendIcon from '@mui/icons-material/Send';
import { alpha } from '@mui/material';
import { styled } from '@mui/material/styles';

ImageGrid.propTypes = {
  folderName: PropTypes.string,
  images: PropTypes.array,
  onSendImage: PropTypes.func,
  onDeleteImage: PropTypes.func
};

const Columns = 4;

export default function ImageGrid({ folderName, images, onSendImage, onDeleteImage }) {
  const gridContainerStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${Columns}, 1fr)`,
    position: 'relative'
  };

  const gridItemStyle = {
    margin: 'auto'
  };

  // const imageStyle = {};

  const overlayStyle = {
    background: alpha('#1A2027', 0.6)
  };

  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(2),
    margin: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    position: 'relative'
  }));

  return (
    <Box sx={gridContainerStyle}>
      {images.map((image) => (
        <Item key={image.url}>
          <Box sx={gridItemStyle} position='relative' height='100%'>
            <Box
              component='img'
              src={image.url}
              width='100%'
              sx={{
                maxHeight: '250px',
                maxWidth: '250px',
                objectFit: 'contain',
                margin: 'auto'
              }}
            />
            <Box position='absolute' bottom='0px' width='100%' sx={overlayStyle}>
              <IconButton
                color='primary'
                aria-label='upload picture'
                component='label'
                sx={{
                  opacity: 1
                }}
                onClick={() => onDeleteImage({ folderName, image })}>
                <DeleteForeverIcon />
              </IconButton>
              <IconButton
                color='primary'
                aria-label='upload picture'
                component='label'
                sx={{
                  opacity: 1
                }}
                onClick={() => onSendImage(image)}>
                <SendIcon />
              </IconButton>
            </Box>
          </Box>
        </Item>
      ))}
    </Box>
  );
}
