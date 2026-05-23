import { storage, KEYS } from '../lib/storage';
import { kstDifferenceInDays, kstNow, toKstStartOfDay } from '../lib/dates';

export type Phase = 1 | 2 | 3 | 4;

export interface PhaseInputs {
  arrivalDate: string | null;
  departureDate: string | null;
  today?: Date;
}

/**
 * Date-based phase calculator (per PRD §5).
 *
 *   today < arrivalDate          → 1 (pre-arrival)
 *   arrivalDate..arrival+7d      → 2 (first week)
 *   arrival+8d..departure-21d    → 3 (living)
 *   departure-20d..departure     → 4 (pre-departure)
 *
 * Anchored to KST (ADR-0022) regardless of device locale.
 * Manual override is stored in MMKV under `phase:override`. When set, it wins
 * until the user clears it. Used to preview adjacent phases.
 */
export function calcPhase({ arrivalDate, departureDate, today }: PhaseInputs): Phase {
  const override = storage.getNumber(KEYS.phaseOverride);
  if (override === 1 || override === 2 || override === 3 || override === 4) {
    return override;
  }

  if (!arrivalDate || !departureDate) return 1;

  const now = toKstStartOfDay(today ?? kstNow());
  const arrival = toKstStartOfDay(arrivalDate);
  const departure = toKstStartOfDay(departureDate);

  if (now < arrival) return 1;
  if (kstDifferenceInDays(now, arrival) <= 7) return 2;
  if (kstDifferenceInDays(departure, now) <= 20) return 4;
  return 3;
}

export function setPhaseOverride(phase: Phase | null) {
  if (phase === null) {
    storage.delete(KEYS.phaseOverride);
  } else {
    storage.set(KEYS.phaseOverride, phase);
  }
}

export function getPhaseOverride(): Phase | null {
  const value = storage.getNumber(KEYS.phaseOverride);
  if (value === 1 || value === 2 || value === 3 || value === 4) return value;
  return null;
}

export function dDay(departureDate: string | null, today?: Date): number | null {
  if (!departureDate) return null;
  const now = toKstStartOfDay(today ?? kstNow());
  const departure = toKstStartOfDay(departureDate);
  return kstDifferenceInDays(departure, now);
}

/**
 * D-Day display strings per PRD §10.2:
 *   > 0   → "D-30" / "until departure"
 *   === 0 → "Today" / "your departure day"
 *   < 0   → "D+5"  / "Departed 5 days ago"  (negative D-Day; phase 4 retained)
 *   null  → "—"    (no departure date set)
 * `a11y` is the spoken D-Day phrase; the caller prepends phase + mission counts.
 */
export function dDayLabel(daysLeft: number | null): { big: string; sub: string; a11y: string } {
  if (daysLeft === null) {
    return { big: '—', sub: 'Set your departure date in Profile.', a11y: 'Set your departure date to see D-Day' };
  }
  if (daysLeft > 0) {
    return { big: `D-${daysLeft}`, sub: 'until departure', a11y: `D-Day ${daysLeft} until departure` };
  }
  if (daysLeft === 0) {
    return { big: 'Today', sub: 'your departure day', a11y: 'Departure is today' };
  }
  const n = Math.abs(daysLeft);
  const ago = `Departed ${n} ${n === 1 ? 'day' : 'days'} ago`;
  return { big: `D+${n}`, sub: ago, a11y: ago };
}
