import { GridActionsCellItem, GridToolbarContainer } from '@mui/x-data-grid';

import AddIcon from '@mui/icons-material/Add';
import Button from '@mui/material/Button';
import { DataGrid } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import PropTypes from 'prop-types';
import { SlideUpTransition } from '../../slideUp';
import { useState } from 'react';

function newInitiative(characters) {
  return characters.map((c) => ({ id: c.id, name: c.name, init: 0, visible: true, active: true }));
}

const allColumnProps = { editable: true, sortable: false };

export default function InitiativeSetupDialog({
  characters,
  isOpen,
  onStartInitiative,
  handleClose
}) {
  const [actors, setActors] = useState(newInitiative(characters));

  const columns = [
    { field: 'init', headerName: 'Init', type: 'number', ...allColumnProps },
    { field: 'name', headerName: 'Name', flex: 1, ...allColumnProps },
    { field: 'visible', headerName: 'Visible', type: 'boolean', ...allColumnProps },
    {
      field: 'actions',
      type: 'actions',
      headerName: '',
      cellClassName: 'actions',
      maxWidth: 50,
      getActions: ({ id }) => {
        return [
          <GridActionsCellItem
            key='delete'
            icon={<DeleteIcon />}
            label='Delete'
            onClick={() => deleteActor(id)}
            color='inherit'
          />
        ];
      }
    }
  ];

  const handleStartInit = () => {
    let a = [...actors].sort((a, b) => b.init - a.init);
    onStartInitiative(a);
    setActors(newInitiative(characters));
  };

  const addActor = () => {
    const maxId = actors.length > 0 ? Math.max(...actors.map((a) => a.id)) + 1 : 1;
    const actor = { id: maxId, name: 'New Actor', init: 0, visible: true, active: true };
    setActors([...actors, actor]);
  };

  const deleteActor = (id) => {
    setActors(actors.filter((c) => c.id !== id));
  };

  const processRowUpdate = (actor) => {
    setActors(actors.map((a) => (a.id === actor.id ? { ...a, ...actor } : a)));

    return actor;
  };

  const EditToolbar = () => {
    return (
      <GridToolbarContainer>
        <Button color='primary' startIcon={<AddIcon />} onClick={addActor}>
          Add Actor
        </Button>
      </GridToolbarContainer>
    );
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      fullWidth
      maxWidth='sm'
      TransitionComponent={SlideUpTransition}
      aria-labelledby='alert-dialog-title'
      aria-describedby='alert-dialog-description'>
      <div style={{ height: 400 }}>
        <DataGrid
          rows={actors}
          columns={columns}
          pageSize={50}
          rowsPerPageOptions={[50]}
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
      <DialogActions>
        <Button autoFocus onClick={() => setActors(newInitiative(characters))}>
          Reset
        </Button>
        <Button autoFocus onClick={handleStartInit}>
          Start!
        </Button>
      </DialogActions>
    </Dialog>
  );
}

InitiativeSetupDialog.propTypes = {
  characters: PropTypes.array,
  isOpen: PropTypes.bool,
  handleClose: PropTypes.func,
  onStartInitiative: PropTypes.func
};
