import React from 'react';
import { View } from 'react-native';
import { palette, radius } from '../../../design-tokens';

interface ProgressBarProps {
  value: number; // 0..1
  height?: number;
  color?: string;
  bg?: string;
  accessibilityLabel?: string;
}

/**
 * Fill defaults to ink, not Rausch. Rausch is a single voltage reserved for
 * CTAs and the save state — spending it on every progress track would dilute it.
 */
export function ProgressBar({
  value,
  height = 4,
  color,
  bg,
  accessibilityLabel = 'Progress',
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(1, value));
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      style={{
        height,
        borderRadius: radius.full,
        backgroundColor: bg ?? palette.hairlineSoft,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          height: '100%',
          width: `${clamped * 100}%`,
          backgroundColor: color ?? palette.ink,
          borderRadius: radius.full,
        }}
      />
    </View>
  );
}
