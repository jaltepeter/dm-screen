import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Image {
  id: string;
  url: string;
  title?: string;
  displayOrder: number;
}

export interface ImageFolder {
  folderName: string;
  images: Image[];
  displayOrder: number;
}

interface ImageStore {
  folders: ImageFolder[];
  createFolder: (name?: string) => void;
  renameFolder: (oldName: string, newName: string) => void;
  deleteFolder: (folderName: string) => void;
  addImage: (folderName: string, url: string, title?: string) => boolean;
  deleteImage: (folderName: string, image: Image) => void;
  updateImage: (folderName: string, imageId: string, updates: Pick<Image, 'url' | 'title'>) => void;
  moveImage: (fromFolder: string, toFolder: string, imageId: string) => void;
  reorderImages: (folderName: string, fromIndex: number, toIndex: number) => void;
  reorderFolders: (fromIndex: number, toIndex: number) => void;
}

const DEFAULT_FOLDERS: ImageFolder[] = [
  {
    folderName: 'Goblins',
    displayOrder: 0,
    images: [
      {
        id: crypto.randomUUID(),
        url: 'https://legendary-digital-network-assets.s3.amazonaws.com/geekandsundry/wp-content/uploads/2016/11/goblin-step1.png',
        displayOrder: 0
      }
    ]
  }
];

export const STORE_KEY = 'dm-screen/images';

export function migrateImageStore(state: unknown, version: number): { folders: ImageFolder[] } {
  let s = state as { folders: ImageFolder[] };
  if (version < 1) {
    // Stamp a stable UUID onto any image that was saved before id was added.
    s = {
      ...s,
      folders: s.folders.map((f) => ({
        ...f,
        images: f.images.map((img) =>
          (img as Image).id ? img : { ...img, id: crypto.randomUUID() }
        )
      }))
    };
  }
  if (version < 2) {
    s = {
      ...s,
      folders: s.folders.map((f, fi) => ({
        ...f,
        displayOrder: fi,
        images: f.images.map((img, ii) => ({ ...img, displayOrder: ii }))
      }))
    };
  }
  return s;
}

function stampDisplayOrder(arr: ImageFolder[]): ImageFolder[] {
  return arr.map((f, fi) => ({
    ...f,
    displayOrder: fi,
    images: f.images.map((img, ii) => ({ ...img, displayOrder: ii }))
  }));
}

function reorder<T>(arr: T[], from: number, to: number): T[] {
  const result = [...arr];
  const [item] = result.splice(from, 1);
  result.splice(to, 0, item);
  return result;
}

export const useImageStore = create<ImageStore>()(
  persist(
    (set, get) => ({
      folders: DEFAULT_FOLDERS,

      createFolder: (name) => {
        const { folders } = get();
        let folderName = name?.trim();
        if (!folderName) {
          const numNewFolders = folders.filter((f) => f.folderName.startsWith('New Folder')).length;
          const suffix = numNewFolders > 0 ? ` ${numNewFolders + 1}` : '';
          folderName = `New Folder${suffix}`;
        }
        set({
          folders: [...folders, { folderName, images: [], displayOrder: folders.length }]
        });
      },

      renameFolder: (oldName, newName) => {
        set({
          folders: get().folders.map((f) =>
            f.folderName === oldName ? { ...f, folderName: newName } : f
          )
        });
      },

      deleteFolder: (folderName) => {
        const remaining = get().folders.filter((f) => f.folderName !== folderName);
        set({ folders: remaining.map((f, i) => ({ ...f, displayOrder: i })) });
      },

      addImage: (folderName, url, title) => {
        if (!url) return false;
        const folder = get().folders.find((f) => f.folderName === folderName);
        if (folder?.images.some((i) => i.url === url)) return false;
        set({
          folders: get().folders.map((f) =>
            f.folderName === folderName
              ? {
                  ...f,
                  images: [
                    ...f.images,
                    { id: crypto.randomUUID(), url, title, displayOrder: f.images.length }
                  ]
                }
              : f
          )
        });
        return true;
      },

      deleteImage: (folderName, image) => {
        set({
          folders: get().folders.map((f) => {
            if (f.folderName !== folderName) return f;
            const remaining = f.images.filter((i) => i.id !== image.id);
            return { ...f, images: remaining.map((img, i) => ({ ...img, displayOrder: i })) };
          })
        });
      },

      updateImage: (folderName, imageId, updates) => {
        set({
          folders: get().folders.map((f) =>
            f.folderName !== folderName
              ? f
              : {
                  ...f,
                  images: f.images.map((img) => (img.id === imageId ? { ...img, ...updates } : img))
                }
          )
        });
      },

      moveImage: (fromFolder, toFolder, imageId) => {
        if (fromFolder === toFolder) return;
        const folders = get().folders;
        const srcFolder = folders.find((f) => f.folderName === fromFolder);
        const image = srcFolder?.images.find((i) => i.id === imageId);
        if (!image) return;
        set({
          folders: stampDisplayOrder(
            folders.map((f) => {
              if (f.folderName === fromFolder) {
                return { ...f, images: f.images.filter((i) => i.id !== imageId) };
              }
              if (f.folderName === toFolder) {
                return { ...f, images: [...f.images, image] };
              }
              return f;
            })
          )
        });
      },

      reorderImages: (folderName, fromIndex, toIndex) => {
        set({
          folders: get().folders.map((f) => {
            if (f.folderName !== folderName) return f;
            const reordered = reorder(f.images, fromIndex, toIndex);
            return { ...f, images: reordered.map((img, i) => ({ ...img, displayOrder: i })) };
          })
        });
      },

      reorderFolders: (fromIndex, toIndex) => {
        const reordered = reorder(get().folders, fromIndex, toIndex);
        set({ folders: reordered.map((f, i) => ({ ...f, displayOrder: i })) });
      }
    }),
    {
      name: STORE_KEY,
      version: 2,
      migrate: migrateImageStore
    }
  )
);
