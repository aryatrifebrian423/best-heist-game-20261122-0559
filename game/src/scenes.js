// Meridian Casino — the staged moments: title, and the four screenshots.
//
// A screenshot is a real render of the real engine, frozen mid-action: the
// scene poses the thief, the guards, the meters and the loot, then the
// render loop draws exactly that state. Nothing here is composited or
// borrowed — the same code that plays the game draws the picture. The
// cover is the Vault climax: the diamond glowing, the lasers live, three
// guards closing in and the alarm at 62%.

import { enterWing } from './state.js';

/** Pose one guard for a scene: position, facing, state and suspicion. */
function poseGuard(world, name, x, y, angleDegrees, state, suspicion) {
  const guard = world.guards.find((g) => g.name === name);
  if (!guard) return;
  guard.x = x;
  guard.y = y;
  guard.angle = (angleDegrees * Math.PI) / 180;
  guard.state = state;
  guard.suspicion = suspicion;
  guard.lastSeen = state === 'hunting' ? { x: world.player.x, y: world.player.y } : null;
  guard.lastSeenAt = world.time;
}

/** Mark loot pieces taken, by kind and position, for a scene's totals. */
function takeLoot(world, spots) {
  for (const spot of spots) {
    const item = world.wing.loot.find((l) => l.x === spot[0] && l.y === spot[1] && !l.taken);
    if (item) item.taken = true;
  }
}

/** The Vault climax — the cover. Diamond glowing, lasers live, alarm 62%. */
function sceneCover(world) {
  enterWing(world, 2, null);
  world.player.x = 700;
  world.player.y = 368;
  world.player.angle = (-125 * Math.PI) / 180;
  world.player.sneaking = true;
  world.alarm = 62;
  world.timeLeft = 277;
  world.lootValue = 41000;
  world.lootTaken = 6;
  world.tools = { smoke: 2, decoy: 2, lockpick: 1, emp: 1, disguise: 1 };
  takeLoot(world, [[880, 150], [1120, 150], [940, 260], [1120, 260], [300, 150], [300, 580]]);
  poseGuard(world, 'Jono', 820, 180, 115, 'suspicious', 80);
  poseGuard(world, 'Putri', 600, 520, -80, 'suspicious', 45);
  poseGuard(world, 'Eko', 420, 300, 0, 'calm', 20);
  poseGuard(world, 'Ratna', 1050, 420, 180, 'calm', 10);
  world.smokes.push({ x: 770, y: 395, r: 95, until: world.time + 6 });
}

/** The Slots Floor mid-action: between the machines, cones sweeping. */
function sceneSlots(world) {
  enterWing(world, 0, null);
  world.player.x = 560;
  world.player.y = 310;
  world.player.angle = (-90 * Math.PI) / 180;
  world.alarm = 18;
  world.timeLeft = 492;
  world.lootValue = 12400;
  world.lootTaken = 7;
  world.tools = { smoke: 3, decoy: 2, lockpick: 2, emp: 2, disguise: 2 };
  takeLoot(world, [[240, 190], [420, 310], [600, 190], [780, 430], [960, 310], [150, 540], [1000, 130]]);
  poseGuard(world, 'Dara', 700, 180, 90, 'suspicious', 55);
  poseGuard(world, 'Bimo', 420, 430, -90, 'calm', 12);
  poseGuard(world, 'Laras', 900, 540, 180, 'calm', 8);
  poseGuard(world, 'Sari', 1150, 330, 90, 'calm', 5);
}

/** The High-Roller Salon mid-action: felt tables, gold, the vault door. */
function sceneSalon(world) {
  enterWing(world, 1, null);
  world.player.x = 640;
  world.player.y = 360;
  world.player.angle = (35 * Math.PI) / 180;
  world.alarm = 34;
  world.timeLeft = 365;
  world.lootValue = 26700;
  world.lootTaken = 5;
  world.tools = { smoke: 2, decoy: 3, lockpick: 2, emp: 1, disguise: 2 };
  takeLoot(world, [[340, 310], [940, 310], [640, 550], [1130, 170], [180, 150]]);
  poseGuard(world, 'Agus', 760, 200, 90, 'calm', 30);
  poseGuard(world, 'Maya', 900, 460, 180, 'suspicious', 60);
  poseGuard(world, 'Rudi', 300, 500, 0, 'calm', 15);
  poseGuard(world, 'Dewi', 1120, 250, 90, 'calm', 10);
}

/** The getaway gone wrong: alarm 91%, diamond in hand, guards hunting. */
function sceneCaught(world) {
  enterWing(world, 2, null);
  world.player.x = 1080;
  world.player.y = 600;
  world.player.angle = (90 * Math.PI) / 180;
  world.alarm = 91;
  world.timeLeft = 138;
  world.lootValue = 291000;
  world.lootTaken = 7;
  world.diamondTaken = true;
  world.wing.exit.active = true;
  world.tools = { smoke: 0, decoy: 1, lockpick: 0, emp: 0, disguise: 0 };
  takeLoot(world, [[1035, 255], [880, 150], [1120, 150], [940, 260], [1120, 260], [300, 150], [300, 580]]);
  poseGuard(world, 'Jono', 900, 500, 55, 'hunting', 100);
  poseGuard(world, 'Putri', 1000, 450, 70, 'hunting', 100);
  poseGuard(world, 'Ratna', 1150, 480, 110, 'hunting', 100);
  poseGuard(world, 'Eko', 950, 580, 90, 'hunting', 100);
  world.smokes.push({ x: 1050, y: 560, r: 80, until: world.time + 6 });
}

/**
 * Set up a named scene on a fresh world and freeze it: the render loop
 * draws this exact state and nothing moves. Unknown names leave the title.
 */
export function applyScene(world, name) {
  world.mode = 'playing';
  world.frozen = true;
  if (name === 'cover') sceneCover(world);
  else if (name === 'slots') sceneSlots(world);
  else if (name === 'salon') sceneSalon(world);
  else if (name === 'caught') sceneCaught(world);
  else world.mode = 'title';
}
