import React from 'react';

import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import PanoramaIcon from '@mui/icons-material/Panorama';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

interface NavBarProps {
  onToggleMenuDrawer: (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => void;
  onOpenPlayerView: () => void;
}

export default function NavBar({ onToggleMenuDrawer, onOpenPlayerView }: NavBarProps) {
  return (
    <AppBar position='static'>
      <Toolbar>
        <IconButton
          size='large'
          edge='start'
          color='inherit'
          aria-label='menu'
          sx={{ mr: 2 }}
          onClick={onToggleMenuDrawer(true)}>
          <MenuIcon />
        </IconButton>
        <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
          DM Screen
        </Typography>
        <Button
          color='inherit'
          variant='outlined'
          onClick={onOpenPlayerView}
          endIcon={<PanoramaIcon />}>
          Open Player View
        </Button>
      </Toolbar>
    </AppBar>
  );
}
