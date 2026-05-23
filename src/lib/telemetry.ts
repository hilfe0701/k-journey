/**
 * Telemetry wrapper.
 *
 * `track()` itself lives in `./posthog`. This module adds:
 *   - `trackOnce(event, dedupeKey)` — fires at most once per JS session per key.
 *     Used for view-time events like `dday_milestone_view` where a user revisiting
 *     a screen shouldn't refire the event.
 *
 * Why a wrapper module? It lets us add safety/rate-limiting concerns without
 * touching `posthog.ts` (the PostHog SDK init + KJEvent union). See ADR-0004.
 */

import { track, type KJEvent } from './posthog';

/** PostHog event property values must be primitive-leaved. */
export type TelemetryProps = Record<string, string | number | boolean | null | undefined>;

const sessionFired = new Set<string>();

/**
 * Fire `event` only the first time `dedupeKey` is seen in the current JS session.
 * Note: a JS session is per app launch — MMKV-level dedupe (across cold starts) is
 * a different concern, handled by `claimPanelUnlock` for the panel-unlock case.
 */
export function trackOnce(event: KJEvent, dedupeKey: string, properties?: TelemetryProps) {
  const key = `${event}::${dedupeKey}`;
  if (sessionFired.has(key)) return;
  sessionFired.add(key);
  track(event, properties);
}

/** Test helper — clear the session-fired set. Not for production. */
export function _resetTelemetryForTesting() {
  sessionFired.clear();
}

export { track } from './posthog';
