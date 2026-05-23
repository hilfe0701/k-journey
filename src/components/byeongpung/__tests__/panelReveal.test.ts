/**
 * The byeongpung panel reveal formula is duplicated in three call sites
 * (home strip, byeongpung tab, gallery). It's the brand's hero mechanic, so
 * this test pins down the contract:
 *
 *   reveal(i, totalCompleted) = clamp((totalCompleted - i*6) / 6, 0, 1)
 *
 *   - i = 0..7 (panel index)
 *   - 6 completions per panel
 *   - 48 total to fill all 8
 */

function panelReveal(i: number, totalCompleted: number): number {
  return Math.max(0, Math.min(1, (totalCompleted - i * 6) / 6));
}

describe('panelReveal', () => {
  it('reveals nothing at 0 completions', () => {
    for (let i = 0; i < 8; i++) {
      expect(panelReveal(i, 0)).toBe(0);
    }
  });

  it('panel 0 is fully revealed at 6 completions', () => {
    expect(panelReveal(0, 6)).toBe(1);
  });

  it('panel 0 partial at 3 completions', () => {
    expect(panelReveal(0, 3)).toBe(0.5);
  });

  it('panel 1 starts revealing only after panel 0 completes', () => {
    expect(panelReveal(1, 5)).toBe(0);
    expect(panelReveal(1, 6)).toBe(0);
    expect(panelReveal(1, 9)).toBe(0.5);
    expect(panelReveal(1, 12)).toBe(1);
  });

  it('all 8 panels fully reveal at 48 completions', () => {
    for (let i = 0; i < 8; i++) {
      expect(panelReveal(i, 48)).toBe(1);
    }
  });

  it('clamps reveal between 0 and 1', () => {
    expect(panelReveal(0, 100)).toBe(1);
    expect(panelReveal(7, 0)).toBe(0);
  });

  it('panel 7 (last) reveals over completions 42-48', () => {
    expect(panelReveal(7, 41)).toBe(0);
    expect(panelReveal(7, 42)).toBe(0);
    expect(panelReveal(7, 45)).toBe(0.5);
    expect(panelReveal(7, 48)).toBe(1);
  });
});
