# DM Screen

A lightweight DM screen for true tabletop play. Open the DM view on your laptop, the player view on an external display, and push images and combat info to your players — no server, no account, no internet required.

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

The two views sync via the browser's `BroadcastChannel` API — both windows need to be open in the same browser on the same machine.

## Running locally

```bash
npm install
npm start
```

Opens at `http://localhost:5173/`. Open a second window/tab and navigate to `/players` for the player view, then drag it to your second monitor.

## Docker

```bash
docker compose up
```

Serves the app at `http://localhost:8080/`.

## Tech decisions

| Concern           | Choice                        | Why                                     |
| ----------------- | ----------------------------- | --------------------------------------- |
| Build             | Vite                          | CRA is unmaintained                     |
| Language          | TypeScript                    | Type safety                             |
| UI                | shadcn/ui + Tailwind          | Own the components, no runtime overhead |
| State             | Zustand + persist             | Replaces manual localStorage wiring     |
| DM↔Player sync    | BroadcastChannel (abstracted) | Zero setup, works offline               |
| Cross-device sync | Planned: PartyKit (free tier) | See below                               |

## Cross-device sync (planned)

The sync abstraction layer (`src/lib/sync.ts`) is built as a seam — swapping in a network transport won't touch any component code. The plan is **PartyKit** on its free tier.

**Why PartyKit:**

- Designed for exactly this: ephemeral real-time state broadcast to a room
- Free tier supports unlimited concurrent rooms within a project — a DM session is one room
- The 24-hour storage reset is irrelevant; state lives in the browser, not the server
- 10-line server file, minimal setup

**UX sketch:**

- DM opens the app → a short session code is generated and shown in the header
- Player opens `/players` on any device (phone, TV browser, laptop) → enters the code → connects and syncs immediately via the existing `player_ready` handshake

This would make it practical to use a projector or TV in a different room, or let players follow along on their phones.

## Backlog

- **Auto-fill new manual NPCs** — when adding an NPC by hand, pre-populate sensible defaults (AC, HP, etc.) and generate a random adjective-noun name (e.g. "Grizzled Shepherd", "Hollow Knight")

## Why not a VTT?

This is for physical tabletop play. The table is the VTT. This tool exists to give the DM a second screen without the complexity of Roll20, Foundry, or Owlbear Rodeo — which are all built around digital maps and tokens.
