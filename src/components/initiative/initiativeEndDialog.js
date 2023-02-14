import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import PropTypes from 'prop-types';

InitiativeEndDialog.propTypes = {
  isOpen: PropTypes.bool,
  handleClose: PropTypes.func,
  handleEndInitiative: PropTypes.func
};

export default function InitiativeEndDialog({ isOpen, handleClose, handleEndInitiative }) {
  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      aria-labelledby='alert-dialog-title'
      aria-describedby='alert-dialog-description'>
      <DialogTitle id='alert-dialog-title'>{'End Initiative?'}</DialogTitle>
      <DialogContent>
        <DialogContentText id='alert-dialog-description'>
          This will end the current combat and delete all entries from the initiative tracker
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleEndInitiative} autoFocus>
          End Initiative
        </Button>
      </DialogActions>
    </Dialog>
  );
}
