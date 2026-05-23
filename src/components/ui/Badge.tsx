import React from 'react';
import { View } from 'react-native';
import { Text } from './Text';
import { palette, radius, space } from '../../../design-tokens';

interface BadgeProps {
  label: string;
  color?: string;
  bg?: string;
}

export function Badge({ label, color, bg }: BadgeProps) {
  return (
    <View
      style={{
        backgroundColor: bg ?? palette.cloud,
        paddingHorizontal: space[2],
        paddingVertical: 4,
        borderRadius: radius.sm,
        alignSelf: 'flex-start',
      }}
    >
      <Text role="badge" color={color ?? palette.meokMid}>
        {label}
      </Text>
    </View>
  );
}
