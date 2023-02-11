import { GridActionsCellItem, GridToolbarContainer } from '@mui/x-data-grid';

import AddIcon from '@mui/icons-material/Add';
import Button from '@mui/material/Button';
import { DataGrid } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import PropTypes from 'prop-types';

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
      ...allColumnProps
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      cellClassName: 'actions',
      flex: 1,
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
    <Dialog
      open={isOpen}
      onClose={handleClose}
      fullWidth
      maxWidth='md'
      aria-labelledby='alert-dialog-title'
      aria-describedby='alert-dialog-description'>
      <div style={{ height: 400 }}>
        <DataGrid
          rows={characters}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
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
        <Button autoFocus onClick={handleClose}>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
}
