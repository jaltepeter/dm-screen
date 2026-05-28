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
  | { cmd: 'players_update'; payload: { name: string; connectedAt: number }[] }
  | { cmd: 'dm_online' }
  | { cmd: 'dm_offline' }
  | { cmd: 'session_ended' };

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
const connectionHandlers: Array<(connected: boolean) => void> = [];
const errorHandlers: Array<() => void> = [];

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

export function onConnectionChange(handler: (connected: boolean) => void): () => void {
  connectionHandlers.push(handler);
  return () => {
    const i = connectionHandlers.indexOf(handler);
    if (i !== -1) connectionHandlers.splice(i, 1);
  };
}

export function onConnectionError(handler: () => void): () => void {
  errorHandlers.push(handler);
  return () => {
    const i = errorHandlers.indexOf(handler);
    if (i !== -1) errorHandlers.splice(i, 1);
  };
}

export function connect(slug: string, role: 'dm' | 'player', name?: string): void {
  socket?.close();
  const ws = new PartySocket({
    host: PARTYKIT_HOST,
    room: slug,
    query: { role, ...(name ? { name } : {}) }
  });
  socket = ws;
  ws.addEventListener('open', () => {
    if (socket !== ws) return;
    connectionHandlers.forEach((h) => h(true));
  });
  ws.addEventListener('close', () => {
    if (socket !== ws) return;
    connectionHandlers.forEach((h) => h(false));
  });
  ws.addEventListener('error', () => {
    if (socket !== ws) return;
    errorHandlers.forEach((h) => h());
  });
  ws.addEventListener('message', (e: MessageEvent<string>) => {
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
  connectionHandlers.forEach((h) => h(false));
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

export async function checkRoom(
  slug: string
): Promise<{ dmConnected: boolean; everHadDm: boolean }> {
  const protocol = PARTYKIT_HOST.startsWith('localhost') ? 'http' : 'https';
  const res = await fetch(`${protocol}://${PARTYKIT_HOST}/parties/main/${slug}`);
  return res.json() as Promise<{ dmConnected: boolean; everHadDm: boolean }>;
}

export function onMessage(handler: (msg: SyncMessage) => void): () => void {
  handlers.push(handler);
  return () => {
    const i = handlers.indexOf(handler);
    if (i !== -1) handlers.splice(i, 1);
  };
}
