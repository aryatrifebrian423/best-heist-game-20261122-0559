// Meridian Casino — the twelve guards: patrol, suspicion, the hunt.
//
// A guard walks a loop of waypoints, facing where they walk, sweeping a
// vision cone ahead of them. When the thief crosses the cone with a clear
// line of sight, suspicion climbs — faster up close, faster still when the
// thief runs or the alarm is already warm. At full suspicion the guard
// raises the alarm and hunts the last place they saw the thief. A smoke
// cloud blinds them; a decoy chip pulls them off their route; a disguise
// lets the thief pass at a distance. Guards never trip the lasers — they
// work here.

import {
  GUARD_CATCH_DISTANCE,
  GUARD_CONE_HALF,
  GUARD_CONE_RANGE,
  GUARD_HUNT_SPEED,
  GUARD_PATROL_SPEED,
  GUARD_RADIUS,
  GUARD_SUSPICION_CLOSE_RATE,
  GUARD_SUSPICION_DECAY,
  GUARD_SUSPICION_RATE,
} from './config.js';
import { angleDiff, dist, inVisionCone, resolveCircleRect } from './geometry.js';

/** A live guard, built from a spawn record in levels.js. */
export function createGuard(spawn) {
  return {
    name: spawn.name,
    role: spawn.role,
    x: spawn.x,
    y: spawn.y,
    angle: 0,
    waypointIndex: 0,
    waypoints: spawn.waypoints,
    state: 'calm', // calm | suspicious | hunting
    suspicion: 0,
    lastSeen: null,
    lastSeenAt: -99,
    lure: null,
    pauseAt: 0,
    radius: GUARD_RADIUS,
  };
}

/** Whether the segment from a to b passes through any smoke cloud. */
function smokeBlocks(x1, y1, x2, y2, smokes) {
  for (const s of smokes) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len2 = dx * dx + dy * dy;
    let t = 0;
    if (len2 > 0) t = Math.max(0, Math.min(1, ((s.x - x1) * dx + (s.y - y1) * dy) / len2));
    const px = x1 + dx * t;
    const py = y1 + dy * t;
    if (dist(px, py, s.x, s.y) < s.r) return true;
  }
  return false;
}

/** Turn `angle` toward `target` by at most `step` radians. */
function turnToward(angle, target, step) {
  let d = target - angle;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  if (Math.abs(d) <= step) return target;
  return angle + Math.sign(d) * step;
}

/**
 * One frame of one guard. Reads the world, moves the guard, and pushes
 * events (spotted, caught) into world.events. Returns nothing.
 */
export function updateGuard(guard, dt, world) {
  const player = world.player;
  const now = world.time;
  const disguised = player.disguiseUntil > now;
  const inSmoke = smokeBlocks(guard.x, guard.y, player.x, player.y, world.smokes);

  // --- senses: can this guard see the thief right now?
  let sees = false;
  if (!inSmoke) {
    const range = disguised ? 62 : GUARD_CONE_RANGE;
    sees = inVisionCone(guard.x, guard.y, guard.angle, range, GUARD_CONE_HALF, player.x, player.y, world.solids);
  }

  // --- suspicion climbs while seen, falls while hidden.
  if (sees) {
    const close = dist(guard.x, guard.y, player.x, player.y) < 90;
    let rate = close ? GUARD_SUSPICION_CLOSE_RATE : GUARD_SUSPICION_RATE;
    if (player.moving && !player.sneaking) rate *= 1.35;
    if (world.alarm >= 70) rate *= 1.25;
    guard.suspicion = Math.min(100, guard.suspicion + rate * dt);
    guard.lastSeen = { x: player.x, y: player.y };
    guard.lastSeenAt = now;
    if (guard.suspicion > 35 && guard.state === 'calm') guard.state = 'suspicious';
  } else {
    guard.suspicion = Math.max(0, guard.suspicion - GUARD_SUSPICION_DECAY * dt);
    if (guard.suspicion <= 0 && guard.state === 'suspicious') guard.state = 'calm';
  }

  // --- full suspicion raises the alarm and starts the hunt.
  if (guard.suspicion >= 100 && guard.state !== 'hunting') {
    guard.state = 'hunting';
    world.events.push({ type: 'spotted', guard: guard.name, x: guard.x, y: guard.y });
  }

  // --- movement: hunt, lure, or patrol.
  let target = null;
  let speed = GUARD_PATROL_SPEED;
  if (guard.state === 'hunting' && guard.lastSeen) {
    target = guard.lastSeen;
    speed = GUARD_HUNT_SPEED;
    if (sees) {
      target = { x: player.x, y: player.y };
      guard.lastSeen = { x: player.x, y: player.y };
      guard.lastSeenAt = now;
    } else if (now - guard.lastSeenAt > 5) {
      guard.state = 'suspicious';
      guard.suspicion = 55;
    }
  } else if (guard.lure && guard.lure.until > now) {
    target = guard.lure;
    speed = GUARD_PATROL_SPEED * 1.4;
  } else if (guard.lure) {
    guard.lure = null;
  } else {
    const wp = guard.waypoints[guard.waypointIndex];
    target = { x: wp[0], y: wp[1] };
    if (dist(guard.x, guard.y, wp[0], wp[1]) < 10) {
      guard.waypointIndex = (guard.waypointIndex + 1) % guard.waypoints.length;
    }
  }

  if (target) {
    const want = Math.atan2(target.y - guard.y, target.x - guard.x);
    guard.angle = turnToward(guard.angle, want, 5.2 * dt);
    const d = dist(guard.x, guard.y, target.x, target.y);
    if (d > 4) {
      const step = Math.min(d, speed * dt);
      let nx = guard.x + Math.cos(guard.angle) * step;
      let ny = guard.y + Math.sin(guard.angle) * step;
      for (const solid of world.solids) {
        const fixed = resolveCircleRect(nx, ny, guard.radius, solid);
        nx = fixed.x;
        ny = fixed.y;
      }
      guard.x = nx;
      guard.y = ny;
    }
  }

  // --- caught: a hunting guard touches the thief.
  if (guard.state === 'hunting' && dist(guard.x, guard.y, player.x, player.y) < GUARD_CATCH_DISTANCE + 6) {
    world.events.push({ type: 'caught', guard: guard.name });
  }
}

/** The cone a guard is showing right now: colour by state, range by role. */
export function guardCone(guard) {
  if (guard.state === 'hunting') return { range: GUARD_CONE_RANGE + 30, half: GUARD_CONE_HALF, fill: 'rgba(255, 60, 60, 0.42)' };
  if (guard.state === 'suspicious') return { range: GUARD_CONE_RANGE, half: GUARD_CONE_HALF, fill: 'rgba(255, 140, 40, 0.34)' };
  return { range: GUARD_CONE_RANGE, half: GUARD_CONE_HALF, fill: 'rgba(255, 214, 64, 0.20)' };
}
