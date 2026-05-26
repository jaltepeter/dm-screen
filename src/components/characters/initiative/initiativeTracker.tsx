import { Button, Switch } from '@mui/material';
import { useEffect, useState } from 'react';

import InitiativeEndDialog from './initiativeEndDialog';
import InitiativeSetupDialog from './initiativeSetupDialog';
import Paper from '@mui/material/Paper';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Actor, sendMessage } from '../../../lib/sync';
import { Character } from '../../../store/characterStore';

interface InitiativeTrackerProps {
  characters: Character[];
}

export default function InitiativeTracker({ characters }: InitiativeTrackerProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [actors, setActors] = useState<Actor[]>([]);
  const [setupInitDialogOpen, setSetupInitDialogOpen] = useState(false);
  const [endInitDialogOpen, setEndInitDialogOpen] = useState(false);

  useEffect(() => {
    sendMessage({ cmd: 'init_update', payload: { actors, index: selectedIndex } });
  }, [selectedIndex, actors]);

  const nextTurn = () => {
    for (let i = selectedIndex + 1; i < actors.length + selectedIndex + 1; i++) {
      if (actors[i % actors.length].active) {
        setSelectedIndex(i % actors.length);
        break;
      }
    }
  };

  const prevTurn = () => {
    for (let i = 1; i <= actors.length; i++) {
      const index = (selectedIndex - i + actors.length) % actors.length;
      if (actors[index].active) {
        setSelectedIndex(index);
        break;
      }
    }
  };

  const startInitiative = (newActors: Actor[]) => {
    setSetupInitDialogOpen(false);
    setActors(newActors);
    setSelectedIndex(0);
  };

  const handleResetInitiative = () => {
    setActors([]);
    setEndInitDialogOpen(false);
  };

  const toggleActorVisible = (actorId: number) => {
    setActors(actors.map((a) => (a.id === actorId ? { ...a, visible: !a.visible } : a)));
  };

  const toggleActorActive = (actorId: number) => {
    setActors(actors.map((a) => (a.id === actorId ? { ...a, active: !a.active } : a)));
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
            {actors.map((actor, index) => (
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
      {actors.length === 0 && <Button onClick={() => setSetupInitDialogOpen(true)}>New</Button>}
    </Paper>
  );
}
