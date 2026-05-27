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

| Concern           | Choice                                             | Why                                          |
| ----------------- | -------------------------------------------------- | -------------------------------------------- |
| Build             | Vite                                               | CRA is unmaintained                          |
| Language          | TypeScript                                         | Type safety                                  |
| UI                | shadcn/ui + Tailwind                               | Own the components, no runtime overhead      |
| State             | Zustand + persist                                  | Replaces manual localStorage wiring          |
| DM↔Player sync    | BroadcastChannel (abstracted)                      | Zero setup, works offline                    |
| Cross-device sync | Not yet — abstraction layer makes it a future swap | Supabase / PartyKit / WebRTC are all options |

## Backlog

- Keep main menu open in "manage mode" — option to keep the drawer open while managing characters/images/encounters
- Stat block preview during edit — show the rendered StatBlockCard alongside the editor panel so the DM can see how the stat block will look while filling it in

## Stretch: cross-device sync

The sync abstraction layer (`src/lib/sync.ts`) is built as a seam — swapping in a network transport doesn't touch any component code. Candidates:

| Option                | Tradeoff                                                  |
| --------------------- | --------------------------------------------------------- |
| **Supabase Realtime** | Easiest, managed, requires internet                       |
| **PartyKit**          | Designed for ephemeral real-time state, requires internet |
| **WebRTC**            | Peer-to-peer, works on local network, more complex setup  |

## Why not a VTT?

This is for physical tabletop play. The table is the VTT. This tool exists to give the DM a second screen without the complexity of Roll20, Foundry, or Owlbear Rodeo — which are all built around digital maps and tokens.
