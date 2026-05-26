import { useEffect, useState } from 'react';
import InitiativePlayerView from '../components/characters/initiative/initiativePlayerView';
import { Actor, onMessage } from '../lib/sync';

export default function PlayerView() {
  const [imageSource, setImageSource] = useState<{ url: string; title?: string } | null>(null);
  const [actors, setActors] = useState<Actor[]>([]);
  const [index, setIndex] = useState(0);

  const showInit = actors.length > 0;

  useEffect(() => {
    document.title = 'Player View';
  }, []);

  useEffect(() => {
    return onMessage((msg) => {
      switch (msg.cmd) {
        case 'image':
          setImageSource(msg.payload);
          break;
        case 'init_update':
          setActors(msg.payload.actors);
          setIndex(msg.payload.index);
          break;
      }
    });
  }, []);

  return (
    <div className='relative w-screen h-screen overflow-hidden bg-black'>
      {imageSource ? (
        <img
          src={imageSource.url}
          alt={imageSource.title}
          className='w-full h-full object-contain'
        />
      ) : (
        <div className='flex items-center justify-center w-full h-full text-white/20 text-sm select-none'>
          Waiting for image…
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
          <InitiativePlayerView actors={actors} turnNumber={index} />
        </div>
      </div>
    </div>
  );
}
