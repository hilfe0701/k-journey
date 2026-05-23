import { PUSH_COPY, PUSH_PRIMING } from '../notifications/copy';

const TITLE_LIMIT = 30;
const BODY_LIMIT = 110;
const EMOJI_REGEX = /[\u{1F300}-\u{1FAFF}]/u;
const HANGUL_REGEX = /[\u{AC00}-\u{D7AF}]/u;

const STATIC_ENTRIES = [
  PUSH_COPY.dDay30,
  PUSH_COPY.dDay14,
  PUSH_COPY.dDay7,
  PUSH_COPY.phase2Start,
  PUSH_COPY.phase3Start,
  PUSH_COPY.phase4Start,
] as const;

describe('PUSH_COPY catalog', () => {
  it.each(STATIC_ENTRIES)('title <= %s chars', (entry) => {
    expect(entry.title.length).toBeLessThanOrEqual(TITLE_LIMIT);
  });

  it.each(STATIC_ENTRIES)('body <= %s chars', (entry) => {
    expect(entry.body.length).toBeLessThanOrEqual(BODY_LIMIT);
  });

  it.each(STATIC_ENTRIES)('no emoji', (entry) => {
    expect(EMOJI_REGEX.test(entry.title)).toBe(false);
    expect(EMOJI_REGEX.test(entry.body)).toBe(false);
  });

  it.each(STATIC_ENTRIES)('no Korean characters in body', (entry) => {
    expect(HANGUL_REGEX.test(entry.body)).toBe(false);
  });

  it('panelUnlock template renders with literal numerals', () => {
    expect(PUSH_COPY.panelUnlock(1).title).toBe('Panel 1 of 8 unlocked');
    expect(PUSH_COPY.panelUnlock(8).title).toBe('Panel 8 of 8 unlocked');
  });

  it('panelUnlock body is identical for all panels', () => {
    const body = PUSH_COPY.panelUnlock(1).body;
    for (let n = 2; n <= 8; n++) {
      expect(PUSH_COPY.panelUnlock(n).body).toBe(body);
    }
  });

  it('panelUnlock title <= 30 chars for n=1..8', () => {
    for (let n = 1; n <= 8; n++) {
      expect(PUSH_COPY.panelUnlock(n).title.length).toBeLessThanOrEqual(TITLE_LIMIT);
    }
  });
});

describe('PUSH_PRIMING', () => {
  it('enumerates all 5 milestone slots in the body', () => {
    expect(PUSH_PRIMING.body).toContain('D-30');
    expect(PUSH_PRIMING.body).toContain('D-14');
    expect(PUSH_PRIMING.body).toContain('D-7');
    expect(PUSH_PRIMING.body).toContain('phase');
    expect(PUSH_PRIMING.body).toContain('panel');
  });

  it('closes with the no-daily-reminders promise', () => {
    expect(PUSH_PRIMING.body.toLowerCase()).toContain('no daily reminders');
  });
});
