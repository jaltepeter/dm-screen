import { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import InitiativePlayerView from '../components/characters/initiative/initiativePlayerView';
import Slide from '@mui/material/Slide';
import Typography from '@mui/material/Typography';
import { Actor, onMessage } from '../lib/sync';

export default function PlayerView() {
  const [imageSource, setImageSource] = useState<{ url: string; title?: string } | null>(null);
  const [actors, setActors] = useState<Actor[]>([]);
  const [index, setIndex] = useState(0);

  const showInit = actors.length > 0;

  useEffect(() => {
    document.title = 'Player View';
  }, []);

  useEffect(() => {
    return onMessage((msg) => {
      switch (msg.cmd) {
        case 'image':
          setImageSource(msg.payload);
          break;
        case 'init_update':
          setActors(msg.payload.actors);
          setIndex(msg.payload.index);
          break;
      }
    });
  }, []);

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
        {imageSource && (
          <Box
            component='img'
            src={imageSource.url}
            margin='auto'
            sx={{
              maxHeight: '99%',
              maxWidth: '99%'
            }}
          />
        )}
      </Grid>
    </Grid>
  );
}
