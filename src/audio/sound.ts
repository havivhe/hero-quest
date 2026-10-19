/**
 * Tiny original sound engine built on the Web Audio API.
 * All sounds are synthesized in code – no audio files, no copyrighted music.
 */

export type SfxName = 'tap' | 'correct' | 'wrong' | 'power' | 'denied' | 'levelUp' | 'achievement' | 'tick' | 'finish';

let ctx: AudioContext | null = null;
/** Audio may only start after a user gesture (browser autoplay rules). */
let unlocked = false;
let soundEnabled = true;
let musicEnabled = false;
let musicTimer: number | null = null;
let musicGain: GainNode | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined' || !unlocked) return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    try {
      ctx = new Ctor();
    } catch {
      return null;
    }
  }
  if (ctx.state === 'suspended') void ctx.resume().catch(() => undefined);
  return ctx;
}

function tone(freq: number, start: number, duration: number, type: OscillatorType = 'sine', volume = 0.15, dest?: AudioNode) {
  const ac = getCtx();
  if (!ac) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t0 = ac.currentTime + start;
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(gain).connect(dest ?? ac.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
}

const SFX: Record<SfxName, () => void> = {
  tap: () => tone(660, 0, 0.08, 'triangle', 0.08),
  correct: () => {
    tone(660, 0, 0.12, 'triangle');
    tone(880, 0.1, 0.12, 'triangle');
    tone(1320, 0.2, 0.2, 'triangle');
  },
  wrong: () => {
    tone(330, 0, 0.18, 'sine', 0.12);
    tone(262, 0.15, 0.25, 'sine', 0.1);
  },
  power: () => {
    for (let i = 0; i < 6; i++) tone(400 + i * 120, i * 0.04, 0.1, 'sawtooth', 0.05);
  },
  denied: () => tone(200, 0, 0.2, 'square', 0.06),
  levelUp: () => {
    [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.25, 'triangle', 0.14));
  },
  achievement: () => {
    [784, 988, 1175].forEach((f, i) => tone(f, i * 0.09, 0.2, 'sine', 0.12));
  },
  tick: () => tone(1000, 0, 0.05, 'square', 0.04),
  finish: () => {
    [392, 523, 659, 784].forEach((f, i) => tone(f, i * 0.1, 0.3, 'triangle', 0.12));
  },
};

export function playSfx(name: SfxName) {
  if (!soundEnabled) return;
  try {
    SFX[name]();
  } catch {
    // Audio is optional – never break the game because of it.
  }
}

export function setSoundEnabled(on: boolean) {
  soundEnabled = on;
}

// ---------- Background music: a gentle original looping arpeggio ----------

const MUSIC_PATTERN = [
  [220, 277, 330, 440],
  [196, 247, 294, 392],
  [175, 220, 262, 349],
  [196, 247, 294, 392],
];
const STEP_SEC = 0.28;

function startMusic() {
  const ac = getCtx();
  if (!ac || musicTimer != null) return;
  musicGain = ac.createGain();
  musicGain.gain.value = 0.35;
  musicGain.connect(ac.destination);
  let step = 0;
  const playStep = () => {
    if (!musicGain) return;
    const chord = MUSIC_PATTERN[Math.floor(step / 8) % MUSIC_PATTERN.length];
    const note = chord[step % 4] * (step % 8 >= 4 ? 2 : 1);
    tone(note, 0, STEP_SEC * 0.9, 'triangle', 0.05, musicGain);
    if (step % 8 === 0) tone(chord[0] / 2, 0, STEP_SEC * 7, 'sine', 0.06, musicGain);
    step++;
  };
  playStep();
  musicTimer = window.setInterval(playStep, STEP_SEC * 1000);
}

function stopMusic() {
  if (musicTimer != null) window.clearInterval(musicTimer);
  musicTimer = null;
  if (musicGain) {
    try {
      musicGain.disconnect();
    } catch {
      // ignore
    }
  }
  musicGain = null;
}

export function setMusicEnabled(on: boolean) {
  musicEnabled = on;
  if (on) startMusic();
  else stopMusic();
}

/** Browsers only allow audio after a user gesture; call this on the first tap. */
export function unlockAudio() {
  unlocked = true;
  getCtx();
  if (musicEnabled && musicTimer == null) startMusic();
}

// Pause music when the app is hidden (e.g. phone screen off).
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopMusic();
    else if (musicEnabled && ctx) startMusic();
  });
}
