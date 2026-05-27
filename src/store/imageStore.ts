import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Image {
  id: string;
  url: string;
  title?: string;
}

export interface ImageFolder {
  folderName: string;
  images: Image[];
}

interface ImageStore {
  folders: ImageFolder[];
  createFolder: (name?: string) => void;
  renameFolder: (oldName: string, newName: string) => void;
  deleteFolder: (folderName: string) => void;
  addImage: (folderName: string, url: string, title?: string) => boolean;
  deleteImage: (folderName: string, image: Image) => void;
}

const DEFAULT_FOLDERS: ImageFolder[] = [
  {
    folderName: 'Goblins',
    images: [
      {
        id: crypto.randomUUID(),
        url: 'https://legendary-digital-network-assets.s3.amazonaws.com/geekandsundry/wp-content/uploads/2016/11/goblin-step1.png'
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
  return s;
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
        set({ folders: [...folders, { folderName, images: [] }] });
      },

      renameFolder: (oldName, newName) => {
        set({
          folders: get().folders.map((f) =>
            f.folderName === oldName ? { ...f, folderName: newName } : f
          )
        });
      },

      deleteFolder: (folderName) => {
        set({ folders: get().folders.filter((f) => f.folderName !== folderName) });
      },

      addImage: (folderName, url, title) => {
        if (!url) return false;
        const folder = get().folders.find((f) => f.folderName === folderName);
        if (folder?.images.some((i) => i.url === url)) return false;
        set({
          folders: get().folders.map((f) =>
            f.folderName === folderName
              ? { ...f, images: [...f.images, { id: crypto.randomUUID(), url, title }] }
              : f
          )
        });
        return true;
      },

      deleteImage: (folderName, image) => {
        set({
          folders: get().folders.map((f) =>
            f.folderName === folderName
              ? { ...f, images: f.images.filter((i) => i.id !== image.id) }
              : f
          )
        });
      }
    }),
    {
      name: STORE_KEY,
      version: 1,
      migrate: migrateImageStore
    }
  )
);
