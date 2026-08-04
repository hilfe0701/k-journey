/**
 * Accessibility helpers.
 *
 * Centralises calls into RN's `AccessibilityInfo` so screens can react to
 * user preferences without each one wiring its own listener. Current API:
 *
 *   useReduceMotion(): boolean — true when the OS-level reduce-motion
 *     accessibility setting is enabled. The mission-complete choreography
 *     swaps to a single cross-fade when true. ADR-0025 §Reduce Motion.
 *
 *   useScreenReaderEnabled(): boolean — useful when a control needs to alter
 *     its tap target / focus order when VoiceOver / TalkBack is active.
 *
 *   a11yState({ ... }) — state props for a control, in both dialects.
 */

import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

export interface A11yState {
  selected?: boolean;
  checked?: boolean;
  disabled?: boolean;
  expanded?: boolean;
  busy?: boolean;
}

/**
 * Spread onto any `Pressable`-based control to announce its state.
 *
 * ⚠️ `accessibilityState` **alone is silently dropped on web**. React Native
 * Web reads it in `TouchableWithoutFeedback` only — its `Pressable` never
 * forwards it, so `accessibilityState={{ selected }}` produces no `aria-selected`
 * in the DOM. Verified in Chrome: the Essentials/Culture tabs rendered with
 * `role="tab"` and no selected state at all, while React Navigation's own tab
 * bar (which passes `aria-selected` directly) announced correctly.
 *
 * That silently broke `docs/ACCESSIBILITY.md` → "Essentials/Culture is announced
 * as one mutually exclusive choice with selected state", plus every radio,
 * checkbox, and expandable control in the app.
 *
 * Emitting both keeps native (`accessibilityState`) and web (`aria-*`) correct
 * from one call. Only keys that were actually passed are emitted, so an
 * unspecified state stays absent rather than announcing a wrong `false`.
 */
export function a11yState(state: A11yState) {
  return {
    accessibilityState: state,
    ...(state.selected !== undefined ? { 'aria-selected': state.selected } : null),
    ...(state.checked !== undefined ? { 'aria-checked': state.checked } : null),
    ...(state.disabled !== undefined ? { 'aria-disabled': state.disabled } : null),
    ...(state.expanded !== undefined ? { 'aria-expanded': state.expanded } : null),
    ...(state.busy !== undefined ? { 'aria-busy': state.busy } : null),
  } as const;
}

export function useReduceMotion(): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (mounted) setEnabled(value);
    });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (value) => {
      if (mounted) setEnabled(value);
    });
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  return enabled;
}

export function useScreenReaderEnabled(): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isScreenReaderEnabled().then((value) => {
      if (mounted) setEnabled(value);
    });
    const sub = AccessibilityInfo.addEventListener('screenReaderChanged', (value) => {
      if (mounted) setEnabled(value);
    });
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  return enabled;
}
