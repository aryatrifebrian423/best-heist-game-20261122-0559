// Meridian Casino — the wall cameras and their sweeping red cones.
//
// A camera sits on a wall and sweeps its cone back and forth across its
// arc. It cannot be dodged by standing still: the cone comes to you. When
// the thief crosses a live cone with a clear line, the alarm climbs fast.
// An EMP pulse kills every camera for ten seconds — the one clean answer
// to a room full of glass eyes.

import { CAMERA_CONE_HALF, CAMERA_RANGE } from './config.js';
import { inVisionCone } from './geometry.js';

/** A live camera, built from a mount record in levels.js. */
export function createCamera(def) {
  return {
    x: def.x,
    y: def.y,
    baseAngle: def.angle,
    sweep: def.sweep,
    range: def.range || CAMERA_RANGE,
    angle: def.angle,
    dir: 1,
    disabledUntil: 0,
  };
}

/**
 * One frame of one camera. Sweeps the cone, and while live, watches for
 * the thief. Pushes a throttled 'camera-spot' event into world.events.
 */
export function updateCamera(camera, dt, world) {
  const now = world.time;
  if (camera.disabledUntil > now) return;
  camera.angle += camera.dir * 0.55 * dt;
  if (camera.angle > camera.baseAngle + camera.sweep) {
    camera.angle = camera.baseAngle + camera.sweep;
    camera.dir = -1;
  } else if (camera.angle < camera.baseAngle - camera.sweep) {
    camera.angle = camera.baseAngle - camera.sweep;
    camera.dir = 1;
  }
  const player = world.player;
  const seen = inVisionCone(camera.x, camera.y, camera.angle, camera.range, CAMERA_CONE_HALF, player.x, player.y, world.solids);
  if (seen) {
    world.alarm = Math.min(100, world.alarm + 26 * dt);
    if (!world.cameraSpotAt || now - world.cameraSpotAt > 1.5) {
      world.cameraSpotAt = now;
      world.events.push({ type: 'camera-spot', x: camera.x, y: camera.y });
    }
  }
}

/** Whether this camera is dead right now (EMP). */
export function cameraDisabled(camera, now) {
  return camera.disabledUntil > now;
}
