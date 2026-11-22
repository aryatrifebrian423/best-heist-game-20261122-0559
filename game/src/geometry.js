// Meridian Casino — the flat geometry the whole game stands on.
//
// Points, angles, circles against rectangles, and the one question the
// stealth lives or dies on: can this guard see that thief, or does a wall,
// a row of slot machines or a smoke cloud stand between them? Every
// function here is pure — same inputs, same answer — so the game stays
// deterministic.

/** Distance between two points. */
export function dist(ax, ay, bx, by) {
  return Math.hypot(bx - ax, by - ay);
}

/** The smallest absolute difference between two angles, in radians. */
export function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return Math.abs(d);
}

/** Whether a point lies inside a rectangle (edges count). */
export function pointInRect(x, y, r) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

/** Whether a point lies inside a circle. */
export function pointInCircle(x, y, cx, cy, radius) {
  return (x - cx) * (x - cx) + (y - cy) * (y - cy) <= radius * radius;
}

/**
 * Push a circle out of a rectangle it overlaps. Returns the corrected
 * centre; the circle's radius never enters the rectangle.
 */
export function resolveCircleRect(cx, cy, radius, r) {
  const nx = Math.max(r.x, Math.min(cx, r.x + r.w));
  const ny = Math.max(r.y, Math.min(cy, r.y + r.h));
  const dx = cx - nx;
  const dy = cy - ny;
  const d2 = dx * dx + dy * dy;
  if (d2 >= radius * radius) return { x: cx, y: cy };
  if (d2 === 0) {
    // The centre is inside the rectangle: push it out along the shortest side.
    const left = cx - r.x;
    const right = r.x + r.w - cx;
    const top = cy - r.y;
    const bottom = r.y + r.h - cy;
    const m = Math.min(left, right, top, bottom);
    if (m === left) return { x: r.x - radius, y: cy };
    if (m === right) return { x: r.x + r.w + radius, y: cy };
    if (m === top) return { x: cx, y: r.y - radius };
    return { x: cx, y: r.y + r.h + radius };
  }
  const d = Math.sqrt(d2);
  const push = (radius - d) / d;
  return { x: cx + dx * push, y: cy + dy * push };
}

/** Whether two segments intersect (touching counts). */
export function segmentsCross(ax, ay, bx, by, cx, cy, dx, dy) {
  const d1 = (dx - cx) * (ay - cy) - (dy - cy) * (ax - cx);
  const d2 = (dx - cx) * (by - cy) - (dy - cy) * (bx - cx);
  const d3 = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
  const d4 = (bx - ax) * (dy - ay) - (by - ay) * (dx - ax);
  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) return true;
  return false;
}

/** Whether a segment crosses a rectangle (a point inside counts too). */
export function segmentHitsRect(x1, y1, x2, y2, r) {
  if (pointInRect(x1, y1, r) || pointInRect(x2, y2, r)) return true;
  if (segmentsCross(x1, y1, x2, y2, r.x, r.y, r.x + r.w, r.y)) return true;
  if (segmentsCross(x1, y1, x2, y2, r.x + r.w, r.y, r.x + r.w, r.y + r.h)) return true;
  if (segmentsCross(x1, y1, x2, y2, r.x + r.w, r.y + r.h, r.x, r.y + r.h)) return true;
  if (segmentsCross(x1, y1, x2, y2, r.x, r.y + r.h, r.x, r.y)) return true;
  return false;
}

/**
 * Whether the line of sight between two points is blocked by any rectangle
 * in `solids` — walls, machines, tables, pillars. A clear line is a guard's
 * whole world.
 */
export function lineBlocked(x1, y1, x2, y2, solids) {
  for (const r of solids) {
    if (segmentHitsRect(x1, y1, x2, y2, r)) return true;
  }
  return false;
}

/**
 * Whether a target point sits inside a watcher's vision cone: within range,
 * within the half-angle of where the watcher faces, and with a clear line.
 */
export function inVisionCone(wx, wy, facing, range, halfAngle, tx, ty, solids) {
  const d = dist(wx, wy, tx, ty);
  if (d > range) return false;
  if (d < 12) return !lineBlocked(wx, wy, tx, ty, solids);
  const want = Math.atan2(ty - wy, tx - wx);
  if (angleDiff(facing, want) > halfAngle) return false;
  return !lineBlocked(wx, wy, tx, ty, solids);
}

/** Clamp a value into [min, max]. */
export function clamp(v, min, max) {
  return v < min ? min : v > max ? max : v;
}

/** Linear interpolation between a and b. */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}
