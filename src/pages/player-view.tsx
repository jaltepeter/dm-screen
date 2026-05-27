import { useEffect, useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import InitiativePlayerView from '../components/characters/initiative/initiativePlayerView';
import { Actor, onMessage, sendMessage } from '../lib/sync';

export default function PlayerView() {
  const [imageSource, setImageSource] = useState<{ url: string; title?: string } | null>(null);
  const [actors, setActors] = useState<Actor[]>([]);
  const [index, setIndex] = useState(0);
  const [round, setRound] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [waiting, setWaiting] = useState(true);

  const showInit = actors.length > 0;

  useEffect(() => {
    document.title = 'Player View';
  }, []);

  useEffect(() => {
    const poll = { id: undefined as ReturnType<typeof setInterval> | undefined };

    const unsub = onMessage((msg) => {
      switch (msg.cmd) {
        case 'image':
          setImageSource(msg.payload);
          break;
        case 'init_update':
          setActors(msg.payload.actors);
          setIndex(msg.payload.index);
          setRound(msg.payload.round);
          break;
        case 'dm_sync':
          setImageSource(msg.payload.image);
          setActors(msg.payload.actors);
          setIndex(msg.payload.index);
          setRound(msg.payload.round);
          clearInterval(poll.id);
          setWaiting(false);
          break;
      }
    });

    sendMessage({ cmd: 'player_ready' });
    poll.id = setInterval(() => sendMessage({ cmd: 'player_ready' }), 500);

    return () => {
      unsub();
      clearInterval(poll.id);
    };
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

  return (
    <div className='group relative w-screen h-screen overflow-hidden bg-black'>
      {imageSource ? (
        <img
          src={imageSource.url}
          alt={imageSource.title}
          className='w-full h-full object-contain'
        />
      ) : (
        <div className='flex items-center justify-center w-full h-full select-none'>
          {waiting ? (
            <span className='animate-pulse animation-duration-[5s] text-3xl text-white/40'>
              Waiting for DM…
            </span>
          ) : (
            <img src='/beholder.svg' alt='' className='w-[80vmin] h-[80vmin] opacity-10' />
          )}
        </div>
      )}

      {/* Corner initiative overlay */}
      <div
        className={`absolute top-4 right-4 transition-all duration-300 ${
          showInit ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}>
        <div className='bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2 min-w-32'>
          <p className='text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5'>
            Initiative
          </p>
          <InitiativePlayerView actors={actors} turnNumber={index} round={round} />
        </div>
      </div>

      {/* Fullscreen toggle */}
      <button
        onClick={toggleFullscreen}
        className='absolute bottom-4 right-4 p-2 rounded-md bg-black/40 text-white/40 opacity-0 group-hover:opacity-100 hover:bg-black/70 hover:text-white/90 transition-all duration-200'>
        {isFullscreen ? <Minimize2 className='h-4 w-4' /> : <Maximize2 className='h-4 w-4' />}
      </button>
    </div>
  );
}
