/**
 * Push permission lifecycle watcher.
 *
 * iOS / Android expose `granted | denied | undetermined` but the OS does not
 * notify the app when the user toggles the permission in Settings. K-Journey
 * needs to:
 *   - detect denied → granted (so we reschedule the D-30/14/7 milestones)
 *   - detect granted → denied (so we stop trying to schedule notifications)
 *   - reconcile at cold start (a change made while the app was killed)
 *
 * Strategy: re-check `getPermissionState()` on every app foreground via an
 * AppState listener, plus once immediately on setup (cold-start sync). The
 * state is tracked in MMKV to detect transitions across foreground events.
 *
 * See PRD §7.5, ADR-0015.
 */

import { useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { storage } from './storage';
import { getPermissionState, rescheduleAllNotifications, type PermissionState } from './notifications';
import { posthog } from './posthog';

const LAST_PERMISSION_STATE_KEY = 'push:lastPermissionState';

export interface WatcherInput {
  /** ISO date or null — null disables rescheduling (no arrival yet). */
  arrivalDate: string | null;
  departureDate: string | null;
}

/**
 * Mounts an AppState listener that, on each foreground transition (and once
 * immediately for cold-start sync), re-evaluates push permission. On a newly
 * granted permission it reschedules notifications; every transition is logged
 * as a diagnostic. Returns a cleanup function for use in `useEffect`.
 */
export function watchPermissionTransitions(input: WatcherInput) {
  const handler = async (state: AppStateStatus) => {
    if (state !== 'active') return;
    const next = await getPermissionState();
    const prev = (storage.getString(LAST_PERMISSION_STATE_KEY) as PermissionState | undefined) ?? 'undetermined';
    storage.set(LAST_PERMISSION_STATE_KEY, next);

    if (prev === next) return;

    // Diagnostic — push permission lifecycle (ANALYTICS_SCHEMA §2.7).
    try {
      posthog.capture('push_permission_state', { state: next });
    } catch {
      // intentional swallow: diagnostics must never break the watcher.
    }

    // Newly granted → reschedule outstanding milestones. A granted → denied
    // transition needs no action: getPermissionState() now reports `denied`,
    // which on its own suppresses any further priming/prompt (§7.5 row 5).
    // rescheduleAllNotifications records its own failures and never throws.
    if (next === 'granted' && input.arrivalDate && input.departureDate) {
      await rescheduleAllNotifications({
        arrivalDate: input.arrivalDate,
        departureDate: input.departureDate,
      });
    }
  };

  // Cold-start sync (§7.5 row 6): reconcile now so a permission change made
  // while the app was killed is picked up immediately, not on the next
  // background → foreground cycle.
  void handler('active');

  const sub = AppState.addEventListener('change', handler);
  return () => sub.remove();
}

/** React hook wrapper — re-subscribes when the journey dates change. */
export function usePushPermissionWatcher({ arrivalDate, departureDate }: WatcherInput) {
  useEffect(() => {
    return watchPermissionTransitions({ arrivalDate, departureDate });
  }, [arrivalDate, departureDate]);
}
