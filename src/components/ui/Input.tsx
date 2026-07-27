import React, { forwardRef, useState } from 'react';
import { TextInput, TextInputProps, TextStyle, View } from 'react-native';
import { Text } from './Text';
import { radius, space, semantic, typography } from '../../../design-tokens';

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
}

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
  },
  ref,
) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ gap: space[2] }}>
      {label ? (
        <Text role="sm" color={semantic.fg.secondary}>
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
        placeholderTextColor={semantic.fg.tertiary}
        accessibilityRole="text"
        accessibilityLabel={accessibilityLabel ?? label ?? placeholder}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled: false }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          height: 52,
          paddingHorizontal: space[4],
          borderRadius: radius.md,
          borderWidth: focused ? 2 : 1,
          borderColor: focused ? semantic.border.focus : semantic.border.hairline,
          backgroundColor: semantic.bg.primary,
          color: semantic.fg.primary,
          fontFamily: typography.family.ui,
          fontSize: typography.size.body,
          fontWeight: typography.weight.medium as TextStyle['fontWeight'],
        }}
      />
    </View>
  );
});
