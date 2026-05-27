import PartySocket from 'partysocket';

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
  | { cmd: 'clear_image' }
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
    }
  | { cmd: 'players_update'; payload: { name: string; connectedAt: number }[] };

export interface DebugEvent {
  direction: 'sent' | 'received';
  cmd: string;
  timestamp: number;
  payload?: unknown;
}

const PARTYKIT_HOST = import.meta.env.VITE_PARTYKIT_HOST as string;

let socket: PartySocket | null = null;
const handlers: Array<(msg: SyncMessage) => void> = [];
const debugHandlers: Array<(event: DebugEvent) => void> = [];

function emitDebug(event: DebugEvent) {
  debugHandlers.forEach((h) => h(event));
}

export function onDebugEvent(handler: (event: DebugEvent) => void): () => void {
  debugHandlers.push(handler);
  return () => {
    const i = debugHandlers.indexOf(handler);
    if (i !== -1) debugHandlers.splice(i, 1);
  };
}

export function connect(slug: string, role: 'dm' | 'player', name?: string): void {
  socket?.close();
  socket = new PartySocket({
    host: PARTYKIT_HOST,
    room: slug,
    query: { role, ...(name ? { name } : {}) }
  });
  socket.addEventListener('message', (e: MessageEvent<string>) => {
    const msg = JSON.parse(e.data) as SyncMessage;
    emitDebug({
      direction: 'received',
      cmd: msg.cmd,
      timestamp: Date.now(),
      payload: 'payload' in msg ? msg.payload : undefined
    });
    handlers.forEach((h) => h(msg));
  });
}

export function disconnect(): void {
  socket?.close();
  socket = null;
}

export function sendMessage(msg: SyncMessage): void {
  emitDebug({
    direction: 'sent',
    cmd: msg.cmd,
    timestamp: Date.now(),
    payload: 'payload' in msg ? msg.payload : undefined
  });
  socket?.send(JSON.stringify(msg));
}

export function onMessage(handler: (msg: SyncMessage) => void): () => void {
  handlers.push(handler);
  return () => {
    const i = handlers.indexOf(handler);
    if (i !== -1) handlers.splice(i, 1);
  };
}
