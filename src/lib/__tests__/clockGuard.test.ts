import {
  _resetClockGuardForTesting,
  checkClockSkew,
  resetClockSkewBaseline,
} from '../clockGuard';
import { track } from '../posthog';

jest.mock('../posthog', () => ({ track: jest.fn() }));

const DAY = 24 * 60 * 60 * 1000;

describe('clock guard', () => {
  beforeEach(() => {
    _resetClockGuardForTesting();
    jest.clearAllMocks();
  });

  it('does not treat normal elapsed days as a clock change', () => {
    expect(checkClockSkew({ wallNowMs: 0, monotonicNowMs: 0 }).detected).toBe(false);
    const result = checkClockSkew({ wallNowMs: 7 * DAY, monotonicNowMs: 7 * DAY });
    expect(result.detected).toBe(false);
    expect(result.deltaMs).toBe(0);
    expect(track).not.toHaveBeenCalled();
  });

  it('detects a forward wall-clock jump relative to monotonic time', () => {
    checkClockSkew({ wallNowMs: 10 * DAY, monotonicNowMs: DAY });
    const result = checkClockSkew({ wallNowMs: 14 * DAY, monotonicNowMs: 2 * DAY });
    expect(result.detected).toBe(true);
    expect(result.deltaMs).toBe(3 * DAY);
    expect(track).toHaveBeenCalledWith('clock_skew_detected', { deltaDays: 3 });
  });

  it('detects a backward wall-clock jump relative to monotonic time', () => {
    checkClockSkew({ wallNowMs: 10 * DAY, monotonicNowMs: DAY });
    const result = checkClockSkew({ wallNowMs: 7 * DAY, monotonicNowMs: 2 * DAY });
    expect(result.detected).toBe(true);
    expect(result.deltaMs).toBe(-4 * DAY);
  });

  it('resets safely if the monotonic clock restarts', () => {
    checkClockSkew({ wallNowMs: 10 * DAY, monotonicNowMs: 5 * DAY });
    expect(checkClockSkew({ wallNowMs: 20 * DAY, monotonicNowMs: DAY }).detected).toBe(false);
  });

  it('does not compare samples across an inactive or background boundary', () => {
    checkClockSkew({ wallNowMs: 0, monotonicNowMs: 0 });
    resetClockSkewBaseline();
    const result = checkClockSkew({ wallNowMs: 7 * DAY, monotonicNowMs: DAY });
    expect(result.detected).toBe(false);
    expect(result.expectedBootIso).toBeNull();
  });
});
