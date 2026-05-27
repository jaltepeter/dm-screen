import type * as Party from 'partykit/server';

interface Actor {
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

interface RoomState {
  actors: Omit<Actor, 'hp' | 'maxHp'>[];
  index: number;
  round: number;
  image: { url: string; title?: string } | null;
  players: { id: string; name: string; connectedAt: number }[];
  dmConnected: boolean;
  everHadDm: boolean;
}

function stripHp(actors: Actor[]): Omit<Actor, 'hp' | 'maxHp'>[] {
  return actors.map(({ hp: _hp, maxHp: _maxHp, ...rest }) => rest);
}

export default class DmScreenServer implements Party.Server {
  state: RoomState = {
    actors: [],
    index: 0,
    round: 1,
    image: null,
    players: [],
    dmConnected: false,
    everHadDm: false
  };

  constructor(readonly room: Party.Room) {}

  async onConnect(ws: Party.Connection, ctx: Party.ConnectionContext) {
    const url = new URL(ctx.request.url);
    const role = url.searchParams.get('role') ?? 'player';
    const name = url.searchParams.get('name') ?? 'Player';

    ws.serializeAttachment({ role, name });

    if (role === 'dm') {
      this.state.dmConnected = true;
      this.state.everHadDm = true;
      this.broadcastToPlayers({ cmd: 'dm_online' });
      ws.send(
        JSON.stringify({
          cmd: 'players_update',
          payload: this.state.players.map(({ name, connectedAt }) => ({ name, connectedAt }))
        })
      );
    }

    if (role === 'player') {
      this.state.players = [...this.state.players, { id: ws.id, name, connectedAt: Date.now() }];

      ws.send(
        JSON.stringify({
          cmd: 'dm_sync',
          payload: {
            actors: this.state.actors,
            index: this.state.index,
            round: this.state.round,
            image: this.state.image
          }
        })
      );

      ws.send(JSON.stringify({ cmd: this.state.dmConnected ? 'dm_online' : 'dm_offline' }));

      this.broadcastToDm({
        cmd: 'players_update',
        payload: this.state.players.map(({ name, connectedAt }) => ({ name, connectedAt }))
      });
    }
  }

  async onMessage(message: string, ws: Party.Connection) {
    const msg = JSON.parse(message);
    const { role } = ws.deserializeAttachment() as { role: string; name: string };

    if (role === 'dm') {
      switch (msg.cmd) {
        case 'init_update': {
          const actors = stripHp(msg.payload.actors);
          this.state.actors = actors;
          this.state.index = msg.payload.index;
          this.state.round = msg.payload.round;
          this.broadcastToPlayers({ ...msg, payload: { ...msg.payload, actors } });
          break;
        }
        case 'image':
          this.state.image = msg.payload;
          this.broadcastToPlayers(msg);
          break;
        case 'clear_image':
          this.state.image = null;
          this.broadcastToPlayers(msg);
          break;
        case 'session_ended':
          this.state.actors = [];
          this.state.index = 0;
          this.state.round = 1;
          this.state.image = null;
          this.broadcastToPlayers(msg);
          break;
      }
    }

    if (role === 'player' && msg.cmd === 'player_ready') {
      ws.send(
        JSON.stringify({
          cmd: 'dm_sync',
          payload: {
            actors: this.state.actors,
            index: this.state.index,
            round: this.state.round,
            image: this.state.image
          }
        })
      );
    }
  }

  async onRequest(_req: Party.Request): Promise<Response> {
    return new Response(
      JSON.stringify({ dmConnected: this.state.dmConnected, everHadDm: this.state.everHadDm }),
      {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      }
    );
  }

  async onClose(ws: Party.Connection) {
    const { role } = (ws.deserializeAttachment() ?? { role: 'player' }) as {
      role: string;
      name: string;
    };

    if (role === 'player') {
      this.state.players = this.state.players.filter((p) => p.id !== ws.id);
      this.broadcastToDm({
        cmd: 'players_update',
        payload: this.state.players.map(({ name, connectedAt }) => ({ name, connectedAt }))
      });
    }

    if (role === 'dm') {
      this.state.dmConnected = false;
      this.broadcastToPlayers({ cmd: 'dm_offline' });
    }
  }

  private broadcastToPlayers(msg: unknown) {
    for (const conn of this.room.getConnections()) {
      const attachment = conn.deserializeAttachment() as { role: string } | null;
      if (attachment?.role === 'player') {
        conn.send(JSON.stringify(msg));
      }
    }
  }

  private broadcastToDm(msg: unknown) {
    for (const conn of this.room.getConnections()) {
      const attachment = conn.deserializeAttachment() as { role: string } | null;
      if (attachment?.role === 'dm') {
        conn.send(JSON.stringify(msg));
      }
    }
  }
}
