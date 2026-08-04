/**
 * Guards the second half of "inactive tabs are hidden" in
 * `docs/ACCESSIBILITY.md`. The screens already emitted `aria-hidden`, which is
 * what a screen reader reads — but `aria-hidden` does not remove anything from
 * the tab sequence. Measured in Chrome on the Byeongpung tab: six controls in
 * the accessibility tree, and Tab still walked into the Journey screen behind
 * it, landing focus inside an `aria-hidden` subtree.
 *
 * `inert` is what removes a subtree from focus as well, so both halves are
 * asserted here.
 */

import { applyInert, inactiveScreenA11yProps } from '../inactiveScreen';

function fakeNode() {
  const attributes = new Map<string, string>();
  return {
    attributes,
    setAttribute: (name: string, value: string) => attributes.set(name, value),
    removeAttribute: (name: string) => attributes.delete(name),
  };
}

describe('inactiveScreenA11yProps', () => {
  it('hides an unfocused screen in both dialects', () => {
    expect(inactiveScreenA11yProps(false)).toEqual({
      accessibilityElementsHidden: true,
      importantForAccessibility: 'no-hide-descendants',
      'aria-hidden': true,
    });
  });

  it('exposes the focused screen', () => {
    expect(inactiveScreenA11yProps(true)).toEqual({
      accessibilityElementsHidden: false,
      importantForAccessibility: 'auto',
      'aria-hidden': false,
    });
  });
});

describe('applyInert', () => {
  it('makes an unfocused screen inert so Tab cannot enter it', () => {
    const node = fakeNode();
    applyInert(node, false);
    expect(node.attributes.get('inert')).toBe('');
  });

  it('restores the screen when it regains focus', () => {
    const node = fakeNode();
    applyInert(node, false);
    applyInert(node, true);
    expect(node.attributes.has('inert')).toBe(false);
  });

  it('is a no-op on a native host node, which has no setAttribute', () => {
    expect(() => applyInert({ measure: () => {} }, false)).not.toThrow();
    expect(() => applyInert(null, false)).not.toThrow();
  });
});
