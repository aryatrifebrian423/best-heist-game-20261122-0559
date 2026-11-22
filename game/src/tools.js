// Meridian Casino — the five tools and what each one costs.
//
// Every tool is a choice with a price: the thief carries only a few charges
// of each, and a charge spent in the wrong room is gone for the job. Smoke
// blinds cones, a decoy chip pulls a guard off route, a lockpick opens the
// vault door or cuts one laser, an EMP kills every camera, and a dealer
// disguise lets the thief walk the floor as staff. Tools are fired with
// keys 1–5, the decoy aimed with the mouse.

import { TOOLS } from './config.js';
import { clamp } from './geometry.js';
import { mousePosition } from './input.js';
import { ROOM } from './config.js';

/** A fresh tool belt: charges per tool id, from the config. */
export function createToolBelt() {
  const belt = {};
  for (const tool of TOOLS) belt[tool.id] = tool.charges;
  return belt;
}

/** The definition of a tool by its id. */
export function toolDef(id) {
  return TOOLS.find((t) => t.id === id);
}

/**
 * Fire a tool. A charge is spent only when the tool does something; a
 * lockpick with nothing to pick, or a decoy with no guard to fool, costs
 * nothing. Every effect lands in the world and an event in world.events.
 */
export function useTool(id, world) {
  const def = toolDef(id);
  if (!def) return;
  const player = world.player;
  const now = world.time;

  if (id === 'smoke') {
    if (world.tools.smoke <= 0) return;
    world.tools.smoke -= 1;
    world.smokes.push({ x: player.x, y: player.y, r: 95, until: now + def.seconds });
    world.events.push({ type: 'tool', tool: 'smoke', x: player.x, y: player.y });
    return;
  }

  if (id === 'decoy') {
    if (world.tools.decoy <= 0) return;
    const mouse = mousePosition();
    const x = clamp(mouse.x, ROOM.x + 20, ROOM.x + ROOM.w - 20);
    const y = clamp(mouse.y, ROOM.y + 20, ROOM.y + ROOM.h - 20);
    world.tools.decoy -= 1;
    world.decoys.push({ x, y, until: now + def.seconds });
    let nearest = null;
    let best = Infinity;
    for (const guard of world.guards) {
      const d = Math.hypot(guard.x - x, guard.y - y);
      if (d < best) {
        best = d;
        nearest = guard;
      }
    }
    if (nearest) nearest.lure = { x, y, until: now + def.seconds };
    world.events.push({ type: 'tool', tool: 'decoy', x, y });
    return;
  }

  if (id === 'lockpick') {
    if (world.tools.lockpick <= 0) return;
    // First try: a locked door beside the thief.
    for (const door of world.wing.doors) {
      if (!door.locked) continue;
      const cx = door.x + door.w / 2;
      const cy = door.y + door.h / 2;
      if (Math.hypot(player.x - cx, player.y - cy) < 130) {
        door.locked = false;
        door.label = 'THE VAULT — OPEN';
        world.tools.lockpick -= 1;
        world.events.push({ type: 'tool', tool: 'lockpick-door', x: cx, y: cy });
        return;
      }
    }
    // Then: the nearest live laser within reach.
    let nearest = null;
    let best = Infinity;
    for (const laser of world.wing.lasers) {
      if (!laser.active) continue;
      const mx = (laser.x1 + laser.x2) / 2;
      const my = (laser.y1 + laser.y2) / 2;
      const d = Math.hypot(player.x - mx, player.y - my);
      if (d < best) {
        best = d;
        nearest = laser;
      }
    }
    if (nearest && best < 170) {
      nearest.active = false;
      world.tools.lockpick -= 1;
      world.events.push({ type: 'tool', tool: 'lockpick-laser', x: (nearest.x1 + nearest.x2) / 2, y: (nearest.y1 + nearest.y2) / 2 });
    }
    return;
  }

  if (id === 'emp') {
    if (world.tools.emp <= 0) return;
    world.tools.emp -= 1;
    for (const camera of world.cameras) camera.disabledUntil = now + def.seconds;
    for (const laser of world.wing.lasers) laser.empUntil = now + def.seconds;
    world.events.push({ type: 'tool', tool: 'emp', x: player.x, y: player.y });
    return;
  }

  if (id === 'disguise') {
    if (world.tools.disguise <= 0) return;
    world.tools.disguise -= 1;
    player.disguiseUntil = now + def.seconds;
    world.events.push({ type: 'tool', tool: 'disguise', x: player.x, y: player.y });
  }
}
