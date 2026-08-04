/**
 * Guards `a11yState`, the fix for a defect that was invisible from the code:
 * React Native Web's `Pressable` ignores `accessibilityState` entirely (it is
 * read only by `TouchableWithoutFeedback`), so every selected/checked/expanded
 * state in the app was dropped on the web build. Confirmed in Chrome before the
 * fix — the Essentials/Culture tabs rendered `role="tab"` with no
 * `aria-selected`, contradicting `docs/ACCESSIBILITY.md`.
 *
 * These assert the *contract*: both dialects, and nothing invented.
 */

import { a11yState } from '../a11y';

describe('a11yState', () => {
  it('emits the native dialect unchanged', () => {
    expect(a11yState({ selected: true }).accessibilityState).toEqual({ selected: true });
  });

  it('emits the web dialect alongside it — the whole point of the helper', () => {
    expect(a11yState({ selected: true })).toMatchObject({ 'aria-selected': true });
    expect(a11yState({ checked: false })).toMatchObject({ 'aria-checked': false });
    expect(a11yState({ disabled: true })).toMatchObject({ 'aria-disabled': true });
    expect(a11yState({ expanded: false })).toMatchObject({ 'aria-expanded': false });
    expect(a11yState({ busy: true })).toMatchObject({ 'aria-busy': true });
  });

  it('carries `false` through rather than dropping it', () => {
    // An unselected tab must announce "not selected", not stay silent.
    const props = a11yState({ selected: false });
    expect(props['aria-selected']).toBe(false);
    expect('aria-selected' in props).toBe(true);
  });

  it('omits keys that were never passed', () => {
    // Emitting `aria-checked=false` on a control that has no checked state
    // would announce a state the control does not have.
    const props = a11yState({ selected: true });
    expect('aria-checked' in props).toBe(false);
    expect('aria-disabled' in props).toBe(false);
    expect('aria-expanded' in props).toBe(false);
    expect('aria-busy' in props).toBe(false);
  });

  it('handles the combined states real controls use', () => {
    expect(a11yState({ checked: true, disabled: false })).toEqual({
      accessibilityState: { checked: true, disabled: false },
      'aria-checked': true,
      'aria-disabled': false,
    });
  });

  it('emits nothing but the empty native state for an empty input', () => {
    expect(a11yState({})).toEqual({ accessibilityState: {} });
  });
});
