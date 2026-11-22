// Meridian Casino — the bootstrap: canvas, loop, and the front door.
//
// This is the one file index.html loads. It builds the world from the
// seed in the URL (?seed=7 by default), stages a screenshot scene when
// ?scene= names one, and runs the frame loop: read the keys, step the
// world, draw the world and the HUD, play whatever sound the last frame
// asked for. The title waits for ENTER or a click; R retries a wing after
// a bust, or starts a fresh job after the getaway.

import { VIEW_H, VIEW_W } from './config.js';
import { ensureAudio, playSound, setMuted } from './audio.js';
import { renderHud } from './hud.js';
import { bindInput, endFrameInput, isDown, wasMouseClicked, wasPressed } from './input.js';
import { renderWorld } from './render.js';
import { applyScene } from './scenes.js';
import { createWorld, resetWing, updateWorld } from './state.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const params = new URLSearchParams(window.location.search);
const seed = Number(params.get('seed')) || 7;
const sceneName = params.get('scene');

let world = createWorld(seed);
if (sceneName) {
  applyScene(world, sceneName);
}

bindInput(canvas);

let lastTime = performance.now();

/** Read the frame's keys: start, tools, retry, mute. */
function readFrameKeys() {
  if (world.mode === 'title' && (wasPressed('Enter') || wasPressed('NumpadEnter') || wasMouseClicked())) {
    ensureAudio();
    world.mode = 'playing';
  }
  if (world.mode === 'playing') {
    if (wasPressed('Digit1')) world.keyTool = 'smoke';
    else if (wasPressed('Digit2')) world.keyTool = 'decoy';
    else if (wasPressed('Digit3')) world.keyTool = 'lockpick';
    else if (wasPressed('Digit4')) world.keyTool = 'emp';
    else if (wasPressed('Digit5')) world.keyTool = 'disguise';
  }
  if (wasPressed('KeyM')) {
    world.muted = !world.muted;
    setMuted(world.muted);
  }
  if (wasPressed('KeyR')) {
    if (world.mode === 'busted') {
      resetWing(world);
    } else if (world.mode === 'win') {
      world = createWorld(seed);
    } else if (world.mode === 'playing') {
      resetWing(world);
    }
  }
  if (isDown('Enter') && world.mode === 'title') {
    ensureAudio();
    world.mode = 'playing';
  }
}

/** One animation frame: step, draw, sound, clear the edge presses. */
function frame(now) {
  const dt = Math.min(0.05, Math.max(0, (now - lastTime) / 1000));
  lastTime = now;
  readFrameKeys();
  updateWorld(world, dt);
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);
  renderWorld(ctx, world);
  renderHud(ctx, world);
  if (world.lastSound) {
    playSound(world.lastSound);
    world.lastSound = null;
  }
  endFrameInput();
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);

// For the shot script and the curious: the live world, on the window.
window.MERIDIAN = { world: () => world };
