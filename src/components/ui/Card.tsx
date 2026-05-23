import React from 'react';
import { View, ViewStyle, StyleProp, Pressable } from 'react-native';
import { radius, space, semantic, elevation } from '../../../design-tokens';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  padded?: boolean;
  raised?: boolean;
  bg?: string;
  style?: StyleProp<ViewStyle>;
  /** Required when `onPress` is set — screen reader label for the tap target. */
  accessibilityLabel?: string;
  accessibilityHint?: string;
  /** Override role (e.g. "radio" for selectable lists). Defaults to "button" when pressable. */
  accessibilityRole?: 'button' | 'link' | 'radio' | 'checkbox' | 'tab';
  accessibilityState?: { selected?: boolean; disabled?: boolean; checked?: boolean };
}

export function Card({
  children,
  onPress,
  padded = true,
  raised = false,
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
    padding: padded ? space[4] : 0,
    borderWidth: 1,
    borderColor: semantic.border.hairline,
    ...(raised ? elevation.s1 : {}),
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole={accessibilityRole ?? 'button'}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={accessibilityState}
        style={({ pressed }) => [
          wrapperStyle,
          pressed ? { backgroundColor: semantic.bg.tertiary } : null,
          style,
        ]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={[wrapperStyle, style]}>{children}</View>;
}
