import { useState, useRef } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCenter,
  pointerWithin,
  useDroppable,
  type CollisionDetection
} from '@dnd-kit/core';

const collisionDetection: CollisionDetection = (args) => {
  const pointerHits = pointerWithin(args);
  if (pointerHits.length > 0) return pointerHits;
  return closestCenter(args);
};
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  rectSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Trash2, Pencil, FolderPlus, ImagePlus, GripVertical, X } from 'lucide-react';
import { useImageStore, Image, ImageFolder } from '../../store/imageStore';
import DeleteConfirmDialog from '@/components/ui/delete-confirm-dialog';
import { useConfirmDelete } from '@/lib/useConfirmDelete';
import ImageThumbnail from './image-thumbnail';
import AddImageDialog from './add-image-dialog';
import RenameFolderDialog from './rename-folder-dialog';
import NewFolderDialog from './new-folder-dialog';

type SubDialog = 'addImage' | 'rename' | 'newFolder' | 'editImage' | null;

// ── Sortable folder item ────────────────────────────────────────────────────

interface SortableFolderProps {
  folder: ImageFolder;
  isDragActive: boolean;
  activeDragType: 'folder' | 'image' | null;
  activeImageId: string | null;
  search: string;
  onRequestRename: () => void;
  onRequestDelete: () => void;
  onRequestAddImage: () => void;
  onRequestEditImage: (image: Image) => void;
  onRequestDeleteImage: (image: Image) => void;
}

function SortableFolder({
  folder,
  activeDragType,
  activeImageId,
  search,
  onRequestRename,
  onRequestDelete,
  onRequestAddImage,
  onRequestEditImage,
  onRequestDeleteImage
}: SortableFolderProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `folder:${folder.folderName}`,
    data: { type: 'folder' }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : undefined
  };

  // Folder header as a drop target for images being dragged
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `folder-drop:${folder.folderName}`,
    data: { type: 'folder-header', folderName: folder.folderName },
    disabled: activeDragType !== 'image'
  });

  const sortedImages = [...folder.images].sort((a, b) => a.displayOrder - b.displayOrder);
  const filteredImages = search
    ? sortedImages.filter((img) => {
        const term = search.toLowerCase();
        return img.title
          ? img.title.toLowerCase().includes(term)
          : img.url.toLowerCase().includes(term);
      })
    : sortedImages;

  const isImageDragActive = activeDragType === 'image';
  const showDropHighlight = isImageDragActive && isOver;
  const showPotentialTarget = isImageDragActive && !isOver;

  return (
    <div ref={setNodeRef} style={style}>
      <AccordionItem value={folder.folderName} className='border rounded'>
        <div
          ref={setDropRef}
          className={`flex items-center px-3 transition-colors ${showDropHighlight ? 'bg-accent' : showPotentialTarget ? 'bg-muted/50' : ''}`}>
          <button
            {...attributes}
            {...listeners}
            className='mr-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground focus:outline-none'
            tabIndex={-1}
            aria-label='Drag to reorder folder'>
            <GripVertical className='h-4 w-4' />
          </button>
          <AccordionTrigger className='flex-1 hover:no-underline'>
            <span className='flex items-center gap-1.5 text-sm font-medium'>
              {folder.folderName}
              <span className='text-xs text-muted-foreground font-normal leading-none'>
                {search
                  ? `(${filteredImages.length} of ${sortedImages.length})`
                  : `(${sortedImages.length})`}
              </span>
            </span>
          </AccordionTrigger>
          <div className='flex gap-0.5 shrink-0'>
            <Button variant='ghost' size='icon' className='h-7 w-7' onClick={onRequestRename}>
              <Pencil className='h-3.5 w-3.5' />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              className='h-7 w-7 text-destructive hover:text-destructive'
              onClick={onRequestDelete}>
              <Trash2 className='h-3.5 w-3.5' />
            </Button>
          </div>
        </div>

        <AccordionContent className='px-3 pb-3 space-y-2'>
          {filteredImages.length > 0 ? (
            <SortableContext
              items={filteredImages.map((img) => `image:${img.id}`)}
              strategy={rectSortingStrategy}>
              <div className='grid grid-cols-6 gap-2'>
                {filteredImages.map((image) => (
                  <SortableImage
                    key={image.id}
                    image={image}
                    folderName={folder.folderName}
                    isBeingDragged={activeImageId === image.id}
                    onRequestEdit={() => onRequestEditImage(image)}
                    onRequestDelete={() => onRequestDeleteImage(image)}
                  />
                ))}
              </div>
            </SortableContext>
          ) : (
            <p className='text-sm text-muted-foreground py-1'>
              {search ? 'No matching images.' : 'No images yet.'}
            </p>
          )}
          <Button variant='outline' size='sm' onClick={onRequestAddImage}>
            <ImagePlus className='h-4 w-4 mr-1' />
            Add Image
          </Button>
        </AccordionContent>
      </AccordionItem>
    </div>
  );
}

// ── Sortable image item ─────────────────────────────────────────────────────

interface SortableImageProps {
  image: Image;
  folderName: string;
  isBeingDragged: boolean;
  onRequestEdit: () => void;
  onRequestDelete: () => void;
}

function SortableImage({
  image,
  folderName,
  isBeingDragged,
  onRequestEdit,
  onRequestDelete
}: SortableImageProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `image:${image.id}`,
    data: { type: 'image', imageId: image.id, folderName }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : undefined
  };

  return (
    <div ref={setNodeRef} style={style} className='cursor-move' {...attributes} {...listeners}>
      <HoverCard openDelay={300}>
        <HoverCardTrigger asChild>
          <div style={{ pointerEvents: isBeingDragged ? 'none' : undefined }}>
            <ImageThumbnail
              image={image}
              imgClassName='w-full h-24 object-cover'
              action={
                <div className='flex gap-0.5 ml-auto'>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-6 w-6'
                    onClick={(e) => {
                      e.stopPropagation();
                      onRequestEdit();
                    }}>
                    <Pencil className='h-3 w-3' />
                  </Button>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-6 w-6'
                    onClick={(e) => {
                      e.stopPropagation();
                      onRequestDelete();
                    }}>
                    <Trash2 className='h-3 w-3' />
                  </Button>
                </div>
              }
            />
          </div>
        </HoverCardTrigger>
        {!isBeingDragged && (
          <HoverCardContent side='right' sideOffset={8} className='w-[min(480px,55vw)] p-2'>
            <img
              src={image.url}
              alt={image.title}
              className='w-full rounded object-contain max-h-[70vh]'
            />
            {image.title && (
              <p className='text-xs text-muted-foreground mt-1 truncate'>{image.title}</p>
            )}
          </HoverCardContent>
        )}
      </HoverCard>
    </div>
  );
}

// ── Main panel ──────────────────────────────────────────────────────────────

export default function ManageImagesPanel() {
  const folders = useImageStore((s) => s.folders);
  const createFolder = useImageStore((s) => s.createFolder);
  const renameFolder = useImageStore((s) => s.renameFolder);
  const deleteFolderFn = useImageStore((s) => s.deleteFolder);
  const addImage = useImageStore((s) => s.addImage);
  const deleteImageFn = useImageStore((s) => s.deleteImage);
  const updateImage = useImageStore((s) => s.updateImage);
  const moveImage = useImageStore((s) => s.moveImage);
  const reorderImages = useImageStore((s) => s.reorderImages);
  const reorderFolders = useImageStore((s) => s.reorderFolders);

  const [targetFolder, setTargetFolder] = useState('');
  const [editTarget, setEditTarget] = useState<Image | null>(null);
  const [subDialog, setSubDialog] = useState<SubDialog>(null);
  const [openFolders, setOpenFolders] = useState<string[]>(() => folders.map((f) => f.folderName));
  const [search, setSearch] = useState('');
  const preSearchOpen = useRef<string[] | null>(null);

  // DnD state
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [activeDragType, setActiveDragType] = useState<'folder' | 'image' | null>(null);
  const [activeImageId, setActiveImageId] = useState<string | null>(null);
  const [activeDragImage, setActiveDragImage] = useState<Image | null>(null);

  const deleteImage = useConfirmDelete<{ folder: string; image: Image }>();
  const deleteFolder = useConfirmDelete<string>();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const sortedFolders = [...folders].sort((a, b) => a.displayOrder - b.displayOrder);
  const folderNames = sortedFolders.map((f) => f.folderName);

  const openSub = (dialog: SubDialog, folder = '') => {
    setTargetFolder(folder);
    setSubDialog(dialog);
  };

  const closeSub = () => {
    setSubDialog(null);
    setEditTarget(null);
  };

  const handleSearchChange = (value: string) => {
    if (!search && value) {
      // First keystroke — capture current open state
      preSearchOpen.current = openFolders;
      // Auto-expand folders with matches
      const term = value.toLowerCase();
      const toOpen = sortedFolders
        .filter((f) =>
          f.images.some((img) =>
            img.title
              ? img.title.toLowerCase().includes(term)
              : img.url.toLowerCase().includes(term)
          )
        )
        .map((f) => f.folderName);
      setOpenFolders(toOpen);
    } else if (search && !value) {
      // Cleared — restore pre-search state
      setOpenFolders(preSearchOpen.current ?? []);
      preSearchOpen.current = null;
    } else if (value) {
      // Already searching — update expanded set
      const term = value.toLowerCase();
      const toOpen = sortedFolders
        .filter((f) =>
          f.images.some((img) =>
            img.title
              ? img.title.toLowerCase().includes(term)
              : img.url.toLowerCase().includes(term)
          )
        )
        .map((f) => f.folderName);
      setOpenFolders(toOpen);
    }
    setSearch(value);
  };

  const handleDragStart = (event: DragStartEvent) => {
    document.body.style.cursor = 'grabbing';
    const { id, data } = event.active;
    setActiveDragId(String(id));
    const type = data.current?.type as 'folder' | 'image';
    setActiveDragType(type);
    if (type === 'image') {
      const imgId = data.current?.imageId as string;
      const folderName = data.current?.folderName as string;
      setActiveImageId(imgId);
      const img =
        folders.find((f) => f.folderName === folderName)?.images.find((i) => i.id === imgId) ??
        null;
      setActiveDragImage(img);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    document.body.style.cursor = '';
    const { active, over } = event;
    setActiveDragId(null);
    setActiveDragType(null);
    setActiveImageId(null);
    setActiveDragImage(null);

    if (!over) return;

    const activeType = active.data.current?.type;

    if (activeType === 'folder') {
      const fromId = String(active.id).replace('folder:', '');
      const toId = String(over.id).replace('folder:', '');
      if (fromId === toId) return;
      const fromIndex = sortedFolders.findIndex((f) => f.folderName === fromId);
      const toIndex = sortedFolders.findIndex((f) => f.folderName === toId);
      if (fromIndex !== -1 && toIndex !== -1) reorderFolders(fromIndex, toIndex);
      return;
    }

    if (activeType === 'image') {
      const imageId = active.data.current?.imageId as string;
      const fromFolder = active.data.current?.folderName as string;
      const overId = String(over.id);

      // Drop onto a folder header (via droppable zone or sortable zone)
      if (overId.startsWith('folder-drop:') || overId.startsWith('folder:')) {
        const toFolder = overId.startsWith('folder-drop:')
          ? overId.replace('folder-drop:', '')
          : overId.replace('folder:', '');
        if (toFolder !== fromFolder) moveImage(fromFolder, toFolder, imageId);
        return;
      }

      // Drop onto another image (reorder within same folder)
      if (overId.startsWith('image:')) {
        const toImageId = overId.replace('image:', '');
        const folder = sortedFolders.find((f) => f.folderName === fromFolder);
        if (!folder) return;
        const sortedImages = [...folder.images].sort((a, b) => a.displayOrder - b.displayOrder);
        const fromIndex = sortedImages.findIndex((i) => i.id === imageId);
        const toIndex = sortedImages.findIndex((i) => i.id === toImageId);
        if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
          reorderImages(fromFolder, fromIndex, toIndex);
        }
      }
    }
  };

  return (
    <>
      <DeleteConfirmDialog
        target={deleteImage.target}
        title='Delete image?'
        getDescription={({ image }) =>
          image.title
            ? `"${image.title}" will be permanently deleted.`
            : 'This image will be permanently deleted.'
        }
        onConfirm={({ folder, image }) => deleteImageFn(folder, image)}
        onCancel={deleteImage.clearDelete}
      />

      <DeleteConfirmDialog
        target={deleteFolder.target}
        title='Delete Folder?'
        getDescription={(folder) => `This will permanently delete "${folder}" and all its images.`}
        onConfirm={(folder) => deleteFolderFn(folder)}
        onCancel={deleteFolder.clearDelete}
      />

      <AddImageDialog
        open={subDialog === 'addImage'}
        onClose={closeSub}
        targetFolder={targetFolder}
        onSave={(url, title) => addImage(targetFolder, url, title || undefined)}
      />

      <AddImageDialog
        key={editTarget?.id ?? ''}
        open={subDialog === 'editImage'}
        onClose={closeSub}
        targetFolder={targetFolder}
        initialValues={
          editTarget ? { url: editTarget.url, title: editTarget.title ?? '' } : undefined
        }
        onSave={(url, title) => {
          if (!editTarget) return false;
          const folder = folders.find((f) => f.folderName === targetFolder);
          const isDupe = folder?.images.some((img) => img.url === url && img.id !== editTarget.id);
          if (isDupe) return false;
          updateImage(targetFolder, editTarget.id, { url, title: title || undefined });
          return true;
        }}
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
        onCreate={(name) => {
          createFolder(name);
          setOpenFolders((prev) => [...prev, name]);
        }}
      />

      <div className='flex flex-col flex-1 min-h-0'>
        <div className='overflow-auto flex-1 p-4 space-y-4'>
          <div className='relative'>
            <Input
              placeholder='Search images…'
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className='pr-8'
            />
            {search && (
              <button
                onClick={() => handleSearchChange('')}
                className='absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'>
                <X className='h-4 w-4' />
              </button>
            )}
          </div>

          {sortedFolders.length === 0 ? (
            <p className='text-sm text-muted-foreground'>No folders yet.</p>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={collisionDetection}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}>
              <SortableContext
                items={sortedFolders.map((f) => `folder:${f.folderName}`)}
                strategy={verticalListSortingStrategy}>
                <Accordion
                  type='multiple'
                  value={openFolders}
                  onValueChange={setOpenFolders}
                  className='space-y-1'>
                  {sortedFolders.map((folder) => (
                    <SortableFolder
                      key={folder.folderName}
                      folder={folder}
                      isDragActive={!!activeDragId}
                      activeDragType={activeDragType}
                      activeImageId={activeImageId}
                      search={search}
                      onRequestRename={() => openSub('rename', folder.folderName)}
                      onRequestDelete={() => deleteFolder.requestDelete(folder.folderName)}
                      onRequestAddImage={() => openSub('addImage', folder.folderName)}
                      onRequestEditImage={(img) => {
                        setEditTarget(img);
                        openSub('editImage', folder.folderName);
                      }}
                      onRequestDeleteImage={(img) =>
                        deleteImage.requestDelete({ folder: folder.folderName, image: img })
                      }
                    />
                  ))}
                </Accordion>
              </SortableContext>
              <DragOverlay>
                {activeDragImage && (
                  <div className='w-32 opacity-90 shadow-lg rounded overflow-hidden'>
                    <ImageThumbnail
                      image={activeDragImage}
                      imgClassName='w-full h-24 object-cover'
                      action={null}
                    />
                  </div>
                )}
              </DragOverlay>
            </DndContext>
          )}
        </div>

        <div className='px-4 py-3 border-t shrink-0 flex items-center justify-between'>
          <Button variant='outline' size='sm' onClick={() => openSub('newFolder')}>
            <FolderPlus className='h-4 w-4 mr-1' />
            New Folder
          </Button>
          {sortedFolders.length > 0 && (
            <Button
              variant='ghost'
              size='sm'
              onClick={() =>
                setOpenFolders(
                  openFolders.length === sortedFolders.length
                    ? []
                    : sortedFolders.map((f) => f.folderName)
                )
              }>
              {openFolders.length === sortedFolders.length ? 'Collapse All' : 'Expand All'}
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
