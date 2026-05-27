import { useEffect, useRef, useState } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, MonitorPlay, Swords } from 'lucide-react';
import Characters from '../components/characters/characters';
import ManageCharactersDialog from '../components/characters/manageCharactersDialog';
import InitiativeTracker from '../components/characters/initiative/initiativeTracker';
import Images from '../components/images/images';
import ManageImagesDialog from '../components/images/manageImagesDialog';
import DrawerContents from '../components/drawerContents';
import ManageStatBlocksDialog from '../components/encounters/manageStatBlocksDialog';
import ManageEncountersDialog from '../components/encounters/manageEncountersDialog';
import { useUiStore } from '../store/uiStore';
import { exportData, importData } from '../lib/exportImport';

const DmScreen = () => {
  const [isManageCharactersOpen, setIsManageCharactersOpen] = useState(false);
  const [isManageImagesOpen, setIsManageImagesOpen] = useState(false);
  const [isManageStatBlocksOpen, setIsManageStatBlocksOpen] = useState(false);
  const [isManageEncountersOpen, setIsManageEncountersOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const lastSentImage = useUiStore((s) => s.lastSentImage);
  const initiativeActive = useUiStore((s) => s.initiativeActive);

  useEffect(() => {
    document.title = 'DM Screen';
  }, []);

  const handleOpenPlayerView = () => window.open('/players', '_blank');

  const handleManageCharacters = () => {
    setIsSheetOpen(false);
    setIsManageCharactersOpen(true);
  };

  const handleManageImages = () => {
    setIsSheetOpen(false);
    setIsManageImagesOpen(true);
  };

  const handleManageStatBlocks = () => {
    setIsSheetOpen(false);
    setIsManageStatBlocksOpen(true);
  };

  const handleManageEncounters = () => {
    setIsSheetOpen(false);
    setIsManageEncountersOpen(true);
  };

  const handleExportData = () => exportData();

  const handleImportData = () => fileInputRef.current?.click();

  return (
    <div className='flex flex-col h-screen'>
      {/* Header */}
      <header className='flex items-center gap-3 px-3 py-2 border-b bg-card shrink-0'>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant='ghost' size='icon' className='h-8 w-8'>
              <Menu className='h-4 w-4' />
            </Button>
          </SheetTrigger>
          <SheetContent side='left' className='w-56 p-0 pt-8'>
            <DrawerContents
              onExport={handleExportData}
              onImport={handleImportData}
              onClickManageCharacters={handleManageCharacters}
              onClickManageImages={handleManageImages}
              onClickManageStatBlocks={handleManageStatBlocks}
              onClickManageEncounters={handleManageEncounters}
            />
          </SheetContent>
        </Sheet>

        <span className='text-sm font-semibold tracking-wide'>DM Screen</span>

        <div className='flex-1' />

        {/* Player view indicator */}
        <div className='flex items-center gap-1.5'>
          {lastSentImage ? (
            <div className='relative'>
              <img
                src={lastSentImage.url}
                alt={lastSentImage.title}
                className='h-8 w-8 rounded object-cover border border-border'
                title={lastSentImage.title ?? lastSentImage.url}
              />
              {initiativeActive && (
                <span className='absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-amber-500'>
                  <Swords className='h-2 w-2 text-black' />
                </span>
              )}
            </div>
          ) : initiativeActive ? (
            <span className='flex h-6 w-6 items-center justify-center rounded bg-amber-500/20 text-amber-400'>
              <Swords className='h-3.5 w-3.5' />
            </span>
          ) : null}
        </div>

        <Button variant='outline' size='sm' onClick={handleOpenPlayerView} className='gap-1.5'>
          <MonitorPlay className='h-4 w-4' />
          Open Players
        </Button>
      </header>

      <ManageCharactersDialog
        isOpen={isManageCharactersOpen}
        onClose={() => setIsManageCharactersOpen(false)}
      />
      <ManageImagesDialog
        isOpen={isManageImagesOpen}
        onClose={() => setIsManageImagesOpen(false)}
      />
      <ManageStatBlocksDialog
        isOpen={isManageStatBlocksOpen}
        onClose={() => setIsManageStatBlocksOpen(false)}
      />
      <ManageEncountersDialog
        isOpen={isManageEncountersOpen}
        onClose={() => setIsManageEncountersOpen(false)}
      />
      <input
        ref={fileInputRef}
        type='file'
        accept='.json'
        className='hidden'
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) importData(file);
          e.target.value = '';
        }}
      />

      {/* Tabs */}
      <Tabs defaultValue='home' className='flex flex-col flex-1 min-h-0'>
        <TabsList className='shrink-0 w-full mt-2 rounded-none px-3'>
          <TabsTrigger value='home'>Home</TabsTrigger>
          <TabsTrigger value='combat'>Combat</TabsTrigger>
          <TabsTrigger value='images'>Images</TabsTrigger>
        </TabsList>

        <TabsContent value='home' className='flex-1 overflow-auto p-3 mt-0'>
          <Characters />
        </TabsContent>

        <TabsContent value='combat' className='flex-1 overflow-hidden flex flex-col mt-0'>
          <InitiativeTracker />
        </TabsContent>

        <TabsContent value='images' className='flex-1 overflow-auto p-3 mt-0'>
          <Images />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DmScreen;
