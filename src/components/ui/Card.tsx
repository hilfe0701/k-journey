import React from 'react';
import { View, ViewStyle, StyleProp, Pressable } from 'react-native';
import { radius, space, palette, semantic, elevation } from '../../../design-tokens';
import { a11yState, type A11yState } from '../../lib/a11y';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  padded?: boolean;
  /** Applies the system's single shadow tier. */
  raised?: boolean;
  /** Drops the 1px hairline. Photo-first cards separate by corner clipping. */
  borderless?: boolean;
  bg?: string;
  style?: StyleProp<ViewStyle>;
  /** Required when `onPress` is set — screen reader label for the tap target. */
  accessibilityLabel?: string;
  accessibilityHint?: string;
  /** Override role (e.g. "radio" for selectable lists). Defaults to "button" when pressable. */
  accessibilityRole?: 'button' | 'link' | 'radio' | 'checkbox' | 'tab';
  accessibilityState?: A11yState;
}

/**
 * Airbnb's card surface: 14px corner clipping over the white canvas, a 1px
 * hairline, and 24px of internal padding. Depth is carried by the rounding and
 * the white-on-white separation, not by stacked shadows — `raised` opts into
 * the one shadow tier the system defines.
 */
export function Card({
  children,
  onPress,
  padded = true,
  raised = false,
  borderless = false,
  bg,
  style,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole,
  accessibilityState,
}: CardProps) {
  const wrapperStyle: ViewStyle = {
    backgroundColor: bg ?? semantic.bg.primary,
    borderRadius: radius.card,
    padding: padded ? space[6] : 0,
    borderWidth: borderless ? 0 : 1,
    borderColor: semantic.border.hairline,
    overflow: 'hidden',
    ...(raised ? elevation.float : {}),
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole={accessibilityRole ?? 'button'}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        {...(accessibilityState ? a11yState(accessibilityState) : null)}
        style={({ pressed }) => [
          wrapperStyle,
          pressed ? { backgroundColor: palette.surfaceSoft } : null,
          style,
        ]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={[wrapperStyle, style]}>{children}</View>;
}
