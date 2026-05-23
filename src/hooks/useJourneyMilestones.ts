import { useEffect } from 'react';
import { dDay, Phase } from './usePhase';
import { storage, KEYS, getJson, setJson } from '../lib/storage';
import { track } from '../lib/posthog';

const DDAY_MILESTONES = [30, 14, 7] as const;

/**
 * Watches for date-driven journey events and fires the matching analytics
 * exactly once per occurrence:
 *
 *   - phase_transition: when the *naturally computed* phase differs from the
 *     last-seen value persisted in MMKV.
 *   - dday_milestone_view: when daysLeft hits 30 / 14 / 7 (each fires once).
 *
 * `computedPhase` is the date-based phase, NOT the (manual override) phase
 * the user is currently viewing — overrides have their own analytics.
 */
export function useJourneyMilestones(opts: {
  computedPhase: Phase;
  departureDate: string | null;
}) {
  const { computedPhase, departureDate } = opts;

  // Phase transitions
  useEffect(() => {
    const last = storage.getNumber(KEYS.lastSeenPhase);
    if (last !== computedPhase) {
      if (last === 1 || last === 2 || last === 3 || last === 4) {
        track('phase_transition', { from: last, to: computedPhase });
      }
      storage.set(KEYS.lastSeenPhase, computedPhase);
    }
  }, [computedPhase]);

  // D-Day milestone views
  useEffect(() => {
    if (!departureDate) return;
    const days = dDay(departureDate);
    if (days === null) return;
    const fired = getJson<number[]>(KEYS.lastFiredDDayMilestones) ?? [];
    for (const milestone of DDAY_MILESTONES) {
      if (days <= milestone && !fired.includes(milestone)) {
        track('dday_milestone_view', { milestone, daysLeft: days });
        fired.push(milestone);
      }
    }
    if (fired.length > 0) setJson(KEYS.lastFiredDDayMilestones, fired);
  }, [departureDate]);
}
