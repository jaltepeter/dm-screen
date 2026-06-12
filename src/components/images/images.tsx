import { useState } from 'react';
import FolderList from './folder-list';
import ImageSender from './imageSender';
import { sendMessage, StageImage } from '../../lib/sync';
import { useImageStore, Image } from '../../store/imageStore';
import { useUiStore } from '../../store/uiStore';
import SectionHeader from '@/components/ui/section-header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Layers, X } from 'lucide-react';

function toStageImage(item: Image): StageImage {
  return {
    id: item.id,
    url: item.url,
    // Hidden-name images stay nameless to players (the DM still sees the title locally).
    title: item.hideName ? undefined : item.title,
    aspectRatio: item.aspectRatio
  };
}

export default function Images() {
  const folders = useImageStore((s) => s.folders);
  const stage = useUiStore((s) => s.stage);
  const setStage = useUiStore((s) => s.setStage);
  const [search, setSearch] = useState('');

  const stagedIds = new Set(stage.map((i) => i.id));
  // Staged images whose name is currently sent to players (title present).
  const nameShownIds = new Set(stage.filter((i) => i.title).map((i) => i.id));

  const pushStage = (next: StageImage[]) => {
    setStage(next);
    sendMessage({ cmd: 'stage_update', payload: { images: next } });
  };

  const toggleImage = (item: Image) => {
    const next = stagedIds.has(item.id)
      ? stage.filter((i) => i.id !== item.id)
      : [...stage, toStageImage(item)];
    pushStage(next);
  };

  // Flip a staged image's name visibility for players without touching its saved
  // hideName setting — just adds/removes the title on the live stage entry.
  const toggleName = (item: Image) => {
    if (!item.title) return;
    const next = stage.map((i) =>
      i.id === item.id ? { ...i, title: i.title ? undefined : item.title } : i
    );
    pushStage(next);
  };

  const clearStage = () => pushStage([]);

  return (
    <div className='space-y-4'>
      <section>
        <SectionHeader className='mb-2'>Quick Send</SectionHeader>
        <ImageSender onSendImage={toggleImage} />
      </section>

      <section>
        <div className='flex items-center justify-between mb-2'>
          <SectionHeader className='mb-0'>Saved Images</SectionHeader>
          {stage.length > 0 && (
            <div className='flex items-center gap-2 text-xs text-muted-foreground'>
              <span className='flex items-center gap-1'>
                <Layers className='h-3.5 w-3.5' />
                On stage ({stage.length})
              </span>
              <Button variant='outline' size='sm' className='h-6 px-2' onClick={clearStage}>
                <X className='h-3 w-3 mr-1' />
                Clear
              </Button>
            </div>
          )}
        </div>
        <div className='relative mb-3'>
          <Input
            placeholder='Search images…'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='pr-8'
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className='absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'>
              <X className='h-4 w-4' />
            </button>
          )}
        </div>
        <FolderList
          folders={folders}
          search={search}
          stagedIds={stagedIds}
          nameShownIds={nameShownIds}
          onToggleImage={toggleImage}
          onToggleName={toggleName}
        />
      </section>
    </div>
  );
}
