import React from 'react';
import { Pressable, View, ActivityIndicator, ViewStyle, StyleProp } from 'react-native';
import { Text } from './Text';
import { palette, radius, space, semantic } from '../../../design-tokens';
import { a11yState } from '../../lib/a11y';

/**
 * Airbnb's button set.
 *
 * `primary` is Rausch fill / white label at 48px with an 8px radius — the most
 * common CTA in the system. Press flips the background to the active Rausch and
 * nothing else: the spec is explicit that there is no transform and no shadow
 * change on press, so the earlier scale-down is gone.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'pill';

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

/** Primary CTAs ship at 48px — above WCAG AAA, per the responsive spec. */
const HEIGHT = 48;
const PILL_HEIGHT = 40;

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
  const isPill = variant === 'pill';

  function background(pressed: boolean): string {
    switch (variant) {
      case 'primary':
      case 'pill':
        if (isDisabled) return semantic.cta.bgDisabled;
        return pressed ? semantic.cta.bgPressed : semantic.cta.bg;
      case 'secondary':
        return pressed ? palette.surfaceSoft : palette.canvas;
      default:
        return 'transparent';
    }
  }

  function labelColor(): string {
    switch (variant) {
      case 'primary':
      case 'pill':
        return semantic.cta.text;
      case 'ghost':
        return palette.ink;
      default:
        return palette.ink;
    }
  }

  return (
    <Pressable
      onPress={isDisabled ? undefined : onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      {...a11yState({ disabled: isDisabled, busy: loading })}
      style={({ pressed }) => [
        {
          height: isPill ? PILL_HEIGHT : HEIGHT,
          paddingHorizontal: isPill ? space[5] : space[6],
          borderRadius: isPill ? radius.pill : radius.sm,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          backgroundColor: background(pressed),
          // Secondary is a 1px ink outline over white — not a hairline.
          borderWidth: variant === 'secondary' ? 1 : 0,
          borderColor: isDisabled ? palette.borderStrong : palette.ink,
          // The label carries the disabled signal on outline/text variants;
          // filled variants already have the pale Rausch tint.
          opacity: isDisabled && variant !== 'primary' && !isPill ? 0.5 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || isPill ? semantic.cta.text : palette.ink}
          size="small"
        />
      ) : (
        <>
          {leftIcon ? <View style={{ marginRight: space[2] }}>{leftIcon}</View> : null}
          <Text
            role={isPill ? 'buttonSm' : 'buttonMd'}
            color={labelColor()}
            style={variant === 'ghost' ? { textDecorationLine: 'underline' } : undefined}
          >
            {label}
          </Text>
          {rightIcon ? <View style={{ marginLeft: space[2] }}>{rightIcon}</View> : null}
        </>
      )}
    </Pressable>
  );
}
