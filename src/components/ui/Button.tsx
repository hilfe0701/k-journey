import React from 'react';
import { Pressable, View, ActivityIndicator, ViewStyle, StyleProp } from 'react-native';
import { Text } from './Text';
import { palette, radius, space, semantic } from '../../../design-tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Override the auto-derived screen reader label. Defaults to `label`. */
  accessibilityLabel?: string;
  /** Optional secondary clarification ("what will happen if I tap this"). */
  accessibilityHint?: string;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
  accessibilityLabel,
  accessibilityHint,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={isDisabled ? undefined : onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        {
          height: 52,
          paddingHorizontal: space[5],
          borderRadius: radius.md,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          opacity: isDisabled ? 0.5 : 1,
          transform: [{ scale: pressed ? 0.97 : 1 }],
          backgroundColor:
            variant === 'primary'
              ? pressed ? semantic.cta.bgPressed : semantic.cta.bg
              : variant === 'secondary'
                ? pressed ? palette.cloud : semantic.bg.primary
                : 'transparent',
          borderWidth: variant === 'secondary' ? 1 : 0,
          borderColor: semantic.border.hairline,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? semantic.cta.text : semantic.fg.accent}
          size="small"
        />
      ) : (
        <>
          {leftIcon ? <View style={{ marginRight: space[2] }}>{leftIcon}</View> : null}
          <Text
            role="body"
            weight="semibold"
            color={
              variant === 'primary'
                ? semantic.cta.text
                : variant === 'ghost'
                  ? semantic.fg.accent
                  : semantic.fg.primary
            }
          >
            {label}
          </Text>
          {rightIcon ? <View style={{ marginLeft: space[2] }}>{rightIcon}</View> : null}
        </>
      )}
    </Pressable>
  );
}
