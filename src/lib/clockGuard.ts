/**
 * Clock skew detector.
 *
 * Records (does NOT block) when the device clock jumps by ±2 days between boots.
 * Server `serverTimestamp()` writes already neutralise the worst outcomes of clock
 * manipulation; this diagnostic exists so we can spot patterns in Crashlytics /
 * PostHog without UI false-positives interrupting legitimate travel.
 *
 * See ADR-0022 §4.3 and docs/I18N_TIMEZONE.md §4.3.
 *
 * Boot path: call `checkClockSkew()` once from `app/_layout.tsx` after
 * `runMigrations()` but before any phase/D-Day calc.
 */

import { kstNow } from './dates';
import { storage } from './storage';
import { track } from './posthog';

const SKEW_THRESHOLD_MS = 2 * 24 * 60 * 60 * 1000; // 2 days
const LAST_BOOT_KEY = 'clock:lastBootIso';

export interface SkewDetection {
  detected: boolean;
  deltaMs: number;
  expectedBootIso: string | null;
  actualBootIso: string;
}

export function checkClockSkew(): SkewDetection {
  const actualNow = kstNow();
  const actualBootIso = actualNow.toISOString();
  const lastSeen = storage.getString(LAST_BOOT_KEY);

  if (!lastSeen) {
    // First boot — nothing to compare against.
    storage.set(LAST_BOOT_KEY, actualBootIso);
    return { detected: false, deltaMs: 0, expectedBootIso: null, actualBootIso };
  }

  const last = new Date(lastSeen);
  const deltaMs = actualNow.getTime() - last.getTime();

  // Negative delta = device clock moved backward. Either direction past threshold counts.
  if (Math.abs(deltaMs) > SKEW_THRESHOLD_MS) {
    // Diagnostic event — not in canonical KJEvent union.
    // Cast through unknown to bypass strict typing; see docs/SECURITY.md and docs/ANALYTICS_SCHEMA.md.
    try {
      (track as unknown as (e: string, p: object) => void)('clock_skew_detected', {
        deltaDays: Math.round(deltaMs / (24 * 60 * 60 * 1000)),
      });
    } catch {
      // intentional swallow: telemetry must never crash the boot path.
    }
    storage.set(LAST_BOOT_KEY, actualBootIso);
    return { detected: true, deltaMs, expectedBootIso: lastSeen, actualBootIso };
  }

  storage.set(LAST_BOOT_KEY, actualBootIso);
  return { detected: false, deltaMs, expectedBootIso: lastSeen, actualBootIso };
}

/** Test helper — reset the recorded last boot. Not for production code. */
export function _resetClockGuardForTesting() {
  storage.delete(LAST_BOOT_KEY);
}

// LAST_BOOT_KEY is intentionally not in KEYS (storage.ts) — it's an internal
// diagnostic, not a feature-bearing key. Migration framework (ADR-0023) does
// not need to version it; corruption simply resets the baseline.
