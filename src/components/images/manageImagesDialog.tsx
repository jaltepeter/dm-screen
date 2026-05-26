import { ChangeEvent, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Pencil, FolderPlus, ImagePlus } from 'lucide-react';
import { useImageStore, Image } from '../../store/imageStore';
import ConfirmDialog from '@/components/ui/confirmDialog';
import ImageThumbnail from './image-thumbnail';

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
  const [url, setUrl] = useState('');
  const [imageTitle, setImageTitle] = useState('');
  const [folderNameInput, setFolderNameInput] = useState('');
  const [nameError, setNameError] = useState('');

  const openSub = (dialog: SubDialog, folder = '') => {
    setTargetFolder(folder);
    setFolderNameInput(folder);
    setSubDialog(dialog);
  };

  const closeSub = () => {
    setSubDialog(null);
    setUrl('');
    setImageTitle('');
    setNameError('');
  };

  const handleSaveImage = () => {
    if (!url.trim()) return;
    addImage(targetFolder, url.trim(), imageTitle.trim() || undefined);
    closeSub();
  };

  const handleRename = () => {
    if (folders.some((f) => f.folderName === folderNameInput && f.folderName !== targetFolder)) {
      setNameError('A folder with that name already exists');
      return;
    }
    renameFolder(targetFolder, folderNameInput.trim());
    closeSub();
  };

  const handleDeleteFolder = () => {
    deleteFolder(targetFolder);
    closeSub();
  };

  const handleCreateFolder = () => {
    const name = folderNameInput.trim();
    if (!name) return;
    if (folders.some((f) => f.folderName === name)) {
      setNameError('A folder with that name already exists');
      return;
    }
    createFolder(name);
    closeSub();
  };

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

      <Dialog open={subDialog === 'addImage'} onOpenChange={(o) => !o && closeSub()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Image</DialogTitle>
            <DialogDescription>Save an image URL to &quot;{targetFolder}&quot;.</DialogDescription>
          </DialogHeader>
          <div className='space-y-3'>
            <div className='space-y-1'>
              <Label htmlFor='mgmt-img-title'>Title (optional)</Label>
              <Input
                id='mgmt-img-title'
                value={imageTitle}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setImageTitle(e.target.value)}
                placeholder='Dragon cave map'
              />
            </div>
            <div className='space-y-1'>
              <Label htmlFor='mgmt-img-url'>Image URL</Label>
              <Input
                id='mgmt-img-url'
                autoFocus
                value={url}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
                placeholder='https://…'
                onKeyDown={(e) => e.key === 'Enter' && handleSaveImage()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={closeSub}>
              Cancel
            </Button>
            <Button onClick={handleSaveImage} disabled={!url.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={subDialog === 'rename'} onOpenChange={(o) => !o && closeSub()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Folder</DialogTitle>
          </DialogHeader>
          <div className='space-y-1'>
            <Label htmlFor='mgmt-rename'>New name</Label>
            <Input
              id='mgmt-rename'
              autoFocus
              value={folderNameInput}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setNameError('');
                setFolderNameInput(e.target.value);
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
            />
            {nameError && <p className='text-sm text-destructive'>{nameError}</p>}
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={closeSub}>
              Cancel
            </Button>
            <Button onClick={handleRename}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={subDialog === 'deleteFolder'} onOpenChange={(o) => !o && closeSub()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Folder?</DialogTitle>
            <DialogDescription>
              This will permanently delete &quot;{targetFolder}&quot; and all its images.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={closeSub}>
              Cancel
            </Button>
            <Button variant='destructive' onClick={handleDeleteFolder}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={subDialog === 'newFolder'} onOpenChange={(o) => !o && closeSub()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Folder</DialogTitle>
          </DialogHeader>
          <div className='space-y-1'>
            <Label htmlFor='mgmt-new-folder'>Folder name</Label>
            <Input
              id='mgmt-new-folder'
              autoFocus
              value={folderNameInput}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setNameError('');
                setFolderNameInput(e.target.value);
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
            />
            {nameError && <p className='text-sm text-destructive'>{nameError}</p>}
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={closeSub}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder} disabled={!folderNameInput.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
