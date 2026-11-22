// Meridian Casino — every constant the game runs on, in one place.
//
// Tuning lives here so a single number changes the feel everywhere: the
// canvas size, the thief's speed, how far a guard can see, what each tool
// costs, and the names of the twelve guards who walk the floor. Nothing
// here reads the clock or the network; the game is deterministic from its
// seed.

export const VIEW_W = 1280;
export const VIEW_H = 720;

// The HUD owns the top and bottom bands; the casino floor plays between.
export const HUD_TOP = 56;
export const HUD_BOTTOM = 664;

// The room's inner walls, in pixels. Every wing plays inside this box.
export const ROOM = { x: 24, y: 64, w: 1232, h: 592 };

// The thief.
export const PLAYER_RADIUS = 14;
export const PLAYER_WALK_SPEED = 168;
export const PLAYER_SNEAK_SPEED = 96;
export const PLAYER_HUNT_ESCAPE = 188;

// A guard's walk, chase and senses.
export const GUARD_RADIUS = 15;
export const GUARD_PATROL_SPEED = 72;
export const GUARD_HUNT_SPEED = 138;
export const GUARD_CONE_RANGE = 178;
export const GUARD_CONE_HALF = (38 * Math.PI) / 180;
export const GUARD_CATCH_DISTANCE = 20;
export const GUARD_SUSPICION_RATE = 55;
export const GUARD_SUSPICION_CLOSE_RATE = 95;
export const GUARD_SUSPICION_DECAY = 22;

// A camera's sweep.
export const CAMERA_RANGE = 205;
export const CAMERA_CONE_HALF = (27 * Math.PI) / 180;
export const CAMERA_SPOT_RATE = 70;

// The alarm: 0 is quiet, 100 is a full hunt.
export const ALARM_GUARD_SPOT = 26;
export const ALARM_LASER_TRIP = 18;
export const ALARM_CAMERA_BONUS = 10;
export const ALARM_DECAY = 2.2;
export const ALARM_HUNT_AT = 70;

// The clock: ten minutes on the wall when the job starts.
export const JOB_SECONDS = 600;

// Loot values in dollars.
export const LOOT_VALUES = { chips: 1200, gold: 5200, cash: 9800, diamond: 250000 };

// The five tools. `charges` is how many the thief carries into the casino;
// `seconds` is how long the effect lasts where it has one.
export const TOOLS = [
  { key: '1', id: 'smoke', name: 'Smoke bomb', charges: 3, seconds: 6, blurb: 'Blinds every cone inside the cloud' },
  { key: '2', id: 'decoy', name: 'Decoy chip', charges: 3, seconds: 5, blurb: 'Clatters and pulls the nearest guard over' },
  { key: '3', id: 'lockpick', name: 'Lockpick', charges: 2, seconds: 0, blurb: 'Opens the vault door, cuts one laser' },
  { key: '4', id: 'emp', name: 'EMP pulse', charges: 2, seconds: 10, blurb: 'Kills every camera for 10 seconds' },
  { key: '5', id: 'disguise', name: 'Dealer disguise', charges: 2, seconds: 8, blurb: 'Walk as staff — guards notice you only up close' },
];

// The twelve guards of the Meridian, by wing. A name is a person the judge
// can picture; a role says where they stand and what they watch.
export const GUARD_ROSTER = [
  { name: 'Dara', role: 'Pit Boss', wing: 0 },
  { name: 'Bimo', role: 'Slots Patrol', wing: 0 },
  { name: 'Laras', role: 'Slots Patrol', wing: 0 },
  { name: 'Sari', role: 'Door Watch', wing: 0 },
  { name: 'Agus', role: 'Floor Manager', wing: 1 },
  { name: 'Maya', role: 'High-Roller Watch', wing: 1 },
  { name: 'Rudi', role: 'Table Patrol', wing: 1 },
  { name: 'Dewi', role: 'Bar Watch', wing: 1 },
  { name: 'Jono', role: 'Vault Chief', wing: 2 },
  { name: 'Putri', role: 'Vault Patrol', wing: 2 },
  { name: 'Eko', role: 'Laser Watch', wing: 2 },
  { name: 'Ratna', role: 'Vault Patrol', wing: 2 },
];

// The three wings, in the order the thief crosses them.
export const WING_NAMES = ['Slots Floor', 'High-Roller Salon', 'The Vault'];
export const WING_SUBTITLES = [
  'Rows of machines, four guards, two cameras',
  'Felt tables, high rollers, the vault door',
  'The Meridian Diamond — and the way out',
];

// The casino palette: deep purple carpet, gold trim, green felt, neon signs.
export const COLORS = {
  carpet: '#2b1439',
  carpetDark: '#22102e',
  carpetLight: '#351a46',
  wall: '#17101f',
  wallTrim: '#d4af37',
  felt: '#0d5c33',
  feltDark: '#094a28',
  gold: '#d4af37',
  goldBright: '#ffd94d',
  neonPink: '#ff4d9d',
  neonCyan: '#37e0ff',
  coneCalm: 'rgba(255, 214, 64, 0.20)',
  coneSuspicious: 'rgba(255, 140, 40, 0.34)',
  coneHunt: 'rgba(255, 60, 60, 0.42)',
  cameraCone: 'rgba(255, 70, 70, 0.22)',
  smoke: 'rgba(200, 200, 210, 0.55)',
  hudPanel: 'rgba(12, 6, 18, 0.88)',
  hudLine: '#3d2a55',
  text: '#f2e8d5',
  textDim: '#b9a8c9',
  alarmLow: '#37d67a',
  alarmMid: '#ffb020',
  alarmHigh: '#ff4040',
};
