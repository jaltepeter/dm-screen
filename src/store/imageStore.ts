import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Image {
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
  addImage: (folderName: string, url: string, title?: string) => void;
  deleteImage: (folderName: string, image: Image) => void;
}

const DEFAULT_FOLDERS: ImageFolder[] = [
  {
    folderName: 'Goblins',
    images: [
      {
        url: 'https://legendary-digital-network-assets.s3.amazonaws.com/geekandsundry/wp-content/uploads/2016/11/goblin-step1.png'
      }
    ]
  }
];

export const STORE_KEY = 'dm-screen/images';

export function migrateImageStore(state: unknown, _version: number): { folders: ImageFolder[] } {
  return state as { folders: ImageFolder[] };
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
        if (!url) return;
        set({
          folders: get().folders.map((f) =>
            f.folderName === folderName ? { ...f, images: [...f.images, { url, title }] } : f
          )
        });
      },

      deleteImage: (folderName, image) => {
        set({
          folders: get().folders.map((f) =>
            f.folderName === folderName ? { ...f, images: f.images.filter((i) => i !== image) } : f
          )
        });
      }
    }),
    {
      name: STORE_KEY,
      version: 0,
      migrate: migrateImageStore
    }
  )
);
