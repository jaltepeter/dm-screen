import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  ClipboardList,
  MonitorPlay,
  MoreHorizontal,
  Swords,
  Upload,
  Download,
  X
} from 'lucide-react';
import Characters from '../components/characters/characters';
import InitiativeTracker from '../components/characters/initiative/initiativeTracker';
import Images from '../components/images/images';
import { useUiStore } from '../store/uiStore';
import { useCombatStore } from '../store/combatStore';
import { onMessage, sendMessage } from '../lib/sync';
import { exportData, importData } from '../lib/exportImport';

const DmScreen = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const lastSentImage = useUiStore((s) => s.lastSentImage);
  const initiativeActive = useUiStore((s) => s.initiativeActive);
  const setLastSentImage = useUiStore((s) => s.setLastSentImage);
  const actors = useCombatStore((s) => s.actors);
  const selectedIndex = useCombatStore((s) => s.selectedIndex);
  const round = useCombatStore((s) => s.round);

  const syncStateRef = useRef({ actors, selectedIndex, round, lastSentImage });
  useEffect(() => {
    syncStateRef.current = { actors, selectedIndex, round, lastSentImage };
  });

  useEffect(() => {
    document.title = 'DM Screen';
  }, []);

  useEffect(() => {
    return onMessage((msg) => {
      if (msg.cmd === 'player_ready') {
        const { actors, selectedIndex, round, lastSentImage } = syncStateRef.current;
        sendMessage({
          cmd: 'dm_sync',
          payload: { actors, index: selectedIndex, round, image: lastSentImage }
        });
      }
    });
  }, []);

  const handleOpenPlayerView = () => window.open('/players', '_blank');

  const handleClearImage = () => {
    setLastSentImage(null);
    sendMessage({ cmd: 'clear_image' });
  };

  return (
    <div className='flex flex-col h-screen'>
      {/* Header */}
      <header className='flex items-center gap-3 px-3 py-2 border-b bg-card shrink-0'>
        <span className='text-sm font-semibold tracking-wide'>DM Screen</span>

        <div className='flex-1' />

        {/* Player view indicator */}
        <div className='flex items-center gap-1.5'>
          {lastSentImage ? (
            <div className='relative group/img'>
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
              <button
                onClick={handleClearImage}
                title='Clear player image'
                className='absolute inset-0 flex items-center justify-center rounded bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity'>
                <X className='h-4 w-4 text-white' />
              </button>
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

        <DropdownMenu>
          <DropdownMenuTrigger className='inline-flex items-center justify-center size-8 rounded-lg hover:bg-muted hover:text-foreground transition-colors'>
            <MoreHorizontal className='h-4 w-4' />
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem asChild>
              <Link to='/prep'>
                <ClipboardList className='h-4 w-4 mr-2' />
                Prep Mode
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => exportData()}>
              <Upload className='h-4 w-4 mr-2' />
              Export Data
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                fileInputRef.current?.click();
              }}>
              <Download className='h-4 w-4 mr-2' />
              Import Data
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

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
      </header>

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
