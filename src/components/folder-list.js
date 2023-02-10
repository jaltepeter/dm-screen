import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';

import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Fab from '@mui/material/Fab';
import ImageGrid from './imageGrid';
import { PropTypes } from 'prop-types';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

FolderList.propTypes = {
  folders: PropTypes.array,
  onSendImage: PropTypes.func,
  onDeleteImage: PropTypes.func,
  onAddPhoto: PropTypes.func
};

export default function FolderList({ folders, onSendImage, onDeleteImage, onAddPhoto }) {
  const [folderName, setFolderName] = useState('');
  const [url, setUrl] = useState('');
  const [expanded, setExpanded] = useState(folders[0].folderName);
  const [open, setOpen] = useState(false);

  const handleClickOpen = (folderName) => {
    setFolderName(folderName);
    setOpen(true);
  };

  const handleCancelDialog = () => {
    setFolderName('');
    setUrl('');
    setOpen(false);
  };

  const handleUrlChange = (event) => {
    setUrl(event.target.value);
  };

  const handleSaveImage = () => {
    onAddPhoto(folderName, url);
    handleCancelDialog();
  };

  const handleChange = (panel) => (_, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <div>
      {folders.map((folder) => (
        <Accordion
          key={folder.folderName}
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
              <Fab
                size='small'
                color='primary'
                aria-label='add'
                onClick={() => handleClickOpen(folder.folderName)}>
                <AddPhotoAlternateIcon />
              </Fab>
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
      <Dialog open={open} onClose={handleCancelDialog}>
        <DialogTitle>Add an image</DialogTitle>
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
    </div>
  );
}
