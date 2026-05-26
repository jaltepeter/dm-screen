import { ChangeEvent, useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MoreVertical, ImagePlus, FolderPlus, Pencil, FolderX } from 'lucide-react';
import ImageGrid from './imageGrid';
import { Image, ImageFolder } from '../../store/imageStore';

interface FolderListProps {
  folders: ImageFolder[];
  onCreateFolder: () => void;
  onRenameFolder: (oldName: string, newName: string) => void;
  onDeleteFolder: (folderName: string) => void;
  onSendImage: (image: Image) => void;
  onDeleteImage: (args: { folderName: string; image: Image }) => void;
  onAddPhoto: (folderName: string, url: string, title?: string) => void;
}

type ActiveDialog = 'addImage' | 'rename' | 'delete' | null;

export default function FolderList({
  folders,
  onRenameFolder,
  onDeleteFolder,
  onCreateFolder,
  onSendImage,
  onDeleteImage,
  onAddPhoto
}: FolderListProps) {
  const [targetFolder, setTargetFolder] = useState('');
  const [activeDialog, setActiveDialog] = useState<ActiveDialog>(null);
  const [url, setUrl] = useState('');
  const [imageTitle, setImageTitle] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [renameError, setRenameError] = useState('');

  const openDialog = (dialog: ActiveDialog, folderName: string) => {
    setTargetFolder(folderName);
    setNewFolderName(folderName);
    setActiveDialog(dialog);
  };

  const closeDialog = () => {
    setActiveDialog(null);
    setUrl('');
    setImageTitle('');
    setRenameError('');
  };

  const handleSaveImage = () => {
    if (url.trim()) {
      onAddPhoto(targetFolder, url.trim(), imageTitle.trim() || undefined);
      closeDialog();
    }
  };

  const handleRename = () => {
    if (folders.some((f) => f.folderName === newFolderName && f.folderName !== targetFolder)) {
      setRenameError('A folder with that name already exists');
      return;
    }
    onRenameFolder(targetFolder, newFolderName);
    closeDialog();
  };

  const handleDelete = () => {
    onDeleteFolder(targetFolder);
    closeDialog();
  };

  if (folders.length === 0) {
    return (
      <Button variant='outline' onClick={onCreateFolder}>
        <FolderPlus className='h-4 w-4 mr-2' />
        Create a Folder
      </Button>
    );
  }

  return (
    <>
      <Accordion
        type='single'
        collapsible
        defaultValue={folders[0]?.folderName}
        className='space-y-1'>
        {folders.map((folder) => (
          <AccordionItem
            key={folder.folderName}
            value={folder.folderName}
            className='border rounded'>
            <div className='flex items-center px-3'>
              <AccordionTrigger className='flex-1 text-sm font-medium hover:no-underline'>
                {folder.folderName}
                <span className='ml-2 text-xs text-muted-foreground font-normal'>
                  ({folder.images.length})
                </span>
              </AccordionTrigger>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghost' size='icon' className='h-7 w-7 shrink-0'>
                    <MoreVertical className='h-4 w-4' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem onClick={() => openDialog('addImage', folder.folderName)}>
                    <ImagePlus className='h-4 w-4 mr-2' />
                    Add Image
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => openDialog('rename', folder.folderName)}>
                    <Pencil className='h-4 w-4 mr-2' />
                    Rename Folder
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onCreateFolder}>
                    <FolderPlus className='h-4 w-4 mr-2' />
                    New Folder
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className='text-destructive'
                    onClick={() => openDialog('delete', folder.folderName)}>
                    <FolderX className='h-4 w-4 mr-2' />
                    Delete Folder
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <AccordionContent className='px-3 pb-3'>
              {folder.images.length > 0 ? (
                <ImageGrid
                  folderName={folder.folderName}
                  images={folder.images}
                  onSendImage={onSendImage}
                  onDeleteImage={onDeleteImage}
                />
              ) : (
                <p className='text-sm text-muted-foreground py-2'>No images yet.</p>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Add Image Dialog */}
      <Dialog open={activeDialog === 'addImage'} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Image</DialogTitle>
            <DialogDescription>
              Save an image URL to the &quot;{targetFolder}&quot; folder.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-3'>
            <div className='space-y-1'>
              <Label htmlFor='img-title'>Title (optional)</Label>
              <Input
                id='img-title'
                value={imageTitle}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setImageTitle(e.target.value)}
                placeholder='Goblin archer'
              />
            </div>
            <div className='space-y-1'>
              <Label htmlFor='img-url'>Image URL</Label>
              <Input
                id='img-url'
                autoFocus
                value={url}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
                placeholder='https://…'
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={closeDialog}>
              Cancel
            </Button>
            <Button onClick={handleSaveImage} disabled={!url.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={activeDialog === 'rename'} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Folder</DialogTitle>
          </DialogHeader>
          <div className='space-y-1'>
            <Label htmlFor='folder-name'>New name</Label>
            <Input
              id='folder-name'
              autoFocus
              value={newFolderName}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setRenameError('');
                setNewFolderName(e.target.value);
              }}
            />
            {renameError && <p className='text-sm text-destructive'>{renameError}</p>}
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={closeDialog}>
              Cancel
            </Button>
            <Button onClick={handleRename}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={activeDialog === 'delete'} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Folder?</DialogTitle>
            <DialogDescription>
              This will permanently delete &quot;{targetFolder}&quot; and all its saved images.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={closeDialog}>
              Cancel
            </Button>
            <Button variant='destructive' onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
