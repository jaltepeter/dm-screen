import { useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ImportButton, { ImportButtonHandle } from '../components/ui/import-button';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { ClipboardList, MoreHorizontal, Swords, Upload, Download, X } from 'lucide-react';
import Characters from '../components/characters/characters';
import InitiativeTracker from '../components/characters/initiative/initiativeTracker';
import Images from '../components/images/images';
import GoLiveButton from '../components/campaigns/goLiveButton';
import { useUiStore } from '../store/uiStore';
import { useCombatStore } from '../store/combatStore';
import { sendMessage } from '../lib/sync';
import { exportData } from '../lib/exportImport';
import DebugPanel from '@/components/ui/debug-panel';

const VALID_TABS = ['home', 'combat', 'images'] as const;
type DmTab = (typeof VALID_TABS)[number];

const DmScreen = () => {
  const importButtonRef = useRef<ImportButtonHandle>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab: DmTab = (VALID_TABS as readonly string[]).includes(searchParams.get('tab') ?? '')
    ? (searchParams.get('tab') as DmTab)
    : 'home';
  const lastSentImage = useUiStore((s) => s.lastSentImage);
  const setLastSentImage = useUiStore((s) => s.setLastSentImage);
  const initiativeActive = useCombatStore((s) => s.actors.length > 0);

  useEffect(() => {
    document.title = 'DM Screen';
  }, []);

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

        <GoLiveButton />

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
                importButtonRef.current?.openFileDialog();
              }}>
              <Download className='h-4 w-4 mr-2' />
              Import Data
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <ImportButton ref={importButtonRef} className='hidden' />
      </header>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setSearchParams({ tab: v })}
        className='flex flex-col flex-1 min-h-0'>
        <TabsList className='shrink-0 w-full mt-2 rounded-none px-3'>
          <TabsTrigger value='home'>Home</TabsTrigger>
          <TabsTrigger value='combat'>Combat</TabsTrigger>
          <TabsTrigger value='images'>Images</TabsTrigger>
        </TabsList>

        <TabsContent value='home' className='flex-1 overflow-hidden flex flex-col p-3 mt-0'>
          <Characters />
        </TabsContent>

        <TabsContent value='combat' className='flex-1 overflow-hidden flex flex-col mt-0'>
          <InitiativeTracker />
        </TabsContent>

        <TabsContent value='images' className='flex-1 overflow-auto p-3 mt-0'>
          <Images />
        </TabsContent>
      </Tabs>
      <DebugPanel />
    </div>
  );
};

export default DmScreen;
