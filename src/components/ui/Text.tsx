import React from 'react';
import { Text as RNText, TextProps as RNTextProps, TextStyle } from 'react-native';
import { typography, palette } from '../../../design-tokens';

type TextRole =
  | 'hero'
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'lead'
  | 'body'
  | 'sm'
  | 'xs'
  | 'badge';

interface KJTextProps extends Omit<RNTextProps, 'role'> {
  role?: TextRole;
  color?: string;
  weight?: keyof typeof typography.weight;
  align?: 'auto' | 'left' | 'center' | 'right';
}

const ROLE_STYLES: Record<TextRole, any> = {
  hero: {
    fontFamily: typography.family.display,
    fontSize: typography.size.hero,
    lineHeight: typography.size.hero * typography.lineHeight.tight,
    letterSpacing: typography.letterSpacing.display,
  },
  display: {
    fontFamily: typography.family.display,
    fontSize: typography.size.display,
    lineHeight: typography.size.display * typography.lineHeight.tight,
    letterSpacing: typography.letterSpacing.display,
  },
  h1: {
    fontFamily: typography.family.display,
    fontSize: typography.size.h1,
    lineHeight: typography.size.h1 * typography.lineHeight.snug,
    letterSpacing: typography.letterSpacing.heading,
  },
  h2: {
    fontFamily: typography.family.display,
    fontSize: typography.size.h2,
    lineHeight: typography.size.h2 * typography.lineHeight.snug,
    letterSpacing: typography.letterSpacing.heading,
  },
  h3: {
    fontFamily: typography.family.display,
    fontSize: typography.size.h3,
    lineHeight: typography.size.h3 * typography.lineHeight.snug,
    letterSpacing: typography.letterSpacing.heading,
  },
  h4: {
    fontFamily: typography.family.ui,
    fontSize: typography.size.h4,
    lineHeight: typography.size.h4 * typography.lineHeight.snug,
  },
  lead: {
    fontFamily: typography.family.ui,
    fontSize: typography.size.lead,
    lineHeight: typography.size.lead * typography.lineHeight.relaxed,
  },
  body: {
    fontFamily: typography.family.ui,
    fontSize: typography.size.body,
    lineHeight: typography.size.body * typography.lineHeight.relaxed,
  },
  sm: {
    fontFamily: typography.family.ui,
    fontSize: typography.size.sm,
    lineHeight: typography.size.sm * typography.lineHeight.normal,
  },
  xs: {
    fontFamily: typography.family.ui,
    fontSize: typography.size.xs,
    lineHeight: typography.size.xs * typography.lineHeight.normal,
  },
  badge: {
    fontFamily: typography.family.ui,
    fontSize: typography.size.micro,
    lineHeight: typography.size.micro,
    letterSpacing: typography.letterSpacing.badge,
    textTransform: 'uppercase',
  },
};

const DEFAULT_WEIGHT_BY_ROLE: Record<TextRole, keyof typeof typography.weight> = {
  hero: 'bold',
  display: 'bold',
  h1: 'bold',
  h2: 'bold',
  h3: 'semibold',
  h4: 'semibold',
  lead: 'medium',
  body: 'medium',
  sm: 'medium',
  xs: 'medium',
  badge: 'bold',
};

export function Text({ role = 'body', color, weight, align, style, children, ...rest }: KJTextProps) {
  const baseStyle = ROLE_STYLES[role];
  const finalWeight = typography.weight[weight ?? DEFAULT_WEIGHT_BY_ROLE[role]];
  const finalColor = color ?? palette.meok;

  return (
    <RNText
      {...rest}
      style={[
        baseStyle,
        {
          fontWeight: finalWeight as TextStyle['fontWeight'],
          color: finalColor,
          textAlign: align,
        },
        style,
      ]}
    >
      {children}
    </RNText>
  );
}
