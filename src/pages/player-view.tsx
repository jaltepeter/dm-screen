import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useScaleToFit } from '../lib/useScaleToFit';
import { Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import InitiativePlayerView from '../components/characters/initiative/initiativePlayerView';
import StageLayout from '../components/player/stageLayout';
import {
  Actor,
  StageImage,
  checkRoom,
  connect,
  disconnect,
  onMessage,
  sendMessage
} from '../lib/sync';
import DebugPanel from '@/components/ui/debug-panel';
import { usePlayerStore } from '../store/playerStore';

function BeholderScreen({
  message,
  pulse,
  className = ''
}: {
  message?: string;
  pulse?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center justify-center gap-6 ${className}`}>
      <img src='/beholder.svg' alt='' className='w-[88vmin] h-[88vmin] opacity-10' />
      {message && (
        <span className={`text-6xl text-white/40 ${pulse ? 'animate-pulse' : ''}`}>{message}</span>
      )}
    </div>
  );
}

export default function PlayerView() {
  const { slug } = useParams<{ slug: string }>();
  const { playerName: storedName, setPlayerName: persistName } = usePlayerStore();
  const [nameInput, setNameInput] = useState(storedName);
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [roomStatus, setRoomStatus] = useState<'checking' | 'active' | 'inactive'>(() =>
    slug ? 'checking' : 'inactive'
  );
  const [stage, setStage] = useState<StageImage[]>([]);
  const [actors, setActors] = useState<Actor[]>([]);
  const [index, setIndex] = useState(0);
  const [round, setRound] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [dmStatus, setDmStatus] = useState<'waiting' | 'online' | 'offline' | 'ended'>('waiting');

  const showInit = actors.length > 0;
  const showImages = stage.length > 0;
  const centeredMode = showInit && !showImages;
  const showRail = showInit && showImages;

  const centeredContentRef = useRef<HTMLDivElement>(null);
  const railContentRef = useRef<HTMLDivElement>(null);

  // Scale initiative down to fit viewport when there are many actors.
  // transform: scale() doesn't affect layout metrics, so offsetHeight always
  // returns the natural height regardless of the current scale — no feedback loop.
  const centeredScale = useScaleToFit(centeredContentRef, stage);
  const railScale = useScaleToFit(railContentRef, stage);

  useEffect(() => {
    document.title = 'Player View';
  }, []);

  useEffect(() => {
    if (!slug) return;
    checkRoom(slug)
      .then((data) => setRoomStatus(data.dmConnected || data.everHadDm ? 'active' : 'inactive'))
      .catch(() => setRoomStatus('active'));
  }, [slug]);

  useEffect(() => {
    if (slug && playerName && roomStatus === 'active') connect(slug, 'player', playerName);
    return disconnect;
  }, [slug, playerName, roomStatus]);

  useEffect(() => {
    const unsub = onMessage((msg) => {
      switch (msg.cmd) {
        case 'stage_update':
          setStage(msg.payload.images);
          break;
        case 'init_update':
          setActors(msg.payload.actors);
          setIndex(msg.payload.index);
          setRound(msg.payload.round);
          break;
        case 'dm_sync':
          setStage(msg.payload.images);
          setActors(msg.payload.actors);
          setIndex(msg.payload.index);
          setRound(msg.payload.round);
          break;
        case 'dm_online':
          setDmStatus('online');
          break;
        case 'dm_offline':
          setDmStatus((prev) => (prev === 'ended' ? 'ended' : 'offline'));
          break;
        case 'session_ended':
          setStage([]);
          setActors([]);
          setIndex(0);
          setRound(1);
          setDmStatus('ended');
          break;
      }
    });
    sendMessage({ cmd: 'player_ready' });
    return unsub;
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  };

  const handleJoin = () => {
    const name = nameInput.trim() || 'Player';
    persistName(name);
    setPlayerName(name);
  };

  if (roomStatus === 'checking') {
    return <BeholderScreen message='Connecting…' pulse className='w-screen h-screen bg-black' />;
  }

  if (roomStatus === 'inactive') {
    return (
      <BeholderScreen message='No active session here.' className='w-screen h-screen bg-black' />
    );
  }

  if (!playerName) {
    return (
      <div className='w-screen h-screen bg-black flex flex-col items-center justify-center gap-6'>
        <img src='/beholder.svg' alt='' className='absolute w-[80vmin] h-[80vmin] opacity-10' />
        <h1 className='relative text-2xl font-semibold text-white'>What&apos;s your name?</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleJoin();
          }}
          className='relative flex gap-2'>
          <Input
            autoFocus
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder='Your name'
            className='w-48 bg-white/10 border-white/20 text-white placeholder:text-white/30'
          />
          <Button type='submit' disabled={!nameInput.trim()}>
            Join
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className='group relative w-screen h-screen overflow-hidden bg-black flex'>
      {/* Main stage area */}
      <div className='relative flex-1 min-w-0 h-full'>
        {showImages ? (
          <StageLayout images={stage} />
        ) : !centeredMode ? (
          <BeholderScreen
            message={dmStatus === 'waiting' ? 'Waiting for DM…' : undefined}
            pulse={dmStatus === 'waiting'}
            className='w-full h-full select-none'
          />
        ) : null}

        {/* Centered initiative when nothing is on the stage */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
            centeredMode ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}>
          <div
            ref={centeredContentRef}
            style={{ transform: `scale(${centeredScale})`, transformOrigin: 'center center' }}
            className='min-w-80 px-8'>
            <InitiativePlayerView actors={actors} turnNumber={index} round={round} large />
          </div>
        </div>
      </div>

      {/* Initiative rail — dedicated column whenever images share the screen */}
      {showRail && (
        <aside className='shrink-0 w-[22vw] max-w-sm min-w-48 h-full bg-black/80 border-l border-white/10 flex items-start justify-center p-4 overflow-hidden'>
          <div
            ref={railContentRef}
            style={{ transform: `scale(${railScale})`, transformOrigin: 'top center' }}
            className='w-full'>
            <p className='text-xs font-semibold text-white/50 uppercase tracking-wider mb-2'>
              Initiative
            </p>
            <InitiativePlayerView actors={actors} turnNumber={index} round={round} />
          </div>
        </aside>
      )}

      {/* DM offline overlay */}
      {dmStatus === 'offline' && (
        <BeholderScreen
          message='DM Disconnected'
          pulse
          className='absolute inset-0 bg-black z-10'
        />
      )}

      {/* Session ended — full black wipe */}
      {dmStatus === 'ended' && (
        <BeholderScreen
          message='The session has ended.'
          className='absolute inset-0 bg-black z-20'
        />
      )}

      {/* Fullscreen toggle */}
      <button
        onClick={toggleFullscreen}
        className='absolute bottom-4 right-4 p-2 rounded-md bg-black/40 text-white/40 opacity-0 group-hover:opacity-100 hover:bg-black/70 hover:text-white/90 transition-all duration-200'>
        {isFullscreen ? <Minimize2 className='h-4 w-4' /> : <Maximize2 className='h-4 w-4' />}
      </button>

      <DebugPanel />
    </div>
  );
}
