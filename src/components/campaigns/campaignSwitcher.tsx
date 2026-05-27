import { Check, ChevronDown, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useCampaignStore } from '../../store/campaignStore';

interface CampaignSwitcherProps {
  onManage: () => void;
}

export default function CampaignSwitcher({ onManage }: CampaignSwitcherProps) {
  const campaigns = useCampaignStore((s) => s.campaigns);
  const activeCampaignId = useCampaignStore((s) => s.activeCampaignId);
  const setActiveCampaign = useCampaignStore((s) => s.setActiveCampaign);

  const active = campaigns.find((c) => c.id === activeCampaignId);

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
      <DropdownMenuContent align='start'>
        <DropdownMenuItem onSelect={() => setActiveCampaign(null)}>
          <Check
            className={`h-3.5 w-3.5 mr-2 ${activeCampaignId === null ? 'opacity-100' : 'opacity-0'}`}
          />
          No Campaign
        </DropdownMenuItem>
        {campaigns.length > 0 && <DropdownMenuSeparator />}
        {campaigns.map((c) => (
          <DropdownMenuItem key={c.id} onSelect={() => setActiveCampaign(c.id)}>
            <Check
              className={`h-3.5 w-3.5 mr-2 ${activeCampaignId === c.id ? 'opacity-100' : 'opacity-0'}`}
            />
            <span className='flex-1'>{c.name}</span>
            <span className='text-xs text-muted-foreground ml-3'>{c.slug}</span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onManage}>
          <Settings className='h-3.5 w-3.5 mr-2' />
          Manage Campaigns
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
