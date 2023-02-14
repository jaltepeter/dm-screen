import { GridActionsCellItem, GridToolbarContainer } from '@mui/x-data-grid';

import AddIcon from '@mui/icons-material/Add';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import { DataGrid } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import PropTypes from 'prop-types';
import { SlideUpTransition } from '../slideUp';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

ManageCharactersDialog.propTypes = {
  characters: PropTypes.array,
  isOpen: PropTypes.bool,
  handleClose: PropTypes.func,
  onAddCharacter: PropTypes.func,
  onEditCharacter: PropTypes.func,
  onDeleteCharacter: PropTypes.func
};

export default function ManageCharactersDialog({
  characters,
  isOpen,
  onEditCharacter,
  onAddCharacter,
  onDeleteCharacter,
  handleClose
}) {
  const allColumnProps = { editable: true, sortable: false };
  const columns = [
    { field: 'name', headerName: 'Name', width: 140, ...allColumnProps },
    { field: 'charClass', headerName: 'Class', width: 140, ...allColumnProps },
    { field: 'background', headerName: 'Background', width: 140, ...allColumnProps },
    { field: 'ac', type: 'number', headerName: 'AC', ...allColumnProps },
    {
      field: 'pp',
      type: 'number',
      headerName: 'PP',
      description: 'Passive Perception',
      ...allColumnProps
    },
    {
      field: 'pi',
      type: 'number',
      headerName: 'PI',
      description: 'Passive Insight',
      ...allColumnProps
    },
    {
      field: 'init',
      type: 'number',
      headerName: 'Init',
      description: 'Initiative Bonus',
      ...allColumnProps
    },
    {
      field: 'sheetUrl',
      type: 'string',
      headerName: 'url',
      description: 'Character Sheet URL',
      flex: 1,
      ...allColumnProps
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      cellClassName: 'actions',
      width: 75,
      getActions: ({ id }) => {
        return [
          <GridActionsCellItem
            key='delete'
            icon={<DeleteIcon />}
            label='Delete'
            onClick={() => onDeleteCharacter(id)}
            color='inherit'
          />
        ];
      }
    }
  ];

  const processRowUpdate = (newRow) => {
    if (onEditCharacter(newRow)) return newRow;

    return false;
  };

  function EditToolbar() {
    return (
      <GridToolbarContainer>
        <Button color='primary' startIcon={<AddIcon />} onClick={onAddCharacter}>
          Add Character
        </Button>
      </GridToolbarContainer>
    );
  }

  return (
    <Dialog open={isOpen} onClose={handleClose} fullScreen TransitionComponent={SlideUpTransition}>
      <AppBar sx={{ position: 'relative' }}>
        <Toolbar>
          <IconButton edge='start' color='inherit' onClick={handleClose} aria-label='close'>
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant='h6' component='div'>
            Manage Characters
          </Typography>
          <Button autoFocus color='inherit' onClick={handleClose}>
            save
          </Button>
        </Toolbar>
      </AppBar>
      <div style={{ height: '100%' }}>
        <DataGrid
          rows={characters}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10]}
          disableSelectionOnClick
          disableColumnFilter
          disableColumnMenu
          editMode='row'
          components={{
            Toolbar: EditToolbar
          }}
          experimentalFeatures={{ newEditingApi: true }}
          processRowUpdate={processRowUpdate}
          onProcessRowUpdateError={() => console.error('Error updating character')}
        />
      </div>
    </Dialog>
  );
}
