# Meridian Casino: 12 guards, 5 tools, 3 wings — a top-down casino heist

[![make.fun](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/aryatrifebrian423/best-heist-game-20261122-0559/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/aryatrifebrian423/best-heist-game-20261122-0559/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)

A complete, original top-down heist game. You are **Raka "the Ghost"**, a thief
slipping into the Meridian Casino at night to steal the Meridian Diamond.
Cross three wings — the Slots Floor, the High-Roller Salon and the Vault —
past **12 named guards** with sweeping vision cones, rotating security
cameras and a laser grid, grab the chip stacks and the diamond, and reach the
getaway exit before the alarm brings the whole floor down on you.

## How to play

- **Move:** WASD or arrow keys. **Sneak:** hold Shift (slower, quieter).
- **Pick up loot / use doors:** E (walk into a door to change wings).
- **Tools:** `1` smoke bomb, `2` decoy chip, `3` lockpick, `4` EMP pulse,
  `5` dealer disguise. Every tool costs charges — spend them where they count.
- **Goal:** take the Meridian Diamond in the Vault, then reach the getaway
  exit. Watch the alarm meter: at 100% the guards hunt you, and one touch
  means busted.
- **Restart a wing:** R. **Mute:** M.

## The three wings

| Wing | Cover | Guards | Cameras |
| ---- | ----- | ------ | ------- |
| Slots Floor | rows of slot machines | Dara, Bimo, Laras, Sari | 2 |
| High-Roller Salon | poker & blackjack tables | Agus, Maya, Rudi, Dewi | 2 |
| Vault | pillars, laser grid | Jono, Putri, Eko, Ratna | 1 |

## Tools

- **Smoke bomb** — a thick cloud that blinds every cone inside it for 6 s.
- **Decoy chip** — a clattering chip that pulls the nearest guard to it.
- **Lockpick** — opens the vault door and cuts one laser line.
- **EMP pulse** — kills every camera for 10 s.
- **Dealer disguise** — walk the floor as staff for 8 s; guards only notice
  you up close.

## Play it

Serve `game/` with any static server and open `game/index.html` in desktop
Chrome — no network, no build step:

```sh
node serve.ts
# game/ is on http://localhost:8080
```

Screenshot scenes (real renders of the game, driven by a query string):

```sh
# ?scene=cover   — the Vault climax: diamond, converging guards, alarm 62%
# ?scene=slots   — Slots Floor mid-action
# ?scene=salon  — High-Roller Salon mid-action
# ?scene=caught — alarm 91%, guards closing in
```

## Layout

- `main.ts` — hands the entry in: copies `game/` and `screenshots/` to
  `/output` (or `$MAKEFUN_OUTPUT_DIR`) and writes `dossier.json`.
- `game/index.html` — the page; `game/src/` holds one file per job
  (config, rng, geometry, levels, guards, cameras, player, tools, loot,
  alarm, particles, state, scenes, render, hud, audio, main).
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged.
- `screenshots/` — four real renders of the game, the first the cover.

Built for the make.fun bounty
[best-heist-game-20261122-0559](https://make.fun/bounty/best-heist-game-20261122-0559)
— $50, top 10 share. Free to enter, pure Node stdlib, no dependencies.
