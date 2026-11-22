// Meridian Casino — the sound: small synthesized blips, no audio files.
//
// Every sound is an oscillator through a gain envelope, built at the
// moment it plays: a pickup chime, a spot sting, a laser zap, the hunt
// alarm, the diamond arpeggio, the win run. Audio starts only after the
// first key or click (browsers demand a gesture), and M mutes everything.

let audioContext = null;
let muted = false;

/** Build the audio context on the first user gesture. */
export function ensureAudio() {
  if (audioContext) return;
  try {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (Ctor) audioContext = new Ctor();
  } catch {
    audioContext = null;
  }
}

/** Mute or unmute all game sound. */
export function setMuted(value) {
  muted = value;
}

/** One note: an oscillator with a quick attack and a short decay. */
function note(frequency, startAt, duration, type, volume) {
  if (!audioContext || muted) return;
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(0, audioContext.currentTime + startAt);
  gain.gain.linearRampToValueAtTime(volume, audioContext.currentTime + startAt + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + startAt + duration);
  osc.connect(gain);
  gain.connect(audioContext.destination);
  osc.start(audioContext.currentTime + startAt);
  osc.stop(audioContext.currentTime + startAt + duration + 0.05);
}

/** Play a named game sound. Unknown names are silent. */
export function playSound(name) {
  if (!audioContext || muted) return;
  if (audioContext.state === 'suspended') audioContext.resume();
  if (name === 'pickup') {
    note(880, 0, 0.12, 'sine', 0.16);
    note(1318, 0.07, 0.14, 'sine', 0.14);
  } else if (name === 'spot') {
    note(220, 0, 0.18, 'sawtooth', 0.14);
    note(165, 0.1, 0.22, 'sawtooth', 0.14);
  } else if (name === 'camera') {
    note(1200, 0, 0.08, 'square', 0.08);
  } else if (name === 'laser') {
    note(1400, 0, 0.1, 'sawtooth', 0.14);
    note(700, 0.06, 0.14, 'sawtooth', 0.12);
  } else if (name === 'hunt') {
    note(196, 0, 0.3, 'sawtooth', 0.16);
    note(196, 0.35, 0.3, 'sawtooth', 0.16);
  } else if (name === 'diamond') {
    note(1046, 0, 0.14, 'sine', 0.16);
    note(1318, 0.1, 0.14, 'sine', 0.16);
    note(1568, 0.2, 0.22, 'sine', 0.16);
  } else if (name === 'tool') {
    note(520, 0, 0.08, 'triangle', 0.14);
  } else if (name === 'locked') {
    note(110, 0, 0.16, 'square', 0.12);
  } else if (name === 'busted') {
    note(392, 0, 0.25, 'sawtooth', 0.16);
    note(311, 0.22, 0.25, 'sawtooth', 0.16);
    note(233, 0.44, 0.4, 'sawtooth', 0.16);
  } else if (name === 'win') {
    note(523, 0, 0.16, 'sine', 0.16);
    note(659, 0.12, 0.16, 'sine', 0.16);
    note(784, 0.24, 0.16, 'sine', 0.16);
    note(1046, 0.36, 0.3, 'sine', 0.16);
  }
}
