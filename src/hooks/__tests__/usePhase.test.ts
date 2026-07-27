import { calcPhase, dDay, dDayLabel, setPhaseOverride, getPhaseOverride } from '../usePhase';
import { storage } from '../../lib/storage';

// MMKV is mocked in jest.setup.js to an in-memory map.

describe('calcPhase', () => {
  // REQ-SFR-005 · POL-009 · ONB-07 · HOME-02 · TC-021 · TC-022 · TC-023 · TC-025.
  beforeEach(() => {
    storage.clearAll();
  });

  const arrival = '2026-04-01';
  const departure = '2026-08-01';

  it('returns 1 when no dates are set', () => {
    expect(calcPhase({ arrivalDate: null, departureDate: null })).toBe(1);
  });

  it('returns 1 before arrival', () => {
    const today = new Date('2026-03-15');
    expect(calcPhase({ arrivalDate: arrival, departureDate: departure, today })).toBe(1);
  });

  it('returns 2 on arrival day', () => {
    const today = new Date('2026-04-01');
    expect(calcPhase({ arrivalDate: arrival, departureDate: departure, today })).toBe(2);
  });

  it('returns 2 within first week', () => {
    const today = new Date('2026-04-07');
    expect(calcPhase({ arrivalDate: arrival, departureDate: departure, today })).toBe(2);
  });

  it('returns 3 after first week ends', () => {
    const today = new Date('2026-04-15');
    expect(calcPhase({ arrivalDate: arrival, departureDate: departure, today })).toBe(3);
  });

  it('returns 4 within last 20 days before departure', () => {
    const today = new Date('2026-07-15');
    expect(calcPhase({ arrivalDate: arrival, departureDate: departure, today })).toBe(4);
  });

  it('returns 4 on departure day', () => {
    const today = new Date('2026-08-01');
    expect(calcPhase({ arrivalDate: arrival, departureDate: departure, today })).toBe(4);
  });

  it('manual override wins over date-based calculation', () => {
    setPhaseOverride(4);
    // Pre-arrival dates would normally yield 1
    const today = new Date('2026-03-15');
    expect(calcPhase({ arrivalDate: arrival, departureDate: departure, today })).toBe(4);
  });

  it('override clears with setPhaseOverride(null)', () => {
    setPhaseOverride(2);
    expect(getPhaseOverride()).toBe(2);
    setPhaseOverride(null);
    expect(getPhaseOverride()).toBeNull();
    const today = new Date('2026-03-15');
    expect(calcPhase({ arrivalDate: arrival, departureDate: departure, today })).toBe(1);
  });
});

describe('dDay', () => {
  it('returns null when no departureDate', () => {
    expect(dDay(null)).toBeNull();
  });

  it('returns positive number before departure', () => {
    const today = new Date('2026-05-05');
    expect(dDay('2026-08-01', today)).toBe(88);
  });

  it('returns 0 on departure day', () => {
    const today = new Date('2026-08-01');
    expect(dDay('2026-08-01', today)).toBe(0);
  });

  it('returns negative after departure', () => {
    const today = new Date('2026-08-10');
    expect(dDay('2026-08-01', today)).toBe(-9);
  });
});

describe('dDayLabel (PRD §10.2)', () => {
  it('null → em dash', () => {
    expect(dDayLabel(null).big).toBe('—');
  });
  it('positive → D-n / until departure', () => {
    const l = dDayLabel(30);
    expect(l.big).toBe('D-30');
    expect(l.sub).toBe('until departure');
  });
  it('zero → Today / departure is today', () => {
    const l = dDayLabel(0);
    expect(l.big).toBe('Today');
    expect(l.a11y).toBe('Departure is today');
  });
  it('negative → D+n / Departed n days ago', () => {
    const l = dDayLabel(-5);
    expect(l.big).toBe('D+5');
    expect(l.sub).toBe('Departed 5 days ago');
    expect(l.a11y).toBe('Departed 5 days ago');
  });
  it('negative singular day uses "day"', () => {
    expect(dDayLabel(-1).sub).toBe('Departed 1 day ago');
  });
});
