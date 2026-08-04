import React from 'react';
import { View } from 'react-native';
import { Text } from './Text';
import { palette, radius, space, elevation } from '../../../design-tokens';

/**
 * `soft`   — quiet chip on a surface tint. The default.
 * `float`  — Airbnb's "Guest favorite" badge: a white pill that sits over a
 *            photo, carrying the system's one shadow tier for separation.
 * `tag`    — the tiny uppercase "NEW" pill anchored to nav icons.
 */
export type BadgeVariant = 'soft' | 'float' | 'tag';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  color?: string;
  bg?: string;
}

export function Badge({ label, variant = 'soft', color, bg }: BadgeProps) {
  const isTag = variant === 'tag';
  const isFloat = variant === 'float';

  return (
    <View
      style={{
        backgroundColor: bg ?? (isTag ? palette.rausch : isFloat ? palette.canvas : palette.surfaceSoft),
        paddingHorizontal: isTag ? space[1] + 2 : space[2],
        paddingVertical: isTag ? 2 : space[1],
        borderRadius: radius.pill,
        alignSelf: 'flex-start',
        ...(isFloat ? elevation.float : null),
      }}
    >
      <Text
        role={isTag ? 'tag' : 'badge'}
        color={color ?? (isTag ? palette.onPrimary : palette.ink)}
      >
        {label}
      </Text>
    </View>
  );
}
