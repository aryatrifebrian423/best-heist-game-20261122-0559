// Meridian Casino — the seeded random source.
//
// Every roll the game makes comes from here, so a run is repeatable from
// its seed: the same seed deals the same patrol jitter, the same sparkle
// drift, the same everything. Nothing in the game calls Math.random() for
// gameplay; the hand-in program never runs the game at all, so the dossier
// is byte-identical on every run.

/** A small, fast seeded generator (mulberry32). */
export function makeRng(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A float in [min, max). */
export function range(rng, min, max) {
  return min + rng() * (max - min);
}

/** An integer in [min, max]. */
export function intRange(rng, min, max) {
  return min + Math.floor(rng() * (max - min + 1));
}

/** One element of an array, picked by the generator. */
export function pick(rng, items) {
  return items[Math.floor(rng() * items.length)];
}

/** A shuffled copy of an array (Fisher-Yates, driven by the generator). */
export function shuffle(rng, items) {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}
