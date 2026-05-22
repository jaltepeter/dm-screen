# DM Screen

A lightweight DM screen for true tabletop play. Open the DM view on your laptop, the player view on an external display, and push images and combat info to your players — no server, no account, no internet required.

## What it does

**DM view** — your private screen:
- Track player characters (AC, Passive Perception, Passive Insight, Initiative bonus, sheet link)
- Run initiative: add monsters/NPCs, enter rolls, advance turns, toggle visible/alive
- Manage saved images in folders, push any image to the player screen

**Player view** — shown on your second monitor:
- Sees the current initiative order (with hidden enemies shown as `? ? ? ? ? ?`)
- Displays whatever image the DM sends

The two views sync via the browser's `BroadcastChannel` API — both windows need to be open in the same browser on the same machine.

## Running locally

```bash
npm install
npm start
```

Opens at `http://localhost:3000/dm-screen`. Open a second window/tab and navigate to `/dm-screen/players` for the player view, then drag it to your second monitor.

## Tech decisions

| Concern | Choice | Why |
|---|---|---|
| Build | Vite | CRA is unmaintained |
| Language | TypeScript | Type safety |
| UI | shadcn/ui + Tailwind | Own the components, no runtime overhead |
| State | Zustand + persist | Replaces manual localStorage wiring |
| DM↔Player sync | BroadcastChannel (abstracted) | Zero setup, works offline |
| Cross-device sync | Not yet — abstraction layer makes it a future swap | Supabase / PartyKit / WebRTC are all options |

## Roadmap

- [x] Character tracking (AC, PP, PI, initiative bonus, sheet link)
- [x] Initiative tracker with visible/alive toggles
- [x] Image folders — save URLs, push to player view
- [ ] Migrate from CRA → Vite + TypeScript
- [ ] HP tracking (current / max / temp)
- [ ] Monster/NPC HP in combat
- [ ] Conditions tracking
- [ ] Notes panel
- [ ] Export / import data
- [ ] Cross-device sync (DM laptop → player TV on separate device)

## Why not a VTT?

This is for physical tabletop play. The table is the VTT. This tool exists to give the DM a second screen without the complexity of Roll20, Foundry, or Owlbear Rodeo — which are all built around digital maps and tokens.
