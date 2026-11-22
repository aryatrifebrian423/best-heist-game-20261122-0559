// Meridian Casino — keyboard and mouse, read the same way every frame.
//
// The game polls this module, never the DOM directly: keys are tracked by
// code, edge presses (a key that went down since the last frame) are
// consumed once, and the mouse position is kept in canvas coordinates for
// the decoy chip's throw. Nothing here depends on timing or on the browser
// beyond the two listeners.

const down = new Set();
const pressed = new Set();
let mouseX = 0;
let mouseY = 0;
let mouseClicked = false;

/** Start listening. Call once, from the bootstrap. */
export function bindInput(canvas) {
  window.addEventListener('keydown', (event) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
      event.preventDefault();
    }
    if (!event.repeat) {
      down.add(event.code);
      pressed.add(event.code);
    }
  });
  window.addEventListener('keyup', (event) => {
    down.delete(event.code);
  });
  window.addEventListener('blur', () => {
    down.clear();
    pressed.clear();
  });
  canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = ((event.clientX - rect.left) / rect.width) * canvas.width;
    mouseY = ((event.clientY - rect.top) / rect.height) * canvas.height;
  });
  canvas.addEventListener('mousedown', (event) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = ((event.clientX - rect.left) / rect.width) * canvas.width;
    mouseY = ((event.clientY - rect.top) / rect.height) * canvas.height;
    mouseClicked = true;
  });
}

/** Whether a key is held right now. */
export function isDown(code) {
  return down.has(code);
}

/**
 * Whether a key was pressed since the last frame — and consume it, so one
 * press fires one action however long the frame takes.
 */
export function wasPressed(code) {
  if (!pressed.has(code)) return false;
  pressed.delete(code);
  return true;
}

/** Clear the edge-press set. Called once per frame, after the game reads it. */
export function endFrameInput() {
  pressed.clear();
  mouseClicked = false;
}

/** Whether the mouse was clicked since the last frame. */
export function wasMouseClicked() {
  return mouseClicked;
}

/** The mouse position in canvas coordinates. */
export function mousePosition() {
  return { x: mouseX, y: mouseY };
}

/** The movement axis from WASD or the arrow keys, normalised. */
export function moveAxis() {
  let x = 0;
  let y = 0;
  if (isDown('KeyA') || isDown('ArrowLeft')) x -= 1;
  if (isDown('KeyD') || isDown('ArrowRight')) x += 1;
  if (isDown('KeyW') || isDown('ArrowUp')) y -= 1;
  if (isDown('KeyS') || isDown('ArrowDown')) y += 1;
  if (x !== 0 && y !== 0) {
    x *= Math.SQRT1_2;
    y *= Math.SQRT1_2;
  }
  return { x, y };
}

/** Whether the thief is trying to sneak (Shift, either side). */
export function isSneaking() {
  return isDown('ShiftLeft') || isDown('ShiftRight');
}
