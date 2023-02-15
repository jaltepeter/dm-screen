import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import DownloadIcon from '@mui/icons-material/Download';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import PropTypes from 'prop-types';
import UploadIcon from '@mui/icons-material/Upload';

DrawerContents.propTypes = {
  onImport: PropTypes.func,
  onExport: PropTypes.func,
  onClickManageCharacters: PropTypes.func
};

export default function DrawerContents({ onImport, onExport, onClickManageCharacters }) {
  return (
    <Box sx={{ width: 250 }} role='presentation'>
      <List>
        <ListItem key='manageCharacters' disablePadding>
          <ListItemButton onClick={onClickManageCharacters}>
            <ListItemIcon>
              <ManageAccountsIcon />
            </ListItemIcon>
            <ListItemText>Manage Characters</ListItemText>
          </ListItemButton>
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem key='export' disablePadding>
          <ListItemButton onClick={onExport}>
            <ListItemIcon>
              <UploadIcon />
            </ListItemIcon>
            <ListItemText>Export Data</ListItemText>
          </ListItemButton>
        </ListItem>
        <ListItem key='import' disablePadding>
          <ListItemButton onClick={onImport} disabled>
            <ListItemIcon>
              <DownloadIcon />
            </ListItemIcon>
            <ListItemText>Import Data</ListItemText>
          </ListItemButton>
        </ListItem>
      </List>
      <Divider />
    </Box>
  );
}
