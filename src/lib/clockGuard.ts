/**
 * Clock-skew detector for a single JavaScript runtime.
 *
 * A wall-clock gap between separate launches is normal and cannot prove clock
 * manipulation. Instead, compare wall-clock elapsed time with monotonic elapsed
 * time while this runtime is continuously in the foreground. React Native's
 * monotonic source is not guaranteed to include device suspend time, so callers
 * must discard the baseline whenever AppState leaves `active`.
 */

import { track } from './posthog';

const SKEW_THRESHOLD_MS = 2 * 24 * 60 * 60 * 1000;

interface ClockSample {
  wallNowMs: number;
  monotonicNowMs: number;
}

let lastSample: ClockSample | null = null;

export interface SkewDetection {
  detected: boolean;
  deltaMs: number;
  expectedBootIso: string | null;
  actualBootIso: string;
}

function currentMonotonicMs(): number | null {
  return typeof performance !== 'undefined' && typeof performance.now === 'function'
    ? performance.now()
    : null;
}

export function checkClockSkew(overrides: Partial<ClockSample> = {}): SkewDetection {
  const wallNowMs = overrides.wallNowMs ?? Date.now();
  const monotonicNowMs = overrides.monotonicNowMs ?? currentMonotonicMs();
  const actualBootIso = new Date(wallNowMs).toISOString();
  if (monotonicNowMs === null) {
    lastSample = null;
    return { detected: false, deltaMs: 0, expectedBootIso: null, actualBootIso };
  }
  const sample: ClockSample = {
    wallNowMs,
    monotonicNowMs,
  };

  if (!lastSample || sample.monotonicNowMs < lastSample.monotonicNowMs) {
    lastSample = sample;
    return { detected: false, deltaMs: 0, expectedBootIso: null, actualBootIso };
  }

  const expectedWallMs =
    lastSample.wallNowMs + (sample.monotonicNowMs - lastSample.monotonicNowMs);
  const deltaMs = sample.wallNowMs - expectedWallMs;
  const expectedBootIso = new Date(expectedWallMs).toISOString();
  lastSample = sample;

  if (Math.abs(deltaMs) > SKEW_THRESHOLD_MS) {
    try {
      (track as unknown as (event: string, properties: object) => void)('clock_skew_detected', {
        deltaDays: Math.round(deltaMs / (24 * 60 * 60 * 1000)),
      });
    } catch {
      // Telemetry is optional and must never break foreground recovery.
    }
    return { detected: true, deltaMs, expectedBootIso, actualBootIso };
  }

  return { detected: false, deltaMs, expectedBootIso, actualBootIso };
}

/** Discard comparisons across background, inactive, suspend, or runtime boundaries. */
export function resetClockSkewBaseline(): void {
  lastSample = null;
}

/** Test helper — reset the in-memory baseline. */
export function _resetClockGuardForTesting(): void {
  resetClockSkewBaseline();
}
