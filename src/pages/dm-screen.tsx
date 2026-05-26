import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, MonitorPlay, Swords } from 'lucide-react';
import Characters from '../components/characters/characters';
import InitiativeTracker from '../components/characters/initiative/initiativeTracker';
import Images from '../components/images/images';
import DrawerContents from '../components/drawerContents';
import { useCharacterStore } from '../store/characterStore';
import { useUiStore } from '../store/uiStore';

const DmScreen = () => {
  const [isManageCharactersOpen, setIsManageCharactersOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const characters = useCharacterStore((s) => s.characters);
  const lastSentImage = useUiStore((s) => s.lastSentImage);
  const initiativeActive = useUiStore((s) => s.initiativeActive);

  useEffect(() => {
    document.title = 'DM Screen';
  }, []);

  const handleOpenPlayerView = () => window.open('/dm-screen/players', '_blank');

  const handleManageCharacters = () => {
    setIsSheetOpen(false);
    setIsManageCharactersOpen(true);
  };

  const handleExportData = () => {
    // TODO: implement export
  };

  const handleImportData = () => {
    // TODO: implement import
  };

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

      {/* Tabs */}
      <Tabs defaultValue='home' className='flex flex-col flex-1 min-h-0'>
        <TabsList className='shrink-0 mx-3 mt-2 justify-start h-8 bg-transparent border-b rounded-none gap-1 px-0'>
          <TabsTrigger
            value='home'
            className='h-7 px-3 text-xs rounded-sm data-[state=active]:bg-accent'>
            Home
          </TabsTrigger>
          <TabsTrigger
            value='combat'
            className='h-7 px-3 text-xs rounded-sm data-[state=active]:bg-accent'>
            Combat
          </TabsTrigger>
          <TabsTrigger
            value='images'
            className='h-7 px-3 text-xs rounded-sm data-[state=active]:bg-accent'>
            Images
          </TabsTrigger>
        </TabsList>

        <TabsContent value='home' className='flex-1 overflow-auto p-3 mt-0'>
          <Characters
            isManageCharDialogOpen={isManageCharactersOpen}
            onCloseManageCharDialog={() => setIsManageCharactersOpen(false)}
          />
        </TabsContent>

        <TabsContent value='combat' className='flex-1 overflow-auto p-3 mt-0'>
          <InitiativeTracker characters={characters} />
        </TabsContent>

        <TabsContent value='images' className='flex-1 overflow-auto p-3 mt-0'>
          <Images />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DmScreen;
