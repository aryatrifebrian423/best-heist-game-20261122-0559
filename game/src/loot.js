// Meridian Casino — the loot: chip stacks, gold, cash, and the diamond.
//
// Loot is the score and the story at once. Chip stacks pay a little, gold
// pays more, cash pays more still, and the Meridian Diamond pays a quarter
// of a million — and taking it is what opens the getaway exit. Every piece
// is worth its dollars on the HUD the moment it is picked up.

import { LOOT_VALUES } from './config.js';

/** The dollar value of one loot kind. */
export function lootValue(kind) {
  return LOOT_VALUES[kind] ?? 0;
}

/** A short label for a loot kind, for the HUD and the pickup flash. */
export function lootLabel(kind) {
  if (kind === 'chips') return 'CHIP STACK';
  if (kind === 'gold') return 'GOLD STACK';
  if (kind === 'cash') return 'CASH BUNDLE';
  if (kind === 'diamond') return 'MERIDIAN DIAMOND';
  return 'LOOT';
}

/**
 * Apply a pickup the player just made: add the value, and when the piece
 * is the diamond, open the getaway exit. Called from the event drain in
 * state.js, so the rule lives in one place.
 */
export function applyPickup(world, event) {
  world.lootValue += lootValue(event.kind);
  world.lootTaken += 1;
  if (event.kind === 'diamond') {
    world.diamondTaken = true;
    if (world.wing.exit) world.wing.exit.active = true;
    world.events.push({ type: 'diamond', x: event.x, y: event.y });
  }
}

/** How much loot is still lying on this wing's floor. */
export function lootRemaining(wing) {
  let n = 0;
  let value = 0;
  for (const item of wing.loot) {
    if (item.taken) continue;
    n += 1;
    value += lootValue(item.kind);
  }
  return { count: n, value };
}
