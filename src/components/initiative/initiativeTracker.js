import { Button } from '@mui/material';
import InitiativeSetupDialog from './initiativeSetupDialog';
import Paper from '@mui/material/Paper';
import PropTypes from 'prop-types';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useState } from 'react';

InitiativeTracker.propTypes = {
  characters: PropTypes.array
};

export default function InitiativeTracker({ characters }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [actors, setActors] = useState([]);

  const [dialogOpen, setDialogOpen] = useState(false);

  const nextTurn = () => {
    setSelectedIndex(selectedIndex + 1 > actors.length - 1 ? 0 : selectedIndex + 1);
  };

  const prevTurn = () => {
    setSelectedIndex(selectedIndex - 1 < 0 ? actors.length - 1 : selectedIndex - 1);
  };

  const startInitiative = (actors) => {
    setDialogOpen(false);
    setActors(actors);
  };

  return (
    <Paper>
      <InitiativeSetupDialog
        characters={characters}
        isOpen={dialogOpen}
        handleClose={() => setDialogOpen(false)}
        onStartInitiative={startInitiative}
      />
      {actors.length > 0 ? (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>Name</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {actors?.map((actor, index) => (
              <TableRow key={actor.id} selected={selectedIndex === index}>
                <TableCell>{actor.init}</TableCell>
                <TableCell component='th' scope='row'>
                  {actor.name}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div>No combat</div>
      )}
      <Button onClick={prevTurn}>Previous</Button>
      <Button onClick={nextTurn}>Next</Button>
      <Button onClick={() => setDialogOpen(true)}>New</Button>
    </Paper>
  );
}
