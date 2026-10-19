/** Vibration feedback (only on devices that support it, e.g. most Android phones). */

let enabled = true;

export const vibrationSupported = typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';

export function setVibrationEnabled(on: boolean) {
  enabled = on;
}

export function vibrate(pattern: number | readonly number[]) {
  if (!enabled || !vibrationSupported) return;
  try {
    navigator.vibrate(pattern as number | number[]);
  } catch {
    // ignore
  }
}

export const HAPTICS = {
  correct: 40,
  wrong: [60, 50, 60],
  levelUp: [80, 60, 80, 60, 160],
} as const;
