import * as React from 'react';

import ContactPageIcon from '@mui/icons-material/ContactPage';
import Link from '@mui/material/Link';
import LinkIcon from '@mui/icons-material/Link';
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
            <TableCell align='center'>
              <Tooltip title='Character Sheet Link' arrow>
                <ContactPageIcon />
              </Tooltip>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {characters.map((char) => (
            <TableRow hover key={char.id}>
              <TableCell component='th' scope='row'>
                {char.name}
              </TableCell>
              <TableCell align='left'>{char.charClass}</TableCell>
              <TableCell align='left'>{char.background}</TableCell>
              <TableCell align='center'>{char.ac}</TableCell>
              <TableCell align='center'>{char.pp}</TableCell>
              <TableCell align='center'>{char.pi}</TableCell>
              <TableCell align='center'>{char.init}</TableCell>
              <TableCell align='center'>
                {char.sheetUrl ? (
                  <Link href={char.sheetUrl} target='_blank'>
                    <LinkIcon />
                  </Link>
                ) : (
                  ''
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

PlayerDetails.propTypes = {
  characters: PropTypes.array
};
