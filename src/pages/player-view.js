import { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';

const PlayerView = () => {

  const authChannel = new BroadcastChannel('auth');

  const [imageSource, setImageSource] = useState('');

  useEffect(() => {
    document.title = "Player View";
  }, []);

  authChannel.onmessage = (e) => {
    if (e.data.cmd === 'image') {
      setImageSource(e.data.payload);
    }
  };

  return (
    <Grid container spacing={0}>
      {/* <Grid item xs={2} p={1}>
          <p>Initiative tracker</p>
      </Grid> */}
      <Grid
        item xs={12}
        container
        direction='column'
        height='100vh'
        width='100vw'>
        <Box
          component="img"
          src={imageSource}
          margin="auto"
          sx={{
            maxHeight: '99%',
            maxWidth: '99%',
          }}
        />
      </Grid>
    </Grid>
  );
};

export default PlayerView;