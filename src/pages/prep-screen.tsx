import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Upload } from 'lucide-react';
import ManageCampaignsPanel from '../components/campaigns/manageCampaignsPanel';
import CampaignSwitcher from '../components/campaigns/campaignSwitcher';
import ManageCharactersDialog from '../components/characters/manageCharactersDialog';
import ManageImagesDialog from '../components/images/manageImagesDialog';
import ManageStatBlocksDialog from '../components/encounters/manageStatBlocksDialog';
import ManageEncountersDialog from '../components/encounters/manageEncountersDialog';
import { exportData } from '../lib/exportImport';
import ImportButton from '../components/ui/import-button';

const VALID_TABS = ['campaigns', 'characters', 'statblocks', 'encounters', 'images'] as const;
type PrepTab = (typeof VALID_TABS)[number];

const PrepScreen = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab: PrepTab = (VALID_TABS as readonly string[]).includes(searchParams.get('tab') ?? '')
    ? (searchParams.get('tab') as PrepTab)
    : 'characters';

  useEffect(() => {
    document.title = 'DM Screen | Prep Mode';
  }, []);

  return (
    <div className='flex flex-col h-screen'>
      <header className='flex items-center gap-3 px-3 py-2 border-b border-amber-900/40 bg-amber-950/30 shrink-0'>
        <Button variant='ghost' size='sm' className='gap-1.5' asChild>
          <Link to='/'>
            <ArrowLeft className='h-4 w-4' />
            DM Screen
          </Link>
        </Button>

        <span className='text-sm font-semibold tracking-wide'>DM Screen | Prep Mode</span>

        <div className='flex-1' />

        <CampaignSwitcher />

        <Button variant='outline' size='sm' className='gap-1.5' onClick={() => exportData()}>
          <Upload className='h-4 w-4' />
          Export
        </Button>
        <ImportButton className='gap-1.5' />
      </header>

      <Tabs
        value={tab}
        onValueChange={(v) => setSearchParams({ tab: v })}
        className='flex flex-col flex-1 min-h-0'>
        <TabsList className='shrink-0 w-full mt-2 rounded-none px-3'>
          <TabsTrigger value='campaigns'>Campaigns</TabsTrigger>
          <TabsTrigger value='characters'>Player Characters</TabsTrigger>
          <TabsTrigger value='statblocks'>NPCs</TabsTrigger>
          <TabsTrigger value='encounters'>Encounters</TabsTrigger>
          <TabsTrigger value='images'>Images</TabsTrigger>
        </TabsList>

        <TabsContent value='campaigns' className='flex-1 flex flex-col min-h-0 mt-0'>
          <ManageCampaignsPanel />
        </TabsContent>
        <TabsContent value='characters' className='flex-1 flex flex-col min-h-0 mt-0'>
          <ManageCharactersDialog />
        </TabsContent>
        <TabsContent value='statblocks' className='flex-1 flex flex-col min-h-0 mt-0'>
          <ManageStatBlocksDialog />
        </TabsContent>
        <TabsContent value='encounters' className='flex-1 flex flex-col min-h-0 mt-0'>
          <ManageEncountersDialog />
        </TabsContent>
        <TabsContent value='images' className='flex-1 flex flex-col min-h-0 mt-0'>
          <ManageImagesDialog />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PrepScreen;
