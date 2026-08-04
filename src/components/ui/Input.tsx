import React, { forwardRef, useState } from 'react';
import { TextInput, TextInputProps, TextStyle, View } from 'react-native';
import { Text } from './Text';
import { palette, radius, space, semantic, typography } from '../../../design-tokens';
import { a11yState } from '../../lib/a11y';

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  label?: string;
  placeholder?: string;
  autoFocus?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: TextInputProps['keyboardType'];
  accessibilityLabel?: string;
  accessibilityHint?: string;
  /** Inline validation message, rendered beneath the field. */
  error?: string;
}

/**
 * Airbnb's text field: 56px tall, 8px radius, a 1px hairline outline over
 * white, with the label stacked above in muted caption type. On focus the
 * border thickens to 2px and flips to ink — no glow, no focus ring.
 */
export const Input = forwardRef<TextInput, InputProps>(function Input(
  {
    value,
    onChangeText,
    label,
    placeholder,
    autoFocus,
    autoCapitalize = 'words',
    keyboardType,
    accessibilityLabel,
    accessibilityHint,
    error,
  },
  ref,
) {
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? palette.error
    : focused
      ? semantic.border.focus
      : semantic.border.hairline;

  return (
    <View style={{ gap: space[2] }}>
      {label ? (
        <Text role="caption" color={semantic.fg.secondary}>
          {label}
        </Text>
      ) : null}
      <TextInput
        ref={ref}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize={autoCapitalize}
        autoFocus={autoFocus}
        keyboardType={keyboardType}
        placeholder={placeholder}
        placeholderTextColor={semantic.fg.secondary}
        accessibilityRole="text"
        accessibilityLabel={accessibilityLabel ?? label ?? placeholder}
        accessibilityHint={accessibilityHint}
        {...a11yState({ disabled: false })}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          height: 56,
          paddingHorizontal: space[4],
          borderRadius: radius.sm,
          borderWidth: focused || error ? 2 : 1,
          borderColor,
          backgroundColor: semantic.bg.primary,
          color: semantic.fg.primary,
          fontFamily: typography.family.ui,
          fontSize: typography.size.body,
          fontWeight: typography.weight.regular as TextStyle['fontWeight'],
        }}
      />
      {error ? (
        <Text role="captionSm" color={palette.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
});
