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
 */

import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

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
