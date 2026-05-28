# DM Screen

A lightweight DM screen for true tabletop play. Open the DM view on your laptop, share a link with your players, and push images and combat info to any screen at the table — phone, TV, or second monitor.

## What it does

**DM view** — your private screen:

- Track player characters (AC, Passive Perception, Passive Insight, initiative bonus, sheet link, background)
- Run initiative: add monsters/NPCs with HP, enter rolls, advance turns, apply conditions, toggle visible/alive
- Manage encounter templates — pre-build enemy rosters, load them at the table
- Manage saved images in folders, push any image to the player screen
- Freeform markdown notes panel

**Player view** — shown on your second monitor:

- Sees the current initiative order (with hidden enemies shown as `? ? ? ? ? ?`)
- Conditions and round count displayed per actor
- Displays whatever image the DM sends

The two views sync via **PartyKit** WebSockets — the DM and players can be on completely different devices and networks. Open the DM view on your laptop, share the player link with anyone at the table, and push images and combat state in real time.

## Running locally

```bash
npm install
npm start
```

Opens at `http://localhost:5173/`. The player view is at `/players/<slug>` where `<slug>` is your campaign's slug — set one up in Prep Mode first, then click Go Live.

## Docker

```bash
docker compose up
```

Serves the app at `http://localhost:8080/`.

## Tech decisions

| Concern        | Choice               | Why                                        |
| -------------- | -------------------- | ------------------------------------------ |
| Build          | Vite                 | CRA is unmaintained                        |
| Language       | TypeScript           | Type safety                                |
| UI             | shadcn/ui + Tailwind | Own the components, no runtime overhead    |
| State          | Zustand + persist    | Replaces manual localStorage wiring        |
| DM↔Player sync | PartyKit WebSockets  | Ephemeral rooms, free tier, 10-line server |

## Cross-device sync

The sync layer (`src/lib/sync.ts`) is a module-level singleton wrapping `partysocket`. All components call `sendMessage`/`onMessage` — nothing touches the WebSocket directly, so the transport is invisible to the rest of the app.

**How a session works:**

1. DM creates a campaign in Prep Mode and assigns it a slug (e.g. `my-campaign`)
2. DM clicks **Go Live** — connects to a PartyKit room keyed on the slug
3. Players navigate to `/players/my-campaign` on any device, enter their name, and connect
4. DM sees a live player count with join times; players see initiative and whatever image the DM sends

**DM presence:**

The server tracks `dmConnected` and `everHadDm` in room state. Players use this to distinguish three cases: unknown room ("No active session"), DM temporarily offline ("DM Disconnected" overlay), and intentional end ("The session has ended" full wipe). A `checkRoom` HTTP probe happens before the player even enters their name, so they don't get to the name screen if the room was never real.

**State on reconnect:**

When the DM reconnects, `onConnectionChange` fires and immediately pushes current local combat state and the last-sent image to the server. Players get a `dm_sync` and are up to date without any action from the DM. `lastSentImage` is persisted in `uiStore` so it survives a DM browser refresh.

**HP privacy:**

The PartyKit server strips `hp`/`maxHp` from every actor before broadcasting to players — HP is DM-only data and never reaches the player view.

## Deployment

The app is served as a Docker container behind an nginx reverse proxy. PartyKit handles real-time sync via WebSocket — the proxy must explicitly allow `wss://` connections or the browser will block them due to CSP.

In the nginx server block for `dm-screen.altepeter.com`:

```nginx
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'; connect-src 'self' https: wss://dm-screen.jaltepeter.partykit.dev" always;
```

Two GitHub Actions secrets are required for the deploy workflow:

- `VITE_PARTYKIT_HOST` — `dm-screen.jaltepeter.partykit.dev`
- `PARTYKIT_TOKEN` — from `~/.partykit/config.json` (`access_token` field) after running `npx partykit login`

## Backlog

- **Import confirmation** — Before `importData()` runs, warn the user that all current data will be overwritten. The right place is `ImportButton`'s `onChange` handler (`src/components/ui/import-button.tsx`). Use the existing `<DeleteConfirmDialog>` pattern or a simple `window.confirm` as a starting point.

## Why not a VTT?

This is for physical tabletop play. The table is the VTT. This tool exists to give the DM a second screen without the complexity of Roll20, Foundry, or Owlbear Rodeo — which are all built around digital maps and tokens.
