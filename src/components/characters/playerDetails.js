import * as React from 'react';

import Paper from '@mui/material/Paper';
import PropTypes from 'prop-types';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ShieldIcon from '@mui/icons-material/Shield';
import SpeedIcon from '@mui/icons-material/Speed';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Tooltip } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';

PlayerDetails.propTypes = {
  characters: PropTypes.array
};

export default function PlayerDetails({ characters }) {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} size='small' aria-label='simple table'>
        <TableHead>
          <TableRow>
            <TableCell align='left'>Character</TableCell>
            <TableCell align='left'>Class</TableCell>
            <TableCell align='left'>Background</TableCell>
            <TableCell align='center'>
              <Tooltip title='Armor Class' arrow>
                <ShieldIcon />
              </Tooltip>
            </TableCell>
            <TableCell align='center'>
              <Tooltip title='Passive Perception' arrow>
                <VisibilityIcon />
              </Tooltip>
            </TableCell>
            <TableCell align='center'>
              <Tooltip title='Passive Insight' arrow>
                <PsychologyIcon />
              </Tooltip>
            </TableCell>
            <TableCell align='center'>
              <Tooltip title='Initiative Bonus' arrow>
                <SpeedIcon />
              </Tooltip>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {characters.map((row) => (
            <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell component='th' scope='row'>
                {' '}
                {row.name}{' '}
              </TableCell>
              <TableCell align='left'>{row.charClass}</TableCell>
              <TableCell align='left'>{row.background}</TableCell>
              <TableCell align='center'>{row.ac}</TableCell>
              <TableCell align='center'>{row.pp}</TableCell>
              <TableCell align='center'>{row.pi}</TableCell>
              <TableCell align='center'>{row.init}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
