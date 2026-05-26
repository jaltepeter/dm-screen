import ForwardIcon from '@mui/icons-material/Forward';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { Actor } from '../../../lib/sync';

interface InitiativePlayerViewProps {
  actors: Actor[];
  turnNumber: number;
}

export default function InitiativePlayerView({ actors, turnNumber }: InitiativePlayerViewProps) {
  return (
    <List
      sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
      aria-label='initiative'>
      {actors.map((actor, index) => (
        <ListItem disablePadding key={index}>
          <ListItemButton selected={index === turnNumber}>
            {index === turnNumber && (
              <ListItemIcon>
                <ForwardIcon />
              </ListItemIcon>
            )}
            <ListItemText
              inset={index !== turnNumber}
              sx={{ textDecoration: actor.active ? '' : 'line-through' }}
              primary={actor.visible ? actor.name : '? ? ? ? ? ?'}
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
}
