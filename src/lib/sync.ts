export interface Actor {
  id: number;
  name: string;
  init: number;
  visible: boolean;
  active: boolean;
}

export type SyncMessage =
  | { cmd: 'image'; payload: { url: string; title: string } }
  | { cmd: 'init_update'; payload: { actors: Actor[]; index: number } };

const channel = new BroadcastChannel('dm-screen');

export function sendMessage(msg: SyncMessage): void {
  channel.postMessage(msg);
}

/** Returns an unsubscribe function. */
export function onMessage(handler: (msg: SyncMessage) => void): () => void {
  const listener = (e: MessageEvent<SyncMessage>) => handler(e.data);
  channel.addEventListener('message', listener);
  return () => channel.removeEventListener('message', listener);
}
