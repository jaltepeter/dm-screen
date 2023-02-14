import { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import InitiativePlayerView from '../components/initiative/initiativePlayerView';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { Section } from '../components/section';
import StarIcon from '@mui/icons-material/Star';
import Typography from '@mui/material/Typography';
import { display } from '@mui/system';

const PlayerView = () => {
  const broadcastChannel = new BroadcastChannel('dm-screen');

  const [imageSource, setImageSource] = useState('');
  const [actors, setActors] = useState([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    document.title = 'Player View';
  }, []);

  broadcastChannel.onmessage = (e) => {
    switch (e.data.cmd) {
      case 'image':
        setImageSource(e.data.payload);
        break;
      case 'init_show':
        break;

      case 'init_update':
        setActors(e.data.payload.actors);
        setIndex(e.data.payload.index);
        break;
      default:
        break;
    }
  };

  return (
    <Grid container spacing={0}>
      <Grid
        item
        alignContent='center'
        md={2}
        m={1}
        sx={{
          ...(actors.length <= 0 && { display: 'none' }),
          borderColor: '#1A2027',
          m: 1,
          border: 1,
          borderRadius: 2
        }}>
        <Typography sx={{ textAlign: 'center' }} variant='h4'>
          Initiative
        </Typography>
        <InitiativePlayerView actors={actors} turnNumber={index} />
      </Grid>
      <Grid item flex='1' container direction='column' height='100vh' width='100vw'>
        <Box
          component='img'
          src={imageSource.url}
          margin='auto'
          sx={{
            maxHeight: '99%',
            maxWidth: '99%'
          }}
        />
      </Grid>
    </Grid>
  );
};

export default PlayerView;
