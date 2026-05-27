import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Check, ChevronDown, Copy, MonitorPlay, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useCampaignStore } from '../../store/campaignStore';
import { useDmSessionStore } from '../../store/dmSessionStore';
import { useCombatStore } from '../../store/combatStore';
import { useUiStore } from '../../store/uiStore';
import { connect, disconnect, onConnectionChange, onMessage, sendMessage } from '../../lib/sync';

export default function GoLiveButton() {
  const navigate = useNavigate();
  const campaigns = useCampaignStore((s) => s.campaigns);
  const activeCampaignId = useCampaignStore((s) => s.activeCampaignId);
  const setActiveCampaign = useCampaignStore((s) => s.setActiveCampaign);
  const actors = useCombatStore((s) => s.actors);
  const selectedIndex = useCombatStore((s) => s.selectedIndex);
  const round = useCombatStore((s) => s.round);
  const lastSentImage = useUiStore((s) => s.lastSentImage);
  const wantLive = useDmSessionStore((s) => s.wantLive);
  const setWantLive = useDmSessionStore((s) => s.setWantLive);
  const [isLive, setIsLive] = useState(false);
  const [players, setPlayers] = useState<{ name: string; connectedAt: number }[]>([]);

  const stateRef = useRef({ actors, selectedIndex, round, lastSentImage });
  useEffect(() => {
    stateRef.current = { actors, selectedIndex, round, lastSentImage };
  });

  const activeCampaign = campaigns.find((c) => c.id === activeCampaignId);

  useEffect(() => {
    return onConnectionChange((connected) => {
      setIsLive(connected);
      if (connected) {
        const { actors, selectedIndex, round, lastSentImage } = stateRef.current;
        sendMessage({ cmd: 'init_update', payload: { actors, index: selectedIndex, round } });
        if (lastSentImage) {
          sendMessage({ cmd: 'image', payload: lastSentImage });
        } else {
          sendMessage({ cmd: 'clear_image' });
        }
      } else {
        setPlayers([]);
      }
    });
  }, []);

  useEffect(() => {
    return onMessage((msg) => {
      if (msg.cmd === 'players_update') setPlayers(msg.payload);
    });
  }, []);

  useEffect(() => {
    if (wantLive && activeCampaign?.slug) connect(activeCampaign.slug, 'dm');
    else disconnect();
    return disconnect;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCampaignId, wantLive]);

  const switchTo = (id: string | null) => {
    if (id === activeCampaignId) return;
    setActiveCampaign(id);
    if (id !== null) {
      const name = campaigns.find((c) => c.id === id)?.name;
      toast(`Switched to campaign: ${name}`);
    }
  };

  const handleGoLive = () => {
    if (wantLive) {
      // wantLive already true (e.g. network drop) — force reconnect directly
      if (activeCampaign?.slug) connect(activeCampaign.slug, 'dm');
    } else {
      setWantLive(true); // effect handles connect
    }
  };

  const handleEndSession = () => {
    sendMessage({ cmd: 'session_ended' });
    setWantLive(false);
    disconnect();
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/players/${activeCampaign?.slug ?? ''}`;
    navigator.clipboard.writeText(link);
    toast('Player link copied');
  };

  const handleOpenPlayerView = () => {
    window.open(`/players/${activeCampaign?.slug}`, '_blank');
  };

  if (isLive) {
    const playerLabel = players.length === 1 ? '1 player' : `${players.length} players`;

    return (
      <div className='flex items-center gap-2'>
        {activeCampaign && <span className='text-sm max-w-36 truncate'>{activeCampaign.name}</span>}
        <DropdownMenu>
          <DropdownMenuTrigger className='inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md border border-input bg-background text-sm hover:bg-muted transition-colors'>
            <span className='h-2 w-2 rounded-full bg-green-500 shrink-0' />
            {playerLabel}
            <ChevronDown className='h-3.5 w-3.5 text-muted-foreground' />
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-56'>
            {players.length === 0 ? (
              <div className='px-2 py-1.5 text-sm text-muted-foreground'>No players connected</div>
            ) : (
              players.map((p) => (
                <div key={p.connectedAt} className='px-2 py-1.5 text-sm flex items-baseline gap-2'>
                  <span>{p.name}</span>
                  <span className='text-xs text-muted-foreground ml-auto'>
                    {new Date(p.connectedAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              ))
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleCopyLink}>
              <Copy className='h-3.5 w-3.5 mr-2' />
              Copy player link
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={handleOpenPlayerView}>
              <MonitorPlay className='h-3.5 w-3.5 mr-2' />
              Open player view
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={handleEndSession}
              className='text-destructive focus:text-destructive'>
              End Session
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div className='flex items-center gap-2'>
      <DropdownMenu>
        <DropdownMenuTrigger className='inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md border border-input bg-background text-sm hover:bg-muted transition-colors'>
          {activeCampaign ? (
            <span className='max-w-36 truncate'>{activeCampaign.name}</span>
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
      <Button variant='outline' size='sm' disabled={!activeCampaign} onClick={handleGoLive}>
        Go Live
      </Button>
    </div>
  );
}
