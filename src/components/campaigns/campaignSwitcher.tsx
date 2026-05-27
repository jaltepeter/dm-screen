import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Check, ChevronDown, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useCampaignStore } from '../../store/campaignStore';

export default function CampaignSwitcher() {
  const navigate = useNavigate();
  const campaigns = useCampaignStore((s) => s.campaigns);
  const activeCampaignId = useCampaignStore((s) => s.activeCampaignId);
  const setActiveCampaign = useCampaignStore((s) => s.setActiveCampaign);

  const active = campaigns.find((c) => c.id === activeCampaignId);

  const switchTo = (id: string | null) => {
    if (id === activeCampaignId) return;
    setActiveCampaign(id);
    if (id === null) {
      toast('No active campaign');
    } else {
      const name = campaigns.find((c) => c.id === id)?.name;
      toast(`Switched to campaign: ${name}`);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className='inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md border border-input bg-background text-sm hover:bg-muted transition-colors'>
        {active ? (
          <span className='max-w-36 truncate'>{active.name}</span>
        ) : (
          <span className='text-muted-foreground'>No Campaign</span>
        )}
        <ChevronDown className='h-3.5 w-3.5 text-muted-foreground shrink-0' />
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='w-64'>
        <DropdownMenuItem onSelect={() => switchTo(null)}>
          <Check
            className={`h-3.5 w-3.5 mr-2 shrink-0 ${activeCampaignId === null ? 'opacity-100' : 'opacity-0'}`}
          />
          No Campaign
        </DropdownMenuItem>
        {campaigns.length > 0 && <DropdownMenuSeparator />}
        {campaigns.map((c) => (
          <DropdownMenuItem key={c.id} onSelect={() => switchTo(c.id)}>
            <Check
              className={`h-3.5 w-3.5 mr-2 shrink-0 ${activeCampaignId === c.id ? 'opacity-100' : 'opacity-0'}`}
            />
            <div className='flex flex-col min-w-0'>
              <span className='truncate'>{c.name}</span>
              <span className='text-xs text-muted-foreground font-mono truncate'>{c.slug}</span>
            </div>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => navigate('/prep?tab=campaigns')}>
          <Settings className='h-3.5 w-3.5 mr-2' />
          Manage Campaigns
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
