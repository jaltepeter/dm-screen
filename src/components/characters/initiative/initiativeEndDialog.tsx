import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

interface InitiativeEndDialogProps {
  isOpen: boolean;
  handleClose: () => void;
  handleEndInitiative: () => void;
}

export default function InitiativeEndDialog({
  isOpen,
  handleClose,
  handleEndInitiative
}: InitiativeEndDialogProps) {
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
