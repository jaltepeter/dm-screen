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
  const stage = useUiStore((s) => s.stage);
  const setStage = useUiStore((s) => s.setStage);
  const initiativeActive = useCombatStore((s) => s.started);
  const round = useCombatStore((s) => s.round);

  useEffect(() => {
    document.title = 'DM Screen';
  }, []);

  const handleClearStage = () => {
    setStage([]);
    sendMessage({ cmd: 'stage_update', payload: { images: [] } });
  };

  return (
    <div className='flex flex-col h-screen'>
      {/* Header */}
      <header className='flex items-center gap-3 px-3 py-2 border-b bg-card shrink-0'>
        <span className='text-sm font-semibold tracking-wide'>DM Screen</span>

        <div className='flex-1' />

        {/* Active-combat indicator — prominent, jumps to the Combat tab */}
        {initiativeActive && (
          <button
            onClick={() => setSearchParams({ tab: 'combat' })}
            title='Go to Combat'
            className='flex items-center gap-1.5 rounded-md border border-amber-500/60 bg-amber-500/15 px-2.5 py-1 text-sm font-semibold text-amber-400 shadow-[0_0_0_1px_rgba(245,158,11,0.15)] animate-pulse hover:bg-amber-500/25 transition-colors'>
            <Swords className='h-4 w-4' />
            <span>Combat</span>
            <span className='font-normal text-amber-300/80'>· Round {round}</span>
          </button>
        )}

        {/* Player view indicator — thumbnails of what's on the player stage */}
        {stage.length > 0 && (
          <div className='flex items-center gap-1.5'>
            <div className='flex items-center'>
              {stage.slice(0, 3).map((img, i) => (
                <img
                  key={img.id}
                  src={img.url}
                  alt={img.title}
                  className='h-8 w-8 rounded object-cover border border-border bg-card'
                  style={{ marginLeft: i === 0 ? 0 : -10, zIndex: stage.length - i }}
                  title={img.title ?? img.url}
                />
              ))}
              {stage.length > 3 && (
                <span className='ml-1 text-xs text-muted-foreground'>+{stage.length - 3}</span>
              )}
            </div>
            <button
              onClick={handleClearStage}
              title='Clear player stage'
              className='inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'>
              <X className='h-3.5 w-3.5' />
              Clear stage
            </button>
          </div>
        )}

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
