import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';

export default function ImageGrid({ images, onSend }) {

  // Fixed number of columns
  const gridContainer = {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)"
  };

  // Variable number of columns
  const gridContainer2 = {
    display: "grid",
    gridAutoColumns: "1fr",
    gridAutoFlow: "column"
  };

  const gridItem = {
    margin: "8px",
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
    <Box sx={gridContainer} >
      {images.map((item) => (
        <Item>
          <Box sx={gridItem}>


            <img src={item}
              width='100%'
              onClick={() => onSend(item)}
            />

          </Box>
        </Item>
      ))}

    </Box>
  );
}