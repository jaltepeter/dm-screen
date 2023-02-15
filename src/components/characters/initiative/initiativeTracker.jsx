import { Button, Switch } from '@mui/material';
import { useEffect, useState } from 'react';

import InitiativeEndDialog from './initiativeEndDialog';
import InitiativeSetupDialog from './initiativeSetupDialog';
import Paper from '@mui/material/Paper';
import PropTypes from 'prop-types';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

export default function InitiativeTracker({ characters }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [actors, setActors] = useState([]);

  const [setupInitDialogOpen, setSetupInitDialogOpen] = useState(false);
  const [endInitDialogOpen, setEndInitDialogOpen] = useState(false);
  const broadcastChannel = new BroadcastChannel('dm-screen');

  useEffect(() => {
    broadcastChannel.postMessage({
      cmd: 'init_update',
      payload: { actors: actors, index: selectedIndex }
    });
  }, [selectedIndex, actors]);

  const nextTurn = () => {
    let nextIndex;
    for (let index = selectedIndex + 1; index < actors.length + selectedIndex + 1; index++) {
      if (actors[index % actors.length].active) {
        nextIndex = index % actors.length;
        break;
      }
    }
    setSelectedIndex(nextIndex);
  };

  const prevTurn = () => {
    let nextIndex;
    for (let index = selectedIndex - 1; actors.length + selectedIndex > index; index--) {
      if (index < 0) index = actors.length - 1;
      if (actors[index % actors.length].active) {
        nextIndex = index % actors.length;
        break;
      }
    }
    setSelectedIndex(nextIndex);
  };

  const startInitiative = (actors) => {
    setSetupInitDialogOpen(false);
    setActors(actors);
    setSelectedIndex(0);
  };

  const handleResetInitiative = () => {
    setActors([]);
    setEndInitDialogOpen(false);
  };

  const toggleActorVisible = (actorId) => {
    const updatedActors = actors.map((a) => (a.id === actorId ? { ...a, visible: !a.visible } : a));
    setActors(updatedActors);
  };

  const toggleActorActive = (actorId) => {
    const updatedActors = actors.map((a) => (a.id === actorId ? { ...a, active: !a.active } : a));
    setActors(updatedActors);
  };

  return (
    <Paper>
      <InitiativeSetupDialog
        characters={characters}
        isOpen={setupInitDialogOpen}
        handleClose={() => setSetupInitDialogOpen(false)}
        onStartInitiative={startInitiative}
      />
      <InitiativeEndDialog
        isOpen={endInitDialogOpen}
        handleClose={() => setEndInitDialogOpen(false)}
        handleEndInitiative={handleResetInitiative}
      />
      {actors.length > 0 ? (
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell flex='1'>Name</TableCell>
              <TableCell align='center'>Visible</TableCell>
              <TableCell align='center'>Alive</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {actors?.map((actor, index) => (
              <TableRow key={actor.id} selected={selectedIndex === index}>
                <TableCell>{actor.init}</TableCell>
                <TableCell
                  component='th'
                  scope='row'
                  sx={{ textDecoration: actor.active ? '' : 'line-through' }}>
                  {actor.name}
                </TableCell>
                <TableCell align='center'>
                  <Switch checked={actor.visible} onChange={() => toggleActorVisible(actor.id)} />
                </TableCell>
                <TableCell align='center'>
                  <Switch checked={actor.active} onChange={() => toggleActorActive(actor.id)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div>No combat</div>
      )}

      <Button onClick={prevTurn}>
        <SkipPreviousIcon />
      </Button>
      <Button onClick={nextTurn}>
        <SkipNextIcon />
      </Button>
      {actors.length > 0 && <Button onClick={() => setEndInitDialogOpen(true)}>End</Button>}
      {actors.length == 0 && <Button onClick={() => setSetupInitDialogOpen(true)}>New</Button>}
    </Paper>
  );
}

InitiativeTracker.propTypes = {
  characters: PropTypes.array
};
