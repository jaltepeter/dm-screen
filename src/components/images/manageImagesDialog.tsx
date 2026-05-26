import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Trash2, Pencil, FolderPlus, ImagePlus } from 'lucide-react';
import { useImageStore, Image } from '../../store/imageStore';
import ConfirmDialog from '@/components/ui/confirmDialog';
import ImageThumbnail from './image-thumbnail';
import AddImageDialog from './add-image-dialog';
import RenameFolderDialog from './rename-folder-dialog';
import NewFolderDialog from './new-folder-dialog';

interface ManageImagesDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type SubDialog = 'addImage' | 'rename' | 'deleteFolder' | 'newFolder' | null;

export default function ManageImagesDialog({ isOpen, onClose }: ManageImagesDialogProps) {
  const folders = useImageStore((s) => s.folders);
  const createFolder = useImageStore((s) => s.createFolder);
  const renameFolder = useImageStore((s) => s.renameFolder);
  const deleteFolder = useImageStore((s) => s.deleteFolder);
  const addImage = useImageStore((s) => s.addImage);
  const deleteImage = useImageStore((s) => s.deleteImage);

  const [targetFolder, setTargetFolder] = useState('');
  const [subDialog, setSubDialog] = useState<SubDialog>(null);
  const [pendingDeleteImage, setPendingDeleteImage] = useState<{
    folder: string;
    image: Image;
  } | null>(null);

  const openSub = (dialog: SubDialog, folder = '') => {
    setTargetFolder(folder);
    setSubDialog(dialog);
  };

  const closeSub = () => setSubDialog(null);

  const folderNames = folders.map((f) => f.folderName);

  return (
    <>
      <ConfirmDialog
        open={!!pendingDeleteImage}
        title='Delete image?'
        description={
          pendingDeleteImage?.image.title
            ? `"${pendingDeleteImage.image.title}" will be permanently deleted.`
            : 'This image will be permanently deleted.'
        }
        onConfirm={() => {
          if (pendingDeleteImage) deleteImage(pendingDeleteImage.folder, pendingDeleteImage.image);
          setPendingDeleteImage(null);
        }}
        onCancel={() => setPendingDeleteImage(null)}
      />

      <ConfirmDialog
        open={subDialog === 'deleteFolder'}
        title='Delete Folder?'
        description={`This will permanently delete "${targetFolder}" and all its images.`}
        onConfirm={() => {
          deleteFolder(targetFolder);
          closeSub();
        }}
        onCancel={closeSub}
      />

      <AddImageDialog
        open={subDialog === 'addImage'}
        onClose={closeSub}
        targetFolder={targetFolder}
        onSave={(url, title) => addImage(targetFolder, url, title || undefined)}
      />

      <RenameFolderDialog
        open={subDialog === 'rename'}
        onClose={closeSub}
        targetFolder={targetFolder}
        existingFolderNames={folderNames}
        onRename={(newName) => renameFolder(targetFolder, newName)}
      />

      <NewFolderDialog
        open={subDialog === 'newFolder'}
        onClose={closeSub}
        existingFolderNames={folderNames}
        onCreate={(name) => createFolder(name)}
      />

      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className='top-0 left-0 translate-x-0 translate-y-0 flex h-screen max-h-screen w-screen max-w-none sm:max-w-none m-0 rounded-none p-0 gap-0 flex-col'>
          <DialogHeader className='px-4 py-3 border-b shrink-0'>
            <DialogTitle>Manage Images</DialogTitle>
          </DialogHeader>

          <div className='overflow-auto flex-1 p-4 space-y-4'>
            {folders.length === 0 ? (
              <p className='text-sm text-muted-foreground'>No folders yet.</p>
            ) : (
              <Accordion type='multiple' className='space-y-1'>
                {folders.map((folder) => (
                  <AccordionItem
                    key={folder.folderName}
                    value={folder.folderName}
                    className='border rounded'>
                    <div className='flex items-center px-3'>
                      <AccordionTrigger className='flex-1 hover:no-underline'>
                        <span className='flex items-center gap-1.5 text-sm font-medium'>
                          {folder.folderName}
                          <span className='text-xs text-muted-foreground font-normal leading-none'>
                            ({folder.images.length})
                          </span>
                        </span>
                      </AccordionTrigger>
                      <div className='flex gap-0.5 shrink-0'>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-7 w-7'
                          onClick={() => openSub('rename', folder.folderName)}>
                          <Pencil className='h-3.5 w-3.5' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-7 w-7 text-destructive hover:text-destructive'
                          onClick={() => openSub('deleteFolder', folder.folderName)}>
                          <Trash2 className='h-3.5 w-3.5' />
                        </Button>
                      </div>
                    </div>
                    <AccordionContent className='px-3 pb-3 space-y-2'>
                      {folder.images.length > 0 ? (
                        <div className='grid grid-cols-4 gap-2'>
                          {folder.images.map((image) => (
                            <ImageThumbnail
                              key={image.url}
                              image={image}
                              imgClassName='w-full h-20 object-cover'
                              action={
                                <Button
                                  variant='ghost'
                                  size='icon'
                                  className='h-6 w-6 ml-auto'
                                  onClick={() =>
                                    setPendingDeleteImage({ folder: folder.folderName, image })
                                  }>
                                  <Trash2 className='h-3.5 w-3.5' />
                                </Button>
                              }
                            />
                          ))}
                        </div>
                      ) : (
                        <p className='text-sm text-muted-foreground py-1'>No images yet.</p>
                      )}
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => openSub('addImage', folder.folderName)}>
                        <ImagePlus className='h-4 w-4 mr-1' />
                        Add Image
                      </Button>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>

          <div className='px-4 py-3 border-t shrink-0'>
            <Button variant='outline' size='sm' onClick={() => openSub('newFolder')}>
              <FolderPlus className='h-4 w-4 mr-1' />
              New Folder
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
