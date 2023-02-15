import { getLocalStorageCharacters, saveCharacters } from '../../data/localStorageManager';
import { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import { DefaultCharacters } from '../../data/defaultData';
import Grid from '@mui/material/Grid';
import InitiativeTracker from './initiative/initiativeTracker';
import ManageCharactersDialog from './manageCharactersDialog';
import PlayerDetails from './playerDetails';
import PropTypes from 'prop-types';
import { Section } from '../../components/section';
import Typography from '@mui/material/Typography';

export default function Characters({ isManageCharDialogOpen, onCloseManageCharDialog }) {
  const [characters, setCharacters] = useState(() => {
    return getLocalStorageCharacters() || DefaultCharacters();
  });

  useEffect(() => {
    saveCharacters(characters);
  }, [characters]);

  const handleAddCharacter = () => {
    const maxId = characters.length > 0 ? Math.max(...characters.map((a) => a.id)) + 1 : 1;
    const newChar = {
      name: 'New Character',
      id: maxId,
      charClass: 'Fighter',
      background: 'Soldier',
      ac: 10,
      pp: 10,
      pi: 10,
      init: 10
    };
    setCharacters([...characters, newChar]);
  };

  const handleEditCharacter = (character) => {
    const updatedChars = characters.map((c) =>
      c.id === character.id ? { ...c, ...character } : c
    );
    setCharacters(updatedChars);

    return true;
  };

  const handleDeleteCharacter = (id) => {
    const newCharacters = characters.filter((c) => c.id !== id);
    setCharacters(newCharacters);
  };

  return (
    <Grid container spacing={2} mb={2} alignItems='stretch'>
      <Grid item md={8} sm={12}>
        <Section>
          <Typography variant='h4'>Characters</Typography>
          <Box m={1}>
            <PlayerDetails characters={characters} />
          </Box>
        </Section>
      </Grid>
      <Grid item md={4} sm={12}>
        <Section>
          <Typography variant='h4'>Initiative</Typography>
          <Box m={1}>
            <InitiativeTracker characters={characters} />
          </Box>
        </Section>
      </Grid>

      <ManageCharactersDialog
        characters={characters}
        isOpen={isManageCharDialogOpen}
        onClose={onCloseManageCharDialog}
        onAddCharacter={handleAddCharacter}
        onEditCharacter={handleEditCharacter}
        onDeleteCharacter={handleDeleteCharacter}
      />
    </Grid>
  );
}

Characters.propTypes = {
  isManageCharDialogOpen: PropTypes.bool,
  onCloseManageCharDialog: PropTypes.func
};
