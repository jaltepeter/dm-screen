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
    <div>
      <Box height="100vh" width="100%" display="grid" flexDirection="column">
        <Grid
          container direction='column' alignItems='center' justify='center'>
          <img height="100%" src={imageSource} />
        </Grid>
      </Box>
    </div>
  );
};

export default PlayerView;