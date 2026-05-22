import Box from '@mui/material/Box';
import FolderList from './folder-list';
import Grid from '@mui/material/Grid';
import ImageSender from './imageSender';
import { Section } from '../section';
import Typography from '@mui/material/Typography';
import { sendMessage } from '../../lib/sync';
import { useImageStore } from '../../store/imageStore';

export default function Images() {
  const folders = useImageStore((s) => s.folders);
  const createFolder = useImageStore((s) => s.createFolder);
  const renameFolder = useImageStore((s) => s.renameFolder);
  const deleteFolder = useImageStore((s) => s.deleteFolder);
  const addImage = useImageStore((s) => s.addImage);
  const deleteImage = useImageStore((s) => s.deleteImage);

  const sendImageToPlayerView = (item) => {
    sendMessage({ cmd: 'image', payload: item });
  };

  return (
    <Grid container spacing={2} mb={2} alignItems='stretch'>
      <Grid item md={8} sm={12}>
        <Section>
          <Typography variant='h4'>Saved Images</Typography>
          <Box m={1}>
            <FolderList
              folders={folders}
              onCreateFolder={createFolder}
              onRenameFolder={renameFolder}
              onDeleteFolder={deleteFolder}
              onSendImage={sendImageToPlayerView}
              onAddPhoto={addImage}
              onDeleteImage={({ folderName, image }) => deleteImage(folderName, image)}
            />
          </Box>
        </Section>
      </Grid>
      <Grid item md={4} sm={12}>
        <Section>
          <ImageSender onSendImage={sendImageToPlayerView} />
        </Section>
      </Grid>
    </Grid>
  );
}
