// Meridian Casino — the three wings of the casino, laid out as data.
//
// Each wing is one full screen (1280x720): the room the thief crosses, its
// walls with door gaps, the cover that blocks movement and sight (slot
// machines, felt tables, pillars, the bar), the loot on the floor, the
// guards' patrol loops, the cameras and — in the Vault — the laser grid and
// the getaway exit. Nothing here moves; the systems in the other files walk
// this data. Coordinates are canvas pixels; the room interior is x 24..1256,
// y 64..656, with the HUD bands above and below it.

import { GUARD_ROSTER } from './config.js';

const rect = (x, y, w, h) => ({ x, y, w, h });

/** The room's border walls, with a gap where `gap` says (for a door). */
function borderWalls(gapSide) {
  const walls = [
    rect(24, 64, 1232, 14), // top
    rect(24, 642, 1232, 14), // bottom
    rect(24, 64, 14, 578), // left
    rect(1242, 64, 14, 578), // right
  ];
  if (gapSide === 'left') {
    walls[2] = null;
    walls.push(rect(24, 64, 14, 236), rect(24, 380, 14, 276));
  }
  if (gapSide === 'right') {
    walls[3] = null;
    walls.push(rect(1242, 64, 14, 236), rect(1242, 380, 14, 276));
  }
  if (gapSide === 'both') {
    walls[2] = null;
    walls[3] = null;
    walls.push(
      rect(24, 64, 14, 236), rect(24, 380, 14, 276),
      rect(1242, 64, 14, 236), rect(1242, 380, 14, 276),
    );
  }
  return walls.filter(Boolean);
}

/** A guard's spawn record: name, role, start point and patrol loop. */
function guardSpawn(name, role, x, y, waypoints) {
  return { name, role, x, y, waypoints };
}

/** A loot piece on the floor: kind sets its dollar value. */
function loot(x, y, kind) {
  return { x, y, kind, taken: false };
}

// ---------------------------------------------------------------- wing 1

const slotsFloor = {
  index: 0,
  name: 'Slots Floor',
  subtitle: 'Rows of machines, four guards, two cameras',
  floor: { base: '#2b1439', dark: '#22102e', light: '#351a46' },
  accent: '#ff4d9d',
  walls: borderWalls('right'),
  cover: [
    // Three rows of five slot machines, aisles between them.
    ...[150, 330, 510, 690, 870].map((x) => ({ ...rect(x, 120, 84, 50), kind: 'slots' })),
    ...[150, 330, 510, 690, 870].map((x) => ({ ...rect(x, 240, 84, 50), kind: 'slots' })),
    ...[150, 330, 510, 690, 870].map((x) => ({ ...rect(x, 360, 84, 50), kind: 'slots' })),
    { ...rect(1050, 100, 170, 60), kind: 'bar', label: 'BAR' },
    { ...rect(1050, 500, 170, 110), kind: 'cage', label: 'CASHIER' },
    { ...rect(60, 100, 30, 30), kind: 'plant' },
    { ...rect(60, 580, 30, 30), kind: 'plant' },
  ],
  doors: [
    { ...rect(1242, 300, 14, 80), to: 1, locked: false, label: 'HIGH-ROLLER SALON' },
  ],
  loot: [
    loot(240, 190, 'chips'),
    loot(420, 310, 'chips'),
    loot(600, 190, 'chips'),
    loot(780, 430, 'chips'),
    loot(960, 310, 'chips'),
    loot(150, 540, 'chips'),
    loot(1000, 130, 'gold'),
    loot(980, 560, 'cash'),
  ],
  guards: [
    guardSpawn('Dara', 'Pit Boss', 200, 180, [[200, 180], [1100, 180], [1100, 300], [200, 300]]),
    guardSpawn('Bimo', 'Slots Patrol', 300, 430, [[300, 430], [1000, 430], [1000, 540], [300, 540]]),
    guardSpawn('Laras', 'Slots Patrol', 150, 600, [[150, 600], [700, 600], [700, 520], [150, 520]]),
    guardSpawn('Sari', 'Door Watch', 1150, 250, [[1150, 250], [1150, 420], [1000, 420], [1000, 250]]),
  ],
  cameras: [
    { x: 60, y: 80, angle: 0.6, sweep: 0.9, range: 205 },
    { x: 1200, y: 620, angle: Math.PI + 0.6, sweep: 0.9, range: 205 },
  ],
  lasers: [],
  playerStart: { x: 70, y: 590 },
  exit: null,
  decor: {
    chandeliers: [[320, 110], [640, 110], [960, 110]],
    sign: { x: 640, y: 100, text: 'SLOTS' },
    carpetSeed: 11,
  },
};

// ---------------------------------------------------------------- wing 2

const highRollerSalon = {
  index: 1,
  name: 'High-Roller Salon',
  subtitle: 'Felt tables, high rollers, the vault door',
  floor: { base: '#1d2b1a', dark: '#16241a', light: '#243626' },
  accent: '#37e0ff',
  walls: borderWalls('both'),
  cover: [
    { ...rect(220, 180, 240, 120), kind: 'table', label: 'POKER' },
    { ...rect(820, 180, 240, 120), kind: 'table', label: 'POKER' },
    { ...rect(520, 420, 240, 120), kind: 'table', label: 'BLACKJACK' },
    { ...rect(1050, 90, 170, 60), kind: 'bar', label: 'BAR' },
    { ...rect(480, 300, 36, 36), kind: 'pillar' },
    { ...rect(780, 300, 36, 36), kind: 'pillar' },
    { ...rect(180, 480, 90, 90), kind: 'roulette', label: 'ROULETTE' },
  ],
  doors: [
    { ...rect(24, 300, 14, 80), to: 0, locked: false, label: 'SLOTS FLOOR' },
    { ...rect(1242, 300, 14, 80), to: 2, locked: true, label: 'THE VAULT — LOCKED' },
  ],
  loot: [
    loot(340, 310, 'gold'),
    loot(940, 310, 'gold'),
    loot(640, 550, 'gold'),
    loot(1130, 170, 'cash'),
    loot(180, 150, 'chips'),
    loot(1100, 540, 'chips'),
    loot(520, 600, 'gold'),
  ],
  guards: [
    guardSpawn('Agus', 'Floor Manager', 340, 140, [[340, 140], [760, 140], [760, 330], [340, 330]]),
    guardSpawn('Maya', 'High-Roller Watch', 760, 420, [[760, 420], [1100, 420], [1100, 580], [760, 580]]),
    guardSpawn('Rudi', 'Table Patrol', 160, 420, [[160, 420], [500, 420], [500, 580], [160, 580]]),
    guardSpawn('Dewi', 'Bar Watch', 1100, 170, [[1100, 170], [1180, 170], [1180, 330], [1100, 330]]),
  ],
  cameras: [
    { x: 640, y: 80, angle: Math.PI / 2, sweep: 1.1, range: 205 },
    { x: 80, y: 620, angle: -0.8, sweep: 0.9, range: 205 },
  ],
  lasers: [],
  playerStart: { x: 70, y: 340 },
  exit: null,
  decor: {
    chandeliers: [[340, 110], [940, 110]],
    sign: { x: 640, y: 100, text: 'HIGH ROLLER' },
    carpetSeed: 23,
  },
};

// ---------------------------------------------------------------- wing 3

const vault = {
  index: 2,
  name: 'The Vault',
  subtitle: 'The Meridian Diamond — and the way out',
  floor: { base: '#241a30', dark: '#1b1226', light: '#2e2140' },
  accent: '#ffd94d',
  walls: [
    rect(24, 64, 1232, 14), // top
    rect(24, 642, 1056, 14), // bottom, left of the getaway gap
    rect(1160, 642, 96, 14), // bottom, right of the getaway gap
    rect(24, 64, 14, 236), // left, above the door
    rect(24, 380, 14, 276), // left, below the door
    rect(1242, 64, 14, 578), // right
  ],
  cover: [
    { ...rect(1000, 170, 70, 70), kind: 'pedestal', label: 'MERIDIAN DIAMOND' },
    { ...rect(420, 180, 40, 40), kind: 'pillar' },
    { ...rect(420, 470, 40, 40), kind: 'pillar' },
    { ...rect(760, 470, 40, 40), kind: 'pillar' },
    { ...rect(760, 180, 40, 40), kind: 'pillar' },
    { ...rect(60, 100, 30, 30), kind: 'plant' },
    { ...rect(60, 580, 30, 30), kind: 'plant' },
  ],
  doors: [
    { ...rect(24, 300, 14, 80), to: 1, locked: false, label: 'HIGH-ROLLER SALON' },
  ],
  loot: [
    loot(1035, 255, 'diamond'),
    loot(880, 150, 'cash'),
    loot(1120, 150, 'cash'),
    loot(940, 260, 'cash'),
    loot(1120, 260, 'gold'),
    loot(300, 150, 'gold'),
    loot(300, 580, 'chips'),
  ],
  guards: [
    guardSpawn('Jono', 'Vault Chief', 600, 150, [[600, 150], [850, 150], [850, 230], [600, 230]]),
    guardSpawn('Putri', 'Vault Patrol', 500, 480, [[500, 480], [900, 480], [900, 580], [500, 580]]),
    guardSpawn('Eko', 'Laser Watch', 360, 300, [[360, 300], [360, 500], [280, 500], [280, 300]]),
    guardSpawn('Ratna', 'Vault Patrol', 1150, 300, [[1150, 300], [1150, 550], [1030, 550], [1030, 300]]),
  ],
  cameras: [
    { x: 640, y: 80, angle: Math.PI / 2, sweep: 1.3, range: 205 },
  ],
  // Three staggered horizontal beams and one short vertical beam guarding
  // the pedestal's left approach. The gaps zigzag: cross the first on the
  // right, the second on the left, the third on the right again.
  lasers: [
    { x1: 380, y1: 250, x2: 1000, y2: 250, active: true, cooldown: 0 },
    { x1: 600, y1: 330, x2: 1242, y2: 330, active: true, cooldown: 0 },
    { x1: 380, y1: 410, x2: 1000, y2: 410, active: true, cooldown: 0 },
    { x1: 900, y1: 120, x2: 900, y2: 200, active: true, cooldown: 0 },
  ],
  playerStart: { x: 70, y: 340 },
  exit: { ...rect(1080, 642, 80, 14), label: 'GETAWAY — SERVICE EXIT', active: false },
  decor: {
    chandeliers: [[640, 110]],
    sign: { x: 640, y: 100, text: 'VAULT' },
    carpetSeed: 37,
  },
};

export const WINGS = [slotsFloor, highRollerSalon, vault];

/** Every solid rectangle of a wing: walls plus cover, for movement and sight. */
export function wingSolids(wing) {
  return [...wing.walls, ...wing.cover];
}

/** The twelve guards, in wing order, with the roster's roles attached. */
export function allGuards() {
  return GUARD_ROSTER.map((entry) => {
    const wing = WINGS[entry.wing];
    const spawn = wing.guards.find((g) => g.name === entry.name);
    return { ...entry, wing: entry.wing, spawn };
  });
}
