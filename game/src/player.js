// Meridian Casino — Raka "the Ghost", the thief.
//
// WASD or arrows to walk, Shift to sneak, E to pick up what the feet find.
// Walking makes noise; running makes more; sneaking makes almost none, and
// noise is what pulls a guard's head around. The thief is a circle against
// the room's rectangles: walls, machines, tables and pillars all push back.
// Crossing a live laser line trips it; walking into a door changes wings;
// walking into the getaway exit with the diamond ends the job.

import { PLAYER_RADIUS, PLAYER_SNEAK_SPEED, PLAYER_WALK_SPEED } from './config.js';
import { clamp, dist, pointInRect, resolveCircleRect, segmentsCross } from './geometry.js';
import { endFrameInput, isSneaking, moveAxis, wasPressed } from './input.js';
import { ROOM } from './config.js';

/** A fresh thief, standing at a wing's entrance. */
export function createPlayer(x, y) {
  return {
    x,
    y,
    angle: -Math.PI / 2,
    radius: PLAYER_RADIUS,
    moving: false,
    sneaking: false,
    noise: 0,
    disguiseUntil: 0,
    lastX: x,
    lastY: y,
  };
}

/**
 * One frame of the thief. Moves, collides, picks up loot, trips lasers,
 * and walks through doors. Returns 'door' with the door when one is
 * crossed, or null. All side effects land in world.events.
 */
export function updatePlayer(player, dt, world) {
  const axis = moveAxis();
  player.sneaking = isSneaking();
  player.moving = axis.x !== 0 || axis.y !== 0;
  const speed = player.sneaking ? PLAYER_SNEAK_SPEED : PLAYER_WALK_SPEED;

  const prevX = player.x;
  const prevY = player.y;
  if (player.moving) {
    player.angle = Math.atan2(axis.y, axis.x);
    let nx = player.x + axis.x * speed * dt;
    let ny = player.y + axis.y * speed * dt;
    nx = clamp(nx, ROOM.x + player.radius, ROOM.x + ROOM.w - player.radius);
    ny = clamp(ny, ROOM.y + player.radius, ROOM.y + ROOM.h - player.radius);
    for (const solid of world.solids) {
      const fixed = resolveCircleRect(nx, ny, player.radius, solid);
      nx = fixed.x;
      ny = fixed.y;
    }
    player.x = nx;
    player.y = ny;
  }

  // Noise: how loud the last step was. Guards hear running from further.
  const want = player.moving ? (player.sneaking ? 0.12 : 0.55) : 0;
  player.noise += (want - player.noise) * Math.min(1, 6 * dt);
  world.noise = player.noise;

  // Pick up loot by walking over it.
  for (const item of world.wing.loot) {
    if (item.taken) continue;
    if (dist(player.x, player.y, item.x, item.y) < 30) {
      item.taken = true;
      world.events.push({ type: 'pickup', kind: item.kind, x: item.x, y: item.y });
    }
  }

  // Trip a live laser by crossing its line (EMP-dead beams do not trip).
  for (const laser of world.wing.lasers) {
    if (!laser.active || (laser.empUntil && laser.empUntil > world.time) || laser.cooldown > world.time) continue;
    if (segmentsCross(prevX, prevY, player.x, player.y, laser.x1, laser.y1, laser.x2, laser.y2)) {
      laser.cooldown = world.time + 2;
      world.events.push({ type: 'laser', x: player.x, y: player.y });
    }
  }

  // Walk through a door to change wings.
  for (const door of world.wing.doors) {
    if (pointInRect(player.x, player.y, { x: door.x - 8, y: door.y - 8, w: door.w + 16, h: door.h + 16 })) {
      endFrameInput();
      return { door };
    }
  }

  // Walk out the getaway exit with the diamond.
  const exit = world.wing.exit;
  if (exit && exit.active && pointInRect(player.x, player.y, { x: exit.x - 10, y: exit.y - 10, w: exit.w + 20, h: exit.h + 20 })) {
    world.events.push({ type: 'escaped' });
  }
  return null;
}

/** Whether the thief stands close enough to interact with a point. */
export function nearPoint(player, x, y, radius) {
  return dist(player.x, player.y, x, y) < radius;
}
