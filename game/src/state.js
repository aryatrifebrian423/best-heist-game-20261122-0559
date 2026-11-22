// Meridian Casino — the world: what exists, and what happens each frame.
//
// A world holds three wing states (one per wing, so loot taken and doors
// unlocked stay taken and unlocked when the thief walks back), the thief,
// the guards and cameras of the wing they are standing in, the alarm, the
// loot count, the clock, the tool belt and the event queue. updateWorld
// runs one frame: the timer, the thief, the guards, the cameras, the
// alarm, the particles — then it drains the events those updates raised
// and turns them into score, sound and endings.

import { JOB_SECONDS } from './config.js';
import { updateAlarm, addAlarm, alarmCosts } from './alarm.js';
import { createCamera, updateCamera } from './cameras.js';
import { createGuard, updateGuard } from './guards.js';
import { WINGS, wingSolids } from './levels.js';
import { applyPickup } from './loot.js';
import { spawnAlarmFlash, spawnDiamondSparkle, spawnPickupBurst, spawnSmokePuffs, updateParticles } from './particles.js';
import { createPlayer, updatePlayer } from './player.js';
import { makeRng } from './rng.js';
import { createToolBelt, useTool } from './tools.js';

/** A deep copy of plain level data, so a fresh world never shares state. */
function freshCopy(value) {
  return JSON.parse(JSON.stringify(value));
}

/** Build one wing's live entities from its (copied) level data. */
function buildWingState(wingData) {
  return {
    ...wingData,
    guardEntities: wingData.guards.map((spawn) => createGuard(spawn)),
    cameraEntities: wingData.cameras.map((def) => createCamera(def)),
  };
}

/** A fresh world: the job starts on the Slots Floor, clock at ten minutes. */
export function createWorld(seed) {
  const rng = makeRng(seed);
  const wingStates = WINGS.map((wing) => buildWingState(freshCopy(wing)));
  const world = {
    seed,
    rng,
    time: 0,
    timeLeft: JOB_SECONDS,
    mode: 'title', // title | playing | busted | win
    frozen: false,
    wingIndex: 0,
    wingStates,
    wing: wingStates[0],
    solids: [],
    player: null,
    guards: [],
    cameras: [],
    tools: createToolBelt(),
    smokes: [],
    decoys: [],
    particles: [],
    events: [],
    alarm: 0,
    noise: 0,
    lootValue: 0,
    lootTaken: 0,
    diamondTaken: false,
    cameraSpotAt: 0,
    muted: false,
    bustedBy: null,
    bustedReason: null,
    finalScore: 0,
    winStats: null,
  };
  enterWing(world, 0, null);
  return world;
}

/** Stand in a wing: point the world at its state and place the thief. */
export function enterWing(world, wingIndex, fromDoor) {
  world.wingIndex = wingIndex;
  world.wing = world.wingStates[wingIndex];
  world.solids = wingSolids(world.wing);
  world.guards = world.wing.guardEntities;
  world.cameras = world.wing.cameraEntities;
  world.smokes = [];
  world.decoys = [];
  let start = world.wing.playerStart;
  if (fromDoor) {
    // Come in through the door that leads back where the thief came from.
    const back = world.wing.doors.find((d) => d.to === fromDoor.from);
    if (back) {
      const inside = back.x < 100
        ? { x: back.x + 44, y: back.y + back.h / 2 }
        : { x: back.x - 30, y: back.y + back.h / 2 };
      start = inside;
    }
  }
  world.player = createPlayer(start.x, start.y);
  world.player.disguiseUntil = 0;
}

/** Restart the current wing: fresh guards, fresh loot, same alarm and clock. */
export function resetWing(world) {
  const fresh = buildWingState(freshCopy(WINGS[world.wingIndex]));
  world.wingStates[world.wingIndex] = fresh;
  enterWing(world, world.wingIndex, null);
  world.mode = 'playing';
  world.bustedBy = null;
  world.bustedReason = null;
}

/** One frame of the whole game. */
export function updateWorld(world, dt) {
  if (world.mode !== 'playing' || world.frozen) return;
  world.time += dt;
  world.timeLeft -= dt;
  if (world.timeLeft <= 0) {
    world.timeLeft = 0;
    bustWorld(world, 'The clock hit zero — the crew left without you.');
    return;
  }

  // Tool keys, restart, mute.
  if (world.keyTool) {
    useTool(world.keyTool, world);
    world.keyTool = null;
  }

  // The thief moves first; a door walks them into another wing.
  const doorResult = updatePlayer(world.player, dt, world);
  if (doorResult && doorResult.door) {
    const door = doorResult.door;
    if (door.locked) {
      world.events.push({ type: 'locked-door', x: door.x, y: door.y });
    } else {
      enterWing(world, door.to, { from: world.wingIndex });
    }
  }

  for (const guard of world.guards) updateGuard(guard, dt, world);
  for (const camera of world.cameras) updateCamera(camera, dt, world);
  updateAlarm(world, dt);
  updateParticles(world, dt);

  // Smoke and decoys expire.
  world.smokes = world.smokes.filter((s) => s.until > world.time);
  world.decoys = world.decoys.filter((d) => d.until > world.time);

  // A diamond sparkle drifts up every few frames.
  const diamond = world.wing.loot.find((item) => item.kind === 'diamond' && !item.taken);
  if (diamond && world.time % 0.12 < dt) {
    spawnDiamondSparkle(world, diamond.x, diamond.y, world.rng);
  }

  drainEvents(world);
}

/** Turn this frame's events into score, effects and endings. */
function drainEvents(world) {
  const costs = alarmCosts();
  for (const event of world.events) {
    if (event.type === 'pickup') {
      applyPickup(world, event);
      spawnPickupBurst(world, event.x, event.y, world.rng);
      world.lastSound = 'pickup';
    } else if (event.type === 'spotted') {
      addAlarm(world, costs.guardSpot);
      spawnAlarmFlash(world);
      world.lastSound = 'spot';
    } else if (event.type === 'camera-spot') {
      world.lastSound = 'camera';
    } else if (event.type === 'laser') {
      addAlarm(world, costs.laserTrip);
      spawnAlarmFlash(world);
      world.lastSound = 'laser';
    } else if (event.type === 'hunt') {
      world.lastSound = 'hunt';
    } else if (event.type === 'diamond') {
      world.lastSound = 'diamond';
    } else if (event.type === 'tool') {
      if (event.tool === 'smoke') spawnSmokePuffs(world, event.x, event.y, world.rng);
      world.lastSound = 'tool';
    } else if (event.type === 'locked-door') {
      world.lastSound = 'locked';
    } else if (event.type === 'caught') {
      bustWorld(world, `Caught by ${event.guard} on the floor.`);
      world.bustedBy = event.guard;
    } else if (event.type === 'escaped') {
      winWorld(world);
    }
  }
  world.events.length = 0;
}

/** The job is over: the thief is caught, or the clock ran out. */
function bustWorld(world, reason) {
  if (world.mode !== 'playing') return;
  world.mode = 'busted';
  world.bustedReason = reason;
  world.lastSound = 'busted';
}

/** The getaway: diamond in hand, out the service exit. */
function winWorld(world) {
  if (world.mode !== 'playing') return;
  world.mode = 'win';
  const timeBonus = Math.floor(world.timeLeft) * 15;
  world.finalScore = world.lootValue + timeBonus;
  world.winStats = {
    loot: world.lootValue,
    timeBonus,
    timeLeft: world.timeLeft,
    alarm: Math.round(world.alarm),
  };
  world.lastSound = 'win';
}
