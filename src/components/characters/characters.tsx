import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import InitiativeTracker from './initiative/initiativeTracker';
import ManageCharactersDialog from './manageCharactersDialog';
import PlayerDetails from './playerDetails';
import { Section } from '../../components/section';
import Typography from '@mui/material/Typography';
import { useCharacterStore } from '../../store/characterStore';

interface CharactersProps {
  isManageCharDialogOpen: boolean;
  onCloseManageCharDialog: () => void;
}

export default function Characters({
  isManageCharDialogOpen,
  onCloseManageCharDialog
}: CharactersProps) {
  const characters = useCharacterStore((s) => s.characters);
  const addCharacter = useCharacterStore((s) => s.addCharacter);
  const editCharacter = useCharacterStore((s) => s.editCharacter);
  const deleteCharacter = useCharacterStore((s) => s.deleteCharacter);

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
        onAddCharacter={addCharacter}
        onEditCharacter={editCharacter}
        onDeleteCharacter={deleteCharacter}
      />
    </Grid>
  );
}
