import { useEffect, useState } from 'react';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import DefaultData from '../data/defaultData';
import Drawer from '@mui/material/Drawer';
import DrawerContents from '../components/drawerContents';
import FolderList from '../components/images/folder-list';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import ImageSender from '../components/images/imageSender';
import ManageCharactersDialog from '../components/characters/manageCharactersDialog';
import MenuIcon from '@mui/icons-material/Menu';
import PanoramaIcon from '@mui/icons-material/Panorama';
import Paper from '@mui/material/Paper';
import PlayerDetails from '../components/characters/playerDetails';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { downloadJsonFile } from '../files/fileManager';
import { styled } from '@mui/material/styles';

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

  const Section = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary
  }));

  return (
    <div>
      <Drawer anchor='left' open={drawerOpen} onClose={toggleMenuDrawer(false)}>
        <DrawerContents
          onExport={handleExportData}
          onImport={handleImportData}
          onManageCharacters={handleManageCharacters}
        />
      </Drawer>
      <Box sx={{ flexGrow: 1 }} mb={2}>
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
        <Grid container spacing={2} alignItems='stretch'>
          <Grid item xs={8}>
            <Section>
              <Typography variant='h4'>Characters</Typography>
              <Box m={1}>
                <PlayerDetails characters={localStorageData.characters} />
              </Box>
            </Section>
          </Grid>
          <Grid item xs={4}>
            <Section sx={{ height: '100%' }}></Section>
          </Grid>
          <Grid item xs={8}>
            <Section>
              <Typography variant='h4'>Saved Images</Typography>
              <Box m={1}>
                <FolderList
                  folders={localStorageData.images}
                  onSendImage={handleEvent}
                  onAddPhoto={handleAddImage}
                  onDeleteImage={handleDeleteImage}
                />
              </Box>
            </Section>
          </Grid>
          <Grid item xs={4}>
            <Section sx={{ height: '100%' }}>
              <ImageSender onSendImage={handleEvent} />
            </Section>
          </Grid>
        </Grid>
      </Box>

      <Box m={2}>
        <Card m={2}></Card>
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
