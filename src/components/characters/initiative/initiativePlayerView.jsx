import ForwardIcon from '@mui/icons-material/Forward';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import PropTypes from 'prop-types';

export default function InitiativePlayerView({ actors, turnNumber }) {
  return (
    <List
      sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
      aria-label='initiative'>
      {actors?.map((actor, index) => (
        <ListItem disablePadding key={index}>
          <ListItemButton selected={index == turnNumber}>
            {index == turnNumber && (
              <ListItemIcon>
                <ForwardIcon />
              </ListItemIcon>
            )}
            <ListItemText
              inset={index != turnNumber}
              sx={{ textDecoration: actor.active ? '' : 'line-through' }}
              primary={actor.visible ? actor.name : '? ? ? ? ? ?'}
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
}

InitiativePlayerView.propTypes = {
  actors: PropTypes.array,
  turnNumber: PropTypes.number
};
