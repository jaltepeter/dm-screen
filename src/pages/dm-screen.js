import { useEffect, useState } from 'react';

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

  /**
   * Opens the player view in a new window/tab
   */
  const handleOpenPlayerView = () => {
    window.open('/dm-screen/players', '_blank');
  };

  /**
   * Open or close the left side menu drawer
   * @param {boolean} open - Whether or not the menu drawer should be open
   */
  const toggleMenuDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setIsDrawerOpen(open);
  };

  /**
   * Opens the 'Manage Characters' dialog
   */
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
