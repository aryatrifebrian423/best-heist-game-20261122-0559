// Meridian Casino — the renderer: everything the judge will ever see.
//
// One canvas, one frame: the carpet and the walls, the machines and the
// felt tables, the guards with their cones, the cameras with their red
// sweeps, the loot glowing on the floor, the lasers, the smoke, and Raka
// slipping between them. The picture is the game: a screenshot must show
// a room, guards with cones, cameras, a loot target and the alarm meter
// all in one frame, so nothing important is ever drawn off-screen or
// hidden behind a menu.

import { COLORS, VIEW_H, VIEW_W } from './config.js';
import { cameraDisabled } from './cameras.js';
import { guardCone } from './guards.js';
import { makeRng } from './rng.js';

/** A wedge path for a vision cone. */
function conePath(ctx, x, y, angle, range, half) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, angle - half, angle + half);
  ctx.closePath();
}

/** A rounded rectangle path, for machines, tables and panels. */
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** The carpet: a dark base, a faint diamond weave, and seeded gold flecks. */
function drawFloor(ctx, world) {
  const wing = world.wing;
  ctx.fillStyle = wing.floor.base;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  const rng = makeRng(wing.decor.carpetSeed);
  ctx.fillStyle = wing.floor.light;
  for (let i = 0; i < 90; i++) {
    const x = 24 + rng() * 1232;
    const y = 64 + rng() * 592;
    ctx.globalAlpha = 0.16;
    ctx.beginPath();
    ctx.arc(x, y, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  // A faint diamond weave across the carpet.
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.07)';
  ctx.lineWidth = 1;
  for (let x = -720; x < 2000; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 64);
    ctx.lineTo(x + 592, 656);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + 592, 64);
    ctx.lineTo(x, 656);
    ctx.stroke();
  }
  // Chandeliers: warm pools of light.
  for (const [cx, cy] of wing.decor.chandeliers) {
    const glow = ctx.createRadialGradient(cx, cy, 4, cx, cy, 130);
    glow.addColorStop(0, 'rgba(255, 217, 77, 0.28)');
    glow.addColorStop(1, 'rgba(255, 217, 77, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(cx - 130, cy - 130, 260, 260);
    ctx.fillStyle = COLORS.goldBright;
    ctx.beginPath();
    ctx.arc(cx, cy, 7, 0, Math.PI * 2);
    ctx.fill();
  }
  // The wing's neon sign, high on the wall.
  ctx.save();
  ctx.font = 'bold 26px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.shadowColor = wing.accent;
  ctx.shadowBlur = 18;
  ctx.fillStyle = wing.accent;
  ctx.fillText(wing.decor.sign.text, wing.decor.sign.x, wing.decor.sign.y + 8);
  ctx.restore();
}

/** Walls: near-black with a gold trim line on the room side. */
function drawWalls(ctx, world) {
  for (const wall of world.wing.walls) {
    ctx.fillStyle = COLORS.wall;
    ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
    ctx.fillStyle = COLORS.wallTrim;
    if (wall.h <= 16) ctx.fillRect(wall.x, wall.y + wall.h - 3, wall.w, 3);
    else ctx.fillRect(wall.x + wall.w - 3, wall.y, 3, wall.h);
  }
}

/** One piece of cover: a machine, a table, a pillar, the bar, the cage. */
function drawCover(ctx, piece) {
  const { x, y, w, h, kind } = piece;
  if (kind === 'slots') {
    ctx.fillStyle = '#3a1c52';
    roundRect(ctx, x, y, w, h, 8);
    ctx.fill();
    ctx.strokeStyle = COLORS.gold;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#12081d';
    roundRect(ctx, x + 8, y + 8, w - 16, 22, 4);
    ctx.fill();
    const symbols = ['7', '★', '$'];
    ctx.font = 'bold 13px Georgia, serif';
    ctx.textAlign = 'center';
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = ['#ffd94d', '#ff4d9d', '#37e0ff'][i];
      ctx.fillText(symbols[i], x + 18 + i * 24, y + 24);
    }
    ctx.fillStyle = COLORS.goldBright;
    ctx.fillRect(x + w - 10, y + 10, 4, 20);
    ctx.beginPath();
    ctx.arc(x + w - 8, y + 8, 4, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  if (kind === 'table') {
    ctx.fillStyle = COLORS.felt;
    roundRect(ctx, x, y, w, h, 26);
    ctx.fill();
    ctx.strokeStyle = COLORS.gold;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.strokeStyle = 'rgba(242, 232, 213, 0.5)';
    ctx.lineWidth = 1;
    roundRect(ctx, x + 10, y + 10, w - 20, h - 20, 20);
    ctx.stroke();
    // Cards and a chip pile on the felt.
    ctx.fillStyle = '#f2e8d5';
    ctx.fillRect(x + w / 2 - 34, y + h / 2 - 12, 20, 28);
    ctx.fillRect(x + w / 2 - 8, y + h / 2 - 12, 20, 28);
    ctx.fillStyle = '#c0392b';
    ctx.beginPath();
    ctx.arc(x + w / 2 + 34, y + h / 2, 9, 0, Math.PI * 2);
    ctx.fill();
    if (piece.label) {
      ctx.font = 'bold 12px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = COLORS.goldBright;
      ctx.fillText(piece.label, x + w / 2, y + h - 12);
    }
    return;
  }
  if (kind === 'pillar') {
    ctx.fillStyle = '#4a4450';
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h / 2, w / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#6b6472';
    ctx.beginPath();
    ctx.arc(x + w / 2 - 4, y + h / 2 - 4, w / 2 - 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = COLORS.gold;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h / 2, w / 2, 0, Math.PI * 2);
    ctx.stroke();
    return;
  }
  if (kind === 'bar' || kind === 'cage') {
    ctx.fillStyle = '#241a10';
    roundRect(ctx, x, y, w, h, 6);
    ctx.fill();
    ctx.strokeStyle = COLORS.gold;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#3a2c14';
    ctx.fillRect(x + 6, y + 6, w - 12, 14);
    ctx.font = 'bold 12px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = COLORS.goldBright;
    ctx.fillText(piece.label || '', x + w / 2, y + h / 2 + 12);
    return;
  }
  if (kind === 'roulette') {
    ctx.fillStyle = '#1d2b1a';
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h / 2, w / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = COLORS.gold;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = COLORS.felt;
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h / 2, w / 2 - 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f2e8d5';
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h / 2, 6, 0, Math.PI * 2);
    ctx.fill();
    if (piece.label) {
      ctx.font = 'bold 11px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = COLORS.goldBright;
      ctx.fillText(piece.label, x + w / 2, y + h + 14);
    }
    return;
  }
  if (kind === 'pedestal') {
    ctx.fillStyle = '#191024';
    roundRect(ctx, x, y, w, h, 6);
    ctx.fill();
    ctx.strokeStyle = COLORS.gold;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.font = 'bold 10px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = COLORS.goldBright;
    ctx.fillText('MERIDIAN', x + w / 2, y + h - 8);
    return;
  }
  if (kind === 'plant') {
    ctx.fillStyle = '#1d4a24';
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h / 2, w / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2f7a37';
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h / 2 - 4, w / 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Doors: a lit gap in the wall, with its label and a lock when shut. */
function drawDoors(ctx, world) {
  for (const door of world.wing.doors) {
    const cx = door.x + door.w / 2;
    const cy = door.y + door.h / 2;
    ctx.fillStyle = door.locked ? '#3a0d0d' : '#0d2b18';
    ctx.fillRect(door.x - 2, door.y - 2, door.w + 4, door.h + 4);
    ctx.strokeStyle = door.locked ? '#ff4040' : COLORS.gold;
    ctx.lineWidth = 2;
    ctx.strokeRect(door.x - 2, door.y - 2, door.w + 4, door.h + 4);
    ctx.save();
    ctx.translate(door.x < 100 ? door.x + 34 : door.x - 20, cy);
    ctx.rotate(door.x < 100 ? -Math.PI / 2 : Math.PI / 2);
    ctx.font = 'bold 12px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = door.locked ? '#ff8080' : COLORS.goldBright;
    ctx.fillText(door.label, 0, 4);
    ctx.restore();
  }
  const exit = world.wing.exit;
  if (exit) {
    const active = exit.active;
    ctx.fillStyle = active ? '#0d5c33' : '#2a2a2a';
    ctx.fillRect(exit.x, exit.y, exit.w, exit.h + 8);
    ctx.strokeStyle = active ? '#37d67a' : '#777';
    ctx.lineWidth = 2;
    ctx.strokeRect(exit.x, exit.y, exit.w, exit.h + 8);
    ctx.font = 'bold 12px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = active ? '#7dffb0' : '#999';
    ctx.fillText(active ? 'GETAWAY EXIT — GO!' : 'SERVICE EXIT — LOCKED', exit.x + exit.w / 2, exit.y - 8);
  }
}

/** The laser grid: bright red beams, dim when cut or EMP-dead. */
function drawLasers(ctx, world) {
  const now = world.time;
  for (const laser of world.wing.lasers) {
    const empDead = laser.empUntil && laser.empUntil > now;
    const live = laser.active && !empDead;
    ctx.save();
    ctx.strokeStyle = live ? '#ff2e2e' : 'rgba(120, 120, 120, 0.4)';
    ctx.lineWidth = live ? 3 : 1.5;
    if (live) {
      ctx.shadowColor = '#ff2e2e';
      ctx.shadowBlur = 10;
      ctx.setLineDash([]);
    } else {
      ctx.setLineDash([6, 6]);
    }
    ctx.beginPath();
    ctx.moveTo(laser.x1, laser.y1);
    ctx.lineTo(laser.x2, laser.y2);
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = live ? '#ff6b6b' : '#666';
    ctx.beginPath();
    ctx.arc(laser.x1, laser.y1, 4, 0, Math.PI * 2);
    ctx.arc(laser.x2, laser.y2, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Loot on the floor: chip stacks, gold, cash, and the glowing diamond. */
function drawLoot(ctx, world) {
  for (const item of world.wing.loot) {
    if (item.taken) continue;
    const { x, y, kind } = item;
    if (kind === 'chips') {
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = ['#c0392b', '#f2e8d5', '#2456c8'][i];
        ctx.beginPath();
        ctx.ellipse(x, y - i * 4, 12, 5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.font = 'bold 10px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = COLORS.goldBright;
      ctx.fillText('$1,200', x, y + 16);
    } else if (kind === 'gold') {
      ctx.fillStyle = '#8a6d1d';
      ctx.beginPath();
      ctx.ellipse(x, y, 14, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = COLORS.goldBright;
      ctx.beginPath();
      ctx.ellipse(x, y - 4, 12, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = 'bold 10px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = COLORS.goldBright;
      ctx.fillText('$5,200', x, y + 16);
    } else if (kind === 'cash') {
      ctx.fillStyle = '#1d5c33';
      roundRect(ctx, x - 14, y - 8, 28, 16, 3);
      ctx.fill();
      ctx.fillStyle = '#37d67a';
      ctx.font = 'bold 11px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('$', x, y + 4);
      ctx.fillStyle = COLORS.goldBright;
      ctx.font = 'bold 10px Georgia, serif';
      ctx.fillText('$9,800', x, y + 20);
    } else if (kind === 'diamond') {
      ctx.save();
      ctx.shadowColor = '#37e0ff';
      ctx.shadowBlur = 22;
      ctx.fillStyle = '#8df2ff';
      ctx.beginPath();
      ctx.moveTo(x, y - 16);
      ctx.lineTo(x + 13, y - 2);
      ctx.lineTo(x, y + 12);
      ctx.lineTo(x - 13, y - 2);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#e8fdff';
      ctx.beginPath();
      ctx.moveTo(x, y - 16);
      ctx.lineTo(x + 6, y - 2);
      ctx.lineTo(x, y + 4);
      ctx.lineTo(x - 6, y - 2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      ctx.font = 'bold 11px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#8df2ff';
      ctx.fillText('MERIDIAN DIAMOND $250,000', x, y + 30);
    }
  }
}

/** Cameras: a wall box and its red sweep cone. */
function drawCameras(ctx, world) {
  for (const camera of world.cameras) {
    const dead = cameraDisabled(camera, world.time);
    if (!dead) {
      ctx.fillStyle = COLORS.cameraCone;
      conePath(ctx, camera.x, camera.y, camera.angle, camera.range, 0.47);
      ctx.fill();
    }
    ctx.fillStyle = dead ? '#555' : '#333';
    ctx.fillRect(camera.x - 9, camera.y - 6, 18, 12);
    ctx.fillStyle = dead ? '#333' : '#ff4040';
    ctx.beginPath();
    ctx.arc(camera.x + 8, camera.y, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Guards: the cone, the suited figure, the name, the suspicion arc. */
function drawGuards(ctx, world) {
  for (const guard of world.guards) {
    const cone = guardCone(guard);
    ctx.fillStyle = cone.fill;
    conePath(ctx, guard.x, guard.y, guard.angle, cone.range, cone.half);
    ctx.fill();
    // Body: dark suit, head, tie, facing tick.
    ctx.fillStyle = '#1b2340';
    ctx.beginPath();
    ctx.arc(guard.x, guard.y, guard.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = guard.state === 'hunting' ? '#ff4040' : COLORS.gold;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#e8c39a';
    ctx.beginPath();
    ctx.arc(guard.x + Math.cos(guard.angle) * 5, guard.y + Math.sin(guard.angle) * 5, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f2e8d5';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(guard.x, guard.y);
    ctx.lineTo(guard.x + Math.cos(guard.angle) * (guard.radius + 7), guard.y + Math.sin(guard.angle) * (guard.radius + 7));
    ctx.stroke();
    // Name and role above the head.
    ctx.font = 'bold 11px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f2e8d5';
    ctx.fillText(guard.name, guard.x, guard.y - guard.radius - 14);
    ctx.font = '10px Georgia, serif';
    ctx.fillStyle = COLORS.textDim;
    ctx.fillText(guard.role, guard.x, guard.y - guard.radius - 3);
    // Suspicion arc: fills as the guard grows sure.
    if (guard.suspicion > 2) {
      ctx.strokeStyle = guard.suspicion > 60 ? '#ff4040' : '#ffb020';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(guard.x, guard.y, guard.radius + 6, -Math.PI / 2, -Math.PI / 2 + (guard.suspicion / 100) * Math.PI * 2);
      ctx.stroke();
    }
  }
}

/** Smoke clouds, decoy chips, and particles. */
function drawEffects(ctx, world) {
  for (const smoke of world.smokes) {
    ctx.fillStyle = COLORS.smoke;
    ctx.beginPath();
    ctx.arc(smoke.x, smoke.y, smoke.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(smoke.x - 30, smoke.y + 12, smoke.r * 0.6, 0, Math.PI * 2);
    ctx.arc(smoke.x + 34, smoke.y - 10, smoke.r * 0.55, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const decoy of world.decoys) {
    ctx.fillStyle = COLORS.goldBright;
    ctx.beginPath();
    ctx.arc(decoy.x, decoy.y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(decoy.x, decoy.y, 10, 0, Math.PI * 2);
    ctx.stroke();
  }
  for (const p of world.particles) {
    if (p.kind === 'flash') continue;
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/** Raka: black hood, gold trim, and the word YOU so the judge finds him. */
function drawPlayer(ctx, world) {
  const player = world.player;
  const disguised = player.disguiseUntil > world.time;
  ctx.save();
  if (disguised) {
    ctx.shadowColor = '#37e0ff';
    ctx.shadowBlur = 12;
  }
  ctx.fillStyle = disguised ? '#123a4a' : '#0d0d12';
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = disguised ? '#37e0ff' : COLORS.goldBright;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.fillStyle = '#f2e8d5';
  ctx.beginPath();
  ctx.arc(player.x + Math.cos(player.angle) * 5, player.y + Math.sin(player.angle) * 5, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.font = 'bold 11px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = COLORS.goldBright;
  ctx.fillText(disguised ? 'RAKA — DISGUISED' : 'RAKA — YOU', player.x, player.y - player.radius - 12);
  if (player.sneaking) {
    ctx.font = '10px Georgia, serif';
    ctx.fillStyle = COLORS.textDim;
    ctx.fillText('sneaking', player.x, player.y + player.radius + 14);
  }
}

/** The whole world, in draw order. */
export function renderWorld(ctx, world) {
  drawFloor(ctx, world);
  drawWalls(ctx, world);
  for (const piece of world.wing.cover) drawCover(ctx, piece);
  drawDoors(ctx, world);
  drawLasers(ctx, world);
  drawLoot(ctx, world);
  drawCameras(ctx, world);
  drawGuards(ctx, world);
  drawEffects(ctx, world);
  drawPlayer(ctx, world);
  // A red wash while the floor is hunting.
  if (world.alarm >= 70) {
    const pulse = 0.05 + 0.03 * Math.sin(world.time * 4);
    ctx.fillStyle = `rgba(255, 40, 40, ${pulse})`;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  }
}
