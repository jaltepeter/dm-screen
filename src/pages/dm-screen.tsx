import React, { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Characters from '../components/characters/characters';
import Drawer from '@mui/material/Drawer';
import DrawerContents from '../components/drawerContents';
import Images from '../components/images/images';
import NavBar from '../components/navBar';

const DmScreen = () => {
  const pageTitle = 'Dm Screen';

  const [isManageCharactersOpen, setIsManageCharactersOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    document.title = pageTitle;
  }, []);

  const handleOpenPlayerView = () => {
    window.open('/dm-screen/players', '_blank');
  };

  const toggleMenuDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' ||
        (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }
    setIsDrawerOpen(open);
  };

  const handleManageCharacters = () => {
    setIsDrawerOpen(false);
    setIsManageCharactersOpen(true);
  };

  const handleExportData = () => {
    //downloadJsonFile({ characters: characters, images: images }, 'dm-screen-data.json');
  };

  const handleImportData = () => {
    console.log('import');
  };

  return (
    <div>
      <Drawer anchor='left' open={isDrawerOpen} onClose={toggleMenuDrawer(false)}>
        <DrawerContents
          onExport={handleExportData}
          onImport={handleImportData}
          onClickManageCharacters={handleManageCharacters}
        />
      </Drawer>
      <Box sx={{ flexGrow: 1 }} mb={2}>
        <NavBar onToggleMenuDrawer={toggleMenuDrawer} onOpenPlayerView={handleOpenPlayerView} />
      </Box>
      <Box m={2}>
        <Characters
          isManageCharDialogOpen={isManageCharactersOpen}
          onCloseManageCharDialog={() => setIsManageCharactersOpen(false)}
        />
        <Images />
      </Box>
      <Box m={2}>
        <Card m={2}></Card>
      </Box>
    </div>
  );
};

export default DmScreen;
