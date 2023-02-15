import { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import InitiativePlayerView from '../components/characters/initiative/initiativePlayerView';
import Slide from '@mui/material/Slide';
import Typography from '@mui/material/Typography';

const PlayerView = () => {
  const broadcastChannel = new BroadcastChannel('dm-screen');

  const [imageSource, setImageSource] = useState('');
  const [actors, setActors] = useState([]);
  const [index, setIndex] = useState(0);
  const [showInit, setShowInit] = useState(false);

  useEffect(() => {
    document.title = 'Player View';
  }, []);

  useEffect(() => {
    setShowInit(actors.length > 0);
  }, [actors]);

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
      <Slide direction='right' timeout={500} in={showInit} mountOnEnter unmountOnExit>
        <Grid
          item
          alignContent='center'
          md={2}
          m={1}
          sx={{
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
      </Slide>
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
