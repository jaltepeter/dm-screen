import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  TextField,
  Typography
} from '@mui/material';

import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FolderDeleteIcon from '@mui/icons-material/FolderDelete';
import ImageGrid from './imageGrid';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { PropTypes } from 'prop-types';
import { SlideUpTransition } from '../slideUp';
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
  const [title, setTitle] = useState('');
  const [expanded, setExpanded] = useState(folders.length > 0 ? folders[0].folderName : '');
  const [isAddImageDialogOpen, setIsAddImageDialogOpen] = useState(false);
  const [isRenameFolderDialogOpen, setIsRenameFolderDialogOpen] = useState(false);
  const [isDeleteFolderDialogOpen, setIsDeleteFolderDialogOpen] = useState(false);
  const [isRenameFolderError, setIsRenameFolderError] = useState(false);
  const [renameFolderErrorMessage, setRenameFolderErrorMessage] = useState('');
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

  const handleRenameFolderDialogSave = () => {
    if (folders.filter((f) => f.folderName === newFolderName).length > 0) {
      setIsRenameFolderError(true);
      setRenameFolderErrorMessage('Folder already exists');
    } else {
      onRenameFolder(folderName, newFolderName);
      setExpanded(newFolderName);
      setIsRenameFolderDialogOpen(false);
    }
  };

  const resetMenu = () => {
    setAnchorEl(null);
    setMenuOpenElem(null);
  };

  const handleUrlChange = (event) => {
    setUrl(event.target.value);
  };

  const handleTitleChange = (event) => {
    setTitle(event.target.value);
  };

  const handleFolderNameChange = (event) => {
    setIsRenameFolderError(false);
    setRenameFolderErrorMessage('');
    setNewFolderName(event.target.value);
  };

  const handleSaveImage = () => {
    onAddPhoto(folderName, url, title);
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

      {/** Add Image Dialog */}
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
            margin='dense'
            id='title'
            label='Image Title (optional)'
            fullWidth
            variant='standard'
            value={title}
            onChange={handleTitleChange}
          />
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

      {/** Rename Folder Dialog */}
      <Dialog
        open={isRenameFolderDialogOpen}
        onClose={handleCancelDialog}
        TransitionComponent={SlideUpTransition}>
        <DialogTitle>Rename Folder</DialogTitle>
        <DialogContent>
          <DialogContentText>Enter a new folder name</DialogContentText>
          <TextField
            autoFocus
            error={isRenameFolderError}
            helperText={renameFolderErrorMessage}
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
          <Button onClick={handleRenameFolderDialogSave}>Save</Button>
        </DialogActions>
      </Dialog>

      {/** Delete Folder Dialog */}
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
