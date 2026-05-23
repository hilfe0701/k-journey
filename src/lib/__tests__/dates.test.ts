import { kstDifferenceInDays, kstNow, scheduleAtKstMorning, toKstStartOfDay } from '../dates';

describe('KST helpers', () => {
  describe('kstNow', () => {
    it('returns a Date object close to current time', () => {
      const now = kstNow();
      const real = new Date();
      expect(now).toBeInstanceOf(Date);
      // Within 1s of "real" UTC time, since toZonedTime returns a Date whose
      // getTime() in epoch ms matches the source instant.
      expect(Math.abs(now.getTime() - real.getTime())).toBeLessThan(1000);
    });
  });

  describe('toKstStartOfDay', () => {
    it('snaps an ISO date string to 00:00 of that calendar day in KST', () => {
      const midnight = toKstStartOfDay('2026-04-01');
      expect(midnight.getHours()).toBe(0);
      expect(midnight.getMinutes()).toBe(0);
      expect(midnight.getSeconds()).toBe(0);
    });

    it('idempotent over Date input', () => {
      const a = toKstStartOfDay('2026-04-15');
      const b = toKstStartOfDay(a);
      expect(a.getTime()).toBe(b.getTime());
    });
  });

  describe('kstDifferenceInDays', () => {
    it('returns 0 for the same calendar day', () => {
      const d = toKstStartOfDay('2026-05-13');
      expect(kstDifferenceInDays(d, d)).toBe(0);
    });

    it('returns positive when later > earlier', () => {
      const earlier = toKstStartOfDay('2026-04-01');
      const later = toKstStartOfDay('2026-04-10');
      expect(kstDifferenceInDays(later, earlier)).toBe(9);
    });

    it('returns negative when later < earlier (post-departure)', () => {
      const earlier = toKstStartOfDay('2026-04-10');
      const later = toKstStartOfDay('2026-04-05');
      expect(kstDifferenceInDays(later, earlier)).toBe(-5);
    });

    it('handles cross-month boundaries', () => {
      const a = toKstStartOfDay('2026-03-30');
      const b = toKstStartOfDay('2026-04-02');
      expect(kstDifferenceInDays(b, a)).toBe(3);
    });
  });

  describe('scheduleAtKstMorning', () => {
    it('returns a Date for the morning of N days before target', () => {
      const target = '2026-08-01';
      const d30 = scheduleAtKstMorning(target, 30);
      const d14 = scheduleAtKstMorning(target, 14);
      const d7 = scheduleAtKstMorning(target, 7);
      // D-30 is earlier than D-14 which is earlier than D-7.
      expect(d30.getTime()).toBeLessThan(d14.getTime());
      expect(d14.getTime()).toBeLessThan(d7.getTime());
    });

    it('uses 09:00 morning, not midnight', () => {
      const target = '2026-08-01';
      const d7 = scheduleAtKstMorning(target, 7);
      const d7Mid = toKstStartOfDay('2026-07-25');
      // The scheduled time should be 9 hours after KST midnight of D-7.
      expect(d7.getTime()).toBe(d7Mid.getTime() + 9 * 60 * 60 * 1000);
    });
  });
});
