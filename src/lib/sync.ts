export interface Actor {
  id: string;
  kind: 'player' | 'npc';
  name: string;
  init: number;
  visible: boolean;
  active: boolean;
  conditions: string[];
  hp?: number;
  maxHp?: number;
  statBlockId?: string;
}

export type SyncMessage =
  | { cmd: 'image'; payload: { url: string; title?: string } }
  | { cmd: 'init_update'; payload: { actors: Actor[]; index: number; round: number } }
  | { cmd: 'player_ready' }
  | {
      cmd: 'dm_sync';
      payload: {
        actors: Actor[];
        index: number;
        round: number;
        image: { url: string; title?: string } | null;
      };
    };

const channel = new BroadcastChannel('dm-screen');

export function sendMessage(msg: SyncMessage): void {
  if (msg.cmd === 'init_update' || msg.cmd === 'dm_sync') {
    // hp and maxHp are DM-only; strip them before broadcasting to the player view
    const actors = msg.payload.actors.map(({ hp: _hp, maxHp: _maxHp, ...rest }) => rest);
    channel.postMessage({ ...msg, payload: { ...msg.payload, actors } });
  } else {
    channel.postMessage(msg);
  }
}

/** Returns an unsubscribe function. */
export function onMessage(handler: (msg: SyncMessage) => void): () => void {
  const listener = (e: MessageEvent<SyncMessage>) => handler(e.data);
  channel.addEventListener('message', listener);
  return () => channel.removeEventListener('message', listener);
}
