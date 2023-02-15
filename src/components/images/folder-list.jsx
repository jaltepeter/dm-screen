import { Accordion, AccordionDetails, AccordionSummary, ListItemIcon } from '@mui/material';

import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FolderDeleteIcon from '@mui/icons-material/FolderDelete';
import IconButton from '@mui/material/IconButton';
import ImageGrid from './imageGrid';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { PropTypes } from 'prop-types';
import { SlideUpTransition } from '../slideUp';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

export default function FolderList({
  folders,
  onRenameFolder,
  onDeleteFolder,
  onCreateFolder,
  onSendImage,
  onDeleteImage,
  onAddPhoto
}) {
  const [folderName, setFolderName] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [url, setUrl] = useState('');
  const [expanded, setExpanded] = useState(folders.length > 0 ? folders[0].folderName : '');
  const [isAddImageDialogOpen, setIsAddImageDialogOpen] = useState(false);
  const [isRenameFolderDialogOpen, setIsRenameFolderDialogOpen] = useState(false);
  const [isDeleteFolderDialogOpen, setIsDeleteFolderDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuOpenElem, setMenuOpenElem] = useState(null);

  const handleAddImage = (folderName) => {
    resetMenu();
    setFolderName(folderName);
    setIsAddImageDialogOpen(true);
  };

  const handleRenameFolder = (folderName) => {
    resetMenu();
    setFolderName(folderName);
    setNewFolderName(folderName);
    setIsRenameFolderDialogOpen(true);
  };

  const handleDeleteFolder = (folderName) => {
    resetMenu();
    setFolderName(folderName);
    setIsDeleteFolderDialogOpen(true);
  };

  const handleCancelDialog = () => {
    setFolderName('');
    setUrl('');
    setIsAddImageDialogOpen(false);
    setIsRenameFolderDialogOpen(false);
    setIsDeleteFolderDialogOpen(false);
  };

  const resetMenu = () => {
    setAnchorEl(null);
    setMenuOpenElem(null);
  };

  const handleUrlChange = (event) => {
    setUrl(event.target.value);
  };

  const handleFolderNameChange = (event) => {
    setNewFolderName(event.target.value);
  };

  const handleSaveImage = () => {
    onAddPhoto(folderName, url);
    handleCancelDialog();
  };

  const handleChange = (panel) => (_, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleClickMenuButton = (folderName) => (event) => {
    setAnchorEl(event.currentTarget);
    setMenuOpenElem(folderName);
  };

  const handleCloseMenu = () => {
    resetMenu();
  };

  const AddImageDialog = () => {
    return (
      <Dialog
        open={isAddImageDialogOpen}
        onClose={handleCancelDialog}
        TransitionComponent={SlideUpTransition}>
        <DialogTitle>Add an Image</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Paste an image URL here to save it to the &quot;{folderName}&quot; folder.
          </DialogContentText>
          <TextField
            autoFocus
            margin='dense'
            id='url'
            label='Image URL'
            fullWidth
            variant='standard'
            value={url}
            onChange={handleUrlChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDialog}>Cancel</Button>
          <Button onClick={handleSaveImage}>Save</Button>
        </DialogActions>
      </Dialog>
    );
  };

  const RenameFolderDialog = () => {
    return (
      <Dialog
        open={isRenameFolderDialogOpen}
        onClose={handleCancelDialog}
        TransitionComponent={SlideUpTransition}>
        <DialogTitle>Rename Folder</DialogTitle>
        <DialogContent>
          <DialogContentText>Enter a new folder name</DialogContentText>
          <TextField
            autoFocus
            margin='dense'
            id='url'
            label='Image URL'
            fullWidth
            variant='standard'
            value={newFolderName}
            onChange={handleFolderNameChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDialog}>Cancel</Button>
          <Button
            onClick={() => {
              onRenameFolder(folderName, newFolderName);
              setExpanded(newFolderName);
              setIsRenameFolderDialogOpen(false);
            }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const DeleteFolderDialog = () => {
    return (
      <Dialog
        open={isDeleteFolderDialogOpen}
        onClose={handleCancelDialog}
        TransitionComponent={SlideUpTransition}>
        <DialogTitle>Delete Folder?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the &quot;{folderName}&quot; folder? This will also
            remove all saved images.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDialog}>Cancel</Button>
          <Button
            onClick={() => {
              onDeleteFolder(folderName);
              setExpanded(folders[0].folderName);
              setIsDeleteFolderDialogOpen(false);
            }}>
            Delete It
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <div>
      {folders.length <= 0 ? (
        <Button variant='contained' onClick={() => onCreateFolder()}>
          Create a Folder
        </Button>
      ) : (
        folders.map((folder, index) => (
          <Accordion
            key={index}
            expanded={expanded === folder.folderName}
            onChange={handleChange(folder.folderName)}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls='panel1a-content'
              id='panel1a-header'>
              <Typography>{folder.folderName}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <ImageGrid
                folderName={folder.folderName}
                images={folder.images}
                onSendImage={onSendImage}
                onDeleteImage={onDeleteImage}
              />
              <Box
                sx={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'row-reverse'
                }}>
                <IconButton
                  aria-label='more'
                  id='basic-button'
                  // aria-controls={open ? 'basic-menu' : undefined}
                  // aria-expanded={open ? 'true' : undefined}
                  aria-haspopup='true'
                  onClick={handleClickMenuButton(folder.folderName)}>
                  <MoreVertIcon />
                </IconButton>
                <Menu
                  id='basic-menu'
                  anchorEl={anchorEl}
                  open={menuOpenElem === folder.folderName}
                  onClose={handleCloseMenu}
                  MenuListProps={{
                    'aria-labelledby': 'basic-button'
                  }}>
                  <MenuItem onClick={() => handleAddImage(folder.folderName)}>
                    <ListItemIcon>
                      <AddPhotoAlternateIcon />
                    </ListItemIcon>
                    Add Image
                  </MenuItem>
                  <Divider sx={{ my: 0.5 }} />
                  <MenuItem onClick={() => handleRenameFolder(folder.folderName)}>
                    <ListItemIcon>
                      <DriveFileRenameOutlineIcon />
                    </ListItemIcon>
                    Rename Folder
                  </MenuItem>
                  <MenuItem onClick={() => onCreateFolder()}>
                    <ListItemIcon>
                      <CreateNewFolderIcon />
                    </ListItemIcon>
                    Create New Folder
                  </MenuItem>
                  <MenuItem onClick={() => handleDeleteFolder(folder.folderName)}>
                    <ListItemIcon>
                      <FolderDeleteIcon />
                    </ListItemIcon>
                    Delete Folder
                  </MenuItem>
                </Menu>
              </Box>
            </AccordionDetails>
          </Accordion>
        ))
      )}
      <AddImageDialog />
      <RenameFolderDialog />
      <DeleteFolderDialog />
    </div>
  );
}

FolderList.propTypes = {
  folders: PropTypes.array,
  onSendImage: PropTypes.func,
  onDeleteImage: PropTypes.func,
  onAddPhoto: PropTypes.func,
  onRenameFolder: PropTypes.func,
  onDeleteFolder: PropTypes.func,
  onCreateFolder: PropTypes.func
};
