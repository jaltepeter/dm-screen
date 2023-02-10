import { useEffect, useState } from 'react';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import DefaultData from '../data/defaultData';
import Drawer from '@mui/material/Drawer';
import DrawerContents from '../components/drawerContents';
import FolderList from '../components/folder-list';
import IconButton from '@mui/material/IconButton';
import ImageSender from '../components/imageSender';
import ManageCharactersDialog from '../components/manageCharactersDialog';
import MenuIcon from '@mui/icons-material/Menu';
import PanoramaIcon from '@mui/icons-material/Panorama';
import PlayerDetails from '../components/playerDetails';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { downloadJsonFile } from '../files/fileManager';

const DmScreen = () => {
  const pageTitle = 'Dm Screen';

  const localStorageKey_ImageData = 'imageData';

  const broadcastChannel = new BroadcastChannel('auth');

  const [drawerOpen, setDrawerOpen] = useState(false);

  const [manageCharDialogOpen, setManageCharDialogOpen] = useState(false);

  const [localStorageData, setData] = useState(() => {
    const initialData = JSON.parse(localStorage.getItem(localStorageKey_ImageData));
    return initialData || DefaultData();
  });

  useEffect(() => {
    document.title = pageTitle;
  }, []);

  useEffect(() => {
    localStorage.setItem(localStorageKey_ImageData, JSON.stringify(localStorageData));
  }, [localStorageData]);

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
    setDrawerOpen(open);
  };

  /**
   * Add a new image to the specified folder
   * @param {string} folderName - The name of the folder to add images to
   * @param {string} url - URL of the image to add
   */
  const handleAddImage = (folderName, url) => {
    if (!url) return;

    const imageFolders = localStorageData.images.map((folder) =>
      folder.folderName === folderName
        ? { ...folder, images: [...folder.images, url] }
        : { ...folder }
    );
    setData({ ...localStorageData, images: imageFolders });
  };

  const handleDeleteImage = ({ folderName, url }) => {
    const imageFolders = localStorageData.images.map((folder) =>
      folder.folderName === folderName
        ? { ...folder, images: folder.images.filter((e) => e !== url) }
        : { ...folder }
    );
    setData({ ...localStorageData, images: imageFolders });
  };

  const handleEvent = (item) => {
    sendImageToPlayerView(item);
  };

  const sendImageToPlayerView = (url) => {
    broadcastChannel.postMessage({ cmd: 'image', payload: url });
  };

  const handleExportData = () => {
    downloadJsonFile(localStorageData, 'dm-screen-data.json');
  };

  const handleImportData = () => {
    console.log('import');
  };

  const handleManageCharacters = () => {
    console.log('manage characters');
    setManageCharDialogOpen(true);
    setDrawerOpen(false);
  };

  const handleEditCharacter = (character) => {
    const updatedChars = localStorageData.characters.map((c) =>
      c.id === character.id ? { ...c, ...character } : c
    );
    setData({ ...localStorageData, characters: updatedChars });

    return true;
  };

  const handleAddCharacter = () => {
    const maxId = Math.max(...localStorageData.characters.map((c) => c.id)) + 1;
    const newChar = { name: 'New Character', id: maxId };
    setData({ ...localStorageData, characters: [...localStorageData.characters, newChar] });
  };

  const handleDeleteCharacter = (id) => {
    const characters = localStorageData.characters.filter((c) => c.id !== id);
    setData({ ...localStorageData, characters: characters });
  };

  return (
    <div>
      <Drawer anchor='left' open={drawerOpen} onClose={toggleMenuDrawer(false)}>
        <DrawerContents
          onExport={handleExportData}
          onImport={handleImportData}
          onManageCharacters={handleManageCharacters}
        />
      </Drawer>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position='static'>
          <Toolbar>
            <IconButton
              size='large'
              edge='start'
              color='inherit'
              aria-label='menu'
              sx={{ mr: 2 }}
              onClick={toggleMenuDrawer(true)}>
              <MenuIcon />
            </IconButton>
            <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
              DM Screen
            </Typography>
            <Button
              color='inherit'
              variant='outlined'
              onClick={handleOpenPlayerView}
              endIcon={<PanoramaIcon />}>
              Open Player View
            </Button>
          </Toolbar>
        </AppBar>
      </Box>
      <Box m={2}>
        <PlayerDetails characters={localStorageData.characters} />
      </Box>
      <ImageSender onSendImage={handleEvent} />
      <Box m={2}>
        <FolderList
          folders={localStorageData.images}
          onSendImage={handleEvent}
          onAddPhoto={handleAddImage}
          onDeleteImage={handleDeleteImage}
        />
      </Box>
      <ManageCharactersDialog
        characters={localStorageData.characters}
        isOpen={manageCharDialogOpen}
        handleClose={() => setManageCharDialogOpen(false)}
        onAddCharacter={handleAddCharacter}
        onEditCharacter={handleEditCharacter}
        onDeleteCharacter={handleDeleteCharacter}
      />
    </div>
  );
};

export default DmScreen;
