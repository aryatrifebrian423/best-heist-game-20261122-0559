// Meridian Casino — the small moving things: sparks, smoke, chip bursts.
//
// Particles are the game's juice and nothing else: gold sparkles over a
// pickup, grey puffs where a smoke bomb lands, a red flash when the alarm
// jumps. They carry no gameplay, they die in under a second, and they are
// driven by the seeded generator so a replay looks the same.

import { range } from './rng.js';

/** A live particle. */
function makeParticle(x, y, vx, vy, life, size, color, kind) {
  return { x, y, vx, vy, life, maxLife: life, size, color, kind };
}

/** Gold sparkles over a picked-up loot piece. */
export function spawnPickupBurst(world, x, y, rng) {
  for (let i = 0; i < 14; i++) {
    const a = rng() * Math.PI * 2;
    const speed = range(rng, 30, 130);
    world.particles.push(makeParticle(
      x, y,
      Math.cos(a) * speed, Math.sin(a) * speed - 30,
      range(rng, 0.4, 0.9), range(rng, 2, 4.5),
      i % 3 === 0 ? '#ffd94d' : '#fff3c4', 'spark',
    ));
  }
}

/** Grey puffs where a smoke bomb goes off. */
export function spawnSmokePuffs(world, x, y, rng) {
  for (let i = 0; i < 18; i++) {
    const a = rng() * Math.PI * 2;
    const d = range(rng, 0, 70);
    world.particles.push(makeParticle(
      x + Math.cos(a) * d, y + Math.sin(a) * d,
      range(rng, -12, 12), range(rng, -18, -4),
      range(rng, 1.2, 2.2), range(rng, 8, 18),
      'rgba(205, 205, 215, 0.5)', 'puff',
    ));
  }
}

/** A red flash across the room when the alarm jumps. */
export function spawnAlarmFlash(world) {
  world.particles.push(makeParticle(640, 360, 0, 0, 0.5, 0, '#ff4040', 'flash'));
}

/** Cyan sparkles around the diamond, always drifting. */
export function spawnDiamondSparkle(world, x, y, rng) {
  const a = rng() * Math.PI * 2;
  world.particles.push(makeParticle(
    x + Math.cos(a) * range(rng, 6, 34), y + Math.sin(a) * range(rng, 6, 26),
    0, range(rng, -22, -8),
    range(rng, 0.5, 1.1), range(rng, 1.5, 3),
    '#7df3ff', 'spark',
  ));
}

/** One frame of every particle: drift, fade, and drop the dead. */
export function updateParticles(world, dt) {
  for (const p of world.particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += p.kind === 'spark' ? 60 * dt : -6 * dt;
    p.life -= dt;
  }
  world.particles = world.particles.filter((p) => p.life > 0);
  if (world.particles.length > 400) world.particles.length = 400;
}
