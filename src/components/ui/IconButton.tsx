import React from 'react';
import { Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

import { palette, radius } from '../../../design-tokens';
import { a11yState } from '../../lib/a11y';

/**
 * The single icon-only control primitive.
 *
 * Two rules it exists to enforce, both from `docs/ACCESSIBILITY.md`:
 *
 * 1. **44×44 as a real box, not as `hitSlop`.** React Native Web silently drops
 *    `hitSlop` — it appears nowhere in RNW's `Pressable`. Every icon control that
 *    relied on `hitSlop={8}` around a 24px glyph therefore measured 24×24 in a
 *    browser. This lays down the size with `minWidth`/`minHeight` so both
 *    platforms agree.
 * 2. **An icon is never a name.** `accessibilityLabel` is required by the type,
 *    so an unnamed icon control cannot compile.
 *
 * Disabled controls keep their label and take `disabledReason`, because
 * "Save/share buttons expose disabled state and reason" — opacity alone says
 * nothing to a screen reader.
 */

/** Minimum interactive box, per WCAG 2.5.5 / `CLAUDE.md` MUST 15. */
export const MIN_TARGET = 44;

export type IconButtonTone = 'default' | 'inverse' | 'accent';

const TONE_COLORS: Record<IconButtonTone, string> = {
  default: palette.meok,
  inverse: palette.hanji,
  accent: palette.dancheong,
};

interface IconButtonProps {
  icon: LucideIcon;
  /** Screen reader name. Required — an icon carries no accessible name. */
  accessibilityLabel: string;
  onPress?: () => void;
  /** Glyph size in px. The 44×44 target stays constant regardless. */
  size?: number;
  tone?: IconButtonTone;
  /** Overrides the tone color for callers that follow template/era color. */
  color?: string;
  /** Draws a filled circular surface behind the glyph. */
  surface?: boolean;
  disabled?: boolean;
  /** Why the control is unavailable. Announced alongside the disabled state. */
  disabledReason?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
}

export function IconButton({
  icon: Icon,
  accessibilityLabel,
  onPress,
  size = 22,
  tone = 'default',
  color,
  surface = false,
  disabled = false,
  disabledReason,
  accessibilityHint,
  style,
}: IconButtonProps) {
  const glyphColor = color ?? TONE_COLORS[tone];

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={disabled ? (disabledReason ?? accessibilityHint) : accessibilityHint}
      {...a11yState({ disabled })}
      style={({ pressed }) => [
        styles.root,
        surface
          ? {
              borderRadius: radius.full,
              backgroundColor: tone === 'inverse' ? palette.meokMid : palette.cloud,
            }
          : null,
        disabled ? styles.disabled : null,
        pressed && !disabled ? styles.pressed : null,
        style,
      ]}
    >
      <Icon size={size} color={glyphColor} strokeWidth={1.6} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    minWidth: MIN_TARGET,
    minHeight: MIN_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  // Opacity is the visual cue only; the reason travels in accessibilityHint.
  disabled: { opacity: 0.4 },
  // Opacity rather than a background tint, so one rule reads correctly on both
  // the hanji surfaces and the dark gallery/overlay headers.
  pressed: { opacity: 0.6 },
});
