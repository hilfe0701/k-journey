/**
 * Hiding an inactive tab screen from assistive technology *and* the keyboard.
 *
 * `docs/ACCESSIBILITY.md` → "Inactive tabs are detached or hidden from the
 * accessibility tree" and "Tab order … never enters an inactive screen". The
 * four tab screens satisfied the first half with
 * `aria-hidden` / `accessibilityElementsHidden`, which is what a screen reader
 * reads — but `aria-hidden` has no effect on focus. React Navigation keeps the
 * previous screen mounted, so in a browser every control on it stayed in the
 * tab sequence.
 *
 * Measured in Chrome on the Byeongpung tab: the accessibility tree exposed six
 * controls, and twenty presses of Tab still walked into "Emergency guide",
 * "Essentials journey view", "Culture journey view", and the Journey task list
 * — focus landing inside an `aria-hidden` subtree, which is a conformance
 * failure in its own right (the focused control announces nothing).
 *
 * `inert` is the attribute that removes a subtree from focus, hit-testing, and
 * the accessibility tree together. React Native does not model it and React 18
 * does not forward it as a prop, so it is applied to the host node directly.
 * Off web the hook only returns the RN props, which already behave correctly.
 */

import { useEffect, useRef } from 'react';
import { Platform, type View } from 'react-native';

export interface InactiveScreenProps {
  ref: React.RefObject<View>;
  accessibilityElementsHidden: boolean;
  importantForAccessibility: 'auto' | 'no-hide-descendants';
  'aria-hidden': boolean;
}

/** The React Native half of the contract: what a screen reader reads. */
export function inactiveScreenA11yProps(isFocused: boolean): Omit<InactiveScreenProps, 'ref'> {
  return {
    accessibilityElementsHidden: !isFocused,
    importantForAccessibility: isFocused ? 'auto' : 'no-hide-descendants',
    'aria-hidden': !isFocused,
  };
}

/** The web half: what the keyboard and hit-testing follow. */
export function applyInert(node: unknown, isFocused: boolean): void {
  const element = node as HTMLElement | null;
  if (!element || typeof element.setAttribute !== 'function') return;
  if (isFocused) element.removeAttribute('inert');
  else element.setAttribute('inert', '');
}

/**
 * Spread onto the root `View` of a tab screen.
 *
 * @param isFocused `useIsFocused()` — the screen currently shown in the tab.
 */
export function useInactiveScreen(isFocused: boolean): InactiveScreenProps {
  const ref = useRef<View>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    // On web the RN ref *is* the host element.
    applyInert(ref.current, isFocused);
  }, [isFocused]);

  return { ref, ...inactiveScreenA11yProps(isFocused) };
}
