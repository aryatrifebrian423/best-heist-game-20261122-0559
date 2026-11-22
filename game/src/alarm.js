// Meridian Casino — the alarm meter and what it does to the floor.
//
// The alarm is the game's tension, 0 to 100. Guards spotting the thief,
// cameras catching a glimpse, and lasers tripped all push it up; quiet
// minutes let it bleed back down. At 70 every guard on the floor stops
// patrolling and hunts. At 100 the hunt never ends until the thief leaves
// the wing or breaks line of sight for good. The HUD reads it as a bar
// and a word: QUIET, WARM, HOT, HUNT.

import { ALARM_DECAY, ALARM_GUARD_SPOT, ALARM_HUNT_AT, ALARM_LASER_TRIP } from './config.js';

/** Push the alarm up by `amount`, firing the hunt when it crosses 70. */
export function addAlarm(world, amount) {
  const before = world.alarm;
  world.alarm = Math.min(100, world.alarm + amount);
  if (before < ALARM_HUNT_AT && world.alarm >= ALARM_HUNT_AT) {
    startHunt(world);
  }
}

/** Every guard on the floor hunts the thief's last known position. */
export function startHunt(world) {
  for (const guard of world.guards) {
    if (guard.state !== 'hunting') {
      guard.state = 'hunting';
      guard.suspicion = 100;
      guard.lastSeen = { x: world.player.x, y: world.player.y };
      guard.lastSeenAt = world.time;
    }
  }
  world.events.push({ type: 'hunt' });
}

/** One frame of the alarm: it bleeds down slowly while nobody sees you. */
export function updateAlarm(world, dt) {
  const anySeeing = world.guards.some((g) => g.suspicion > 60) || world.alarm >= 100;
  if (!anySeeing && world.alarm > 0) {
    world.alarm = Math.max(0, world.alarm - ALARM_DECAY * dt);
  }
}

/** The alarm's word for the HUD: QUIET, WARM, HOT or HUNT. */
export function alarmWord(alarm) {
  if (alarm >= ALARM_HUNT_AT) return 'HUNT';
  if (alarm >= 45) return 'HOT';
  if (alarm >= 18) return 'WARM';
  return 'QUIET';
}

/** The alarm's colour for the HUD bar. */
export function alarmColor(alarm) {
  if (alarm >= ALARM_HUNT_AT) return '#ff4040';
  if (alarm >= 45) return '#ffb020';
  return '#37d67a';
}

/** The fixed costs the event drain uses, so the numbers live in one place. */
export function alarmCosts() {
  return { guardSpot: ALARM_GUARD_SPOT, laserTrip: ALARM_LASER_TRIP };
}
