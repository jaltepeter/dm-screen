import Box from '@mui/material/Box';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import SendIcon from '@mui/icons-material/Send';
import { alpha } from '@mui/material'
import { styled } from '@mui/material/styles';

export default function ImageGrid({ images, onSend, onDelete }) {

  const gridContainerStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    position: 'relative'
  };

  const gridItemStyle = {
    margin: "auto",    
  };

  const imageStyle = {

  };

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
  }));

  return (
    <Box sx={gridContainerStyle} >
      {images.map((item) => (
        <Item position='relative' key={item}>
          <Box sx={gridItemStyle} position='relative' height='100%'>
            <Box component='img' src={item}
              width='100%'
              sx={{
                maxHeight: '250px',
                maxWidth: '250px',
                objectFit: 'contain',
                margin: 'auto'
              }}
            />
            <Box
              position="absolute"
              bottom="0px"
              width='100%'
              sx={overlayStyle}>
              <IconButton
                color="primary"
                aria-label="upload picture"
                component="label"
                sx={{
                  opacity: 1
                }}
                onClick={() => onDelete(item)}>
                <DeleteForeverIcon />
              </IconButton>
              <IconButton
                color="primary"
                aria-label="upload picture"
                component="label"
                sx={{
                  opacity: 1
                }}
                onClick={() => onSend(item)}>
                <SendIcon />
              </IconButton>
            </Box>
          </Box>
        </Item>
      ))}

    </Box>
  );
}