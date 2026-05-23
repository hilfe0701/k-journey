import * as Haptics from 'expo-haptics';

/**
 * Best-effort haptic feedback. Per ADR-0030 exactly three moments fire
 * haptics — mission-complete (stage 2, Light), panel unlock (Success),
 * destructive confirm (Warning). All calls swallow failures: haptics are an
 * enhancement, never required for correctness.
 *
 * Reduce Motion downgrade (ADR-0030): callers that can observe
 * `useReduceMotion()` pass it in — mission-complete goes silent, panel-unlock
 * steps down Success → Light. Destructive confirm is a safety signal and is
 * never downgraded.
 *
 * `hapticSelection` is retained only for legacy call sites pending removal
 * per ADR-0030 (selection ticks are not a sanctioned haptic moment).
 */

export function hapticMissionComplete(reduceMotion = false): void {
  // ADR-0030: mission-complete haptic is silenced under Reduce Motion.
  if (reduceMotion) return;
  try {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // intentional swallow: haptics are cosmetic, never required for correctness.
  }
}

export function hapticPanelUnlock(reduceMotion = false): void {
  try {
    // ADR-0030: Reduce Motion steps the panel-unlock haptic down to Light.
    void (reduceMotion
      ? Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      : Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
  } catch {
    // intentional swallow: haptics are cosmetic, never required for correctness.
  }
}

export function hapticSelection(): void {
  try {
    void Haptics.selectionAsync();
  } catch {
    // intentional swallow: haptics are cosmetic, never required for correctness.
  }
}

export function hapticDestructive(): void {
  // ADR-0030: destructive confirm is a safety signal — never downgraded.
  try {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  } catch {
    // intentional swallow: haptics are cosmetic, never required for correctness.
  }
}
