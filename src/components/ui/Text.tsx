import React from 'react';
import { Text as RNText, TextProps as RNTextProps, TextStyle } from 'react-native';
import { typography, palette } from '../../../design-tokens';

/**
 * Airbnb's type hierarchy.
 *
 * Display weights stay modest on purpose — the homepage h1 sits at 28/700 and
 * the listing-detail h1 at 22/500, quieter than a typical SaaS page, because
 * imagery carries the hierarchy. The single loud moment in the whole system is
 * `rating` (64/700): rating numbers are a peak trust signal, so they are the one
 * place the system trusts type alone.
 */
type TextRole =
  // Canonical Airbnb roles
  | 'rating'
  | 'displayXl'
  | 'displayLg'
  | 'displayMd'
  | 'displaySm'
  | 'titleMd'
  | 'titleSm'
  | 'bodyMd'
  | 'bodySm'
  | 'caption'
  | 'captionSm'
  | 'badge'
  | 'micro'
  | 'tag'
  | 'buttonMd'
  | 'buttonSm'
  | 'link'
  | 'navLink'
  // Legacy roles, remapped onto the scale above
  | 'hero'
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'lead'
  | 'body'
  | 'sm'
  | 'xs';

interface KJTextProps extends Omit<RNTextProps, 'role'> {
  role?: TextRole;
  color?: string;
  weight?: keyof typeof typography.weight;
  align?: 'auto' | 'left' | 'center' | 'right';
}

const { size, lineHeight, letterSpacing, family } = typography;

const ROLE_STYLES: Record<TextRole, TextStyle> = {
  rating: {
    fontFamily: family.display,
    fontSize: size.rating,
    lineHeight: size.rating * lineHeight.tight,
    letterSpacing: letterSpacing.rating,
  },
  displayXl: {
    fontFamily: family.display,
    fontSize: size.display,
    lineHeight: size.display * lineHeight.relaxed,
    letterSpacing: letterSpacing.body,
  },
  displayLg: {
    fontFamily: family.display,
    fontSize: size.h2,
    lineHeight: size.h2 * 1.18,
    letterSpacing: letterSpacing.display,
  },
  displayMd: {
    fontFamily: family.display,
    fontSize: size.h3,
    lineHeight: size.h3 * lineHeight.relaxed,
    letterSpacing: letterSpacing.body,
  },
  displaySm: {
    fontFamily: family.display,
    fontSize: size.h4,
    lineHeight: size.h4 * lineHeight.snug,
    letterSpacing: letterSpacing.heading,
  },
  titleMd: {
    fontFamily: family.ui,
    fontSize: size.body,
    lineHeight: size.body * 1.25,
  },
  titleSm: {
    fontFamily: family.ui,
    fontSize: size.body,
    lineHeight: size.body * 1.25,
  },
  bodyMd: {
    fontFamily: family.ui,
    fontSize: size.body,
    lineHeight: size.body * lineHeight.loose,
  },
  bodySm: {
    fontFamily: family.ui,
    fontSize: size.sm,
    lineHeight: size.sm * lineHeight.relaxed,
  },
  caption: {
    fontFamily: family.ui,
    fontSize: size.sm,
    lineHeight: size.sm * lineHeight.normal,
  },
  captionSm: {
    fontFamily: family.ui,
    fontSize: size.xs,
    lineHeight: size.xs * 1.23,
  },
  badge: {
    fontFamily: family.ui,
    fontSize: size.badge,
    lineHeight: size.badge * 1.18,
  },
  micro: {
    fontFamily: family.ui,
    fontSize: size.micro,
    lineHeight: size.micro * 1.33,
  },
  tag: {
    fontFamily: family.ui,
    fontSize: size.tag,
    lineHeight: size.tag * 1.25,
    letterSpacing: letterSpacing.tag,
    textTransform: 'uppercase',
  },
  buttonMd: {
    fontFamily: family.ui,
    fontSize: size.body,
    lineHeight: size.body * 1.25,
  },
  buttonSm: {
    fontFamily: family.ui,
    fontSize: size.sm,
    lineHeight: size.sm * lineHeight.normal,
  },
  link: {
    fontFamily: family.ui,
    fontSize: size.sm,
    lineHeight: size.sm * lineHeight.relaxed,
  },
  navLink: {
    fontFamily: family.ui,
    fontSize: size.body,
    lineHeight: size.body * 1.25,
  },

  // --- Legacy roles -------------------------------------------------------
  hero: {
    fontFamily: family.display,
    fontSize: size.hero,
    lineHeight: size.hero * lineHeight.snug,
    letterSpacing: letterSpacing.display,
  },
  display: {
    fontFamily: family.display,
    fontSize: size.display,
    lineHeight: size.display * lineHeight.snug,
    letterSpacing: letterSpacing.display,
  },
  h1: {
    fontFamily: family.display,
    fontSize: size.h1,
    lineHeight: size.h1 * lineHeight.snug,
    letterSpacing: letterSpacing.display,
  },
  h2: {
    fontFamily: family.display,
    fontSize: size.h2,
    lineHeight: size.h2 * 1.18,
    letterSpacing: letterSpacing.display,
  },
  h3: {
    fontFamily: family.display,
    fontSize: size.h3,
    lineHeight: size.h3 * lineHeight.snug,
    letterSpacing: letterSpacing.heading,
  },
  h4: {
    fontFamily: family.ui,
    fontSize: size.h4,
    lineHeight: size.h4 * lineHeight.snug,
    letterSpacing: letterSpacing.heading,
  },
  lead: {
    fontFamily: family.ui,
    fontSize: size.lead,
    lineHeight: size.lead * lineHeight.loose,
  },
  body: {
    fontFamily: family.ui,
    fontSize: size.body,
    lineHeight: size.body * lineHeight.loose,
  },
  sm: {
    fontFamily: family.ui,
    fontSize: size.sm,
    lineHeight: size.sm * lineHeight.relaxed,
  },
  xs: {
    fontFamily: family.ui,
    fontSize: size.xs,
    lineHeight: size.xs * lineHeight.relaxed,
  },
};

const DEFAULT_WEIGHT_BY_ROLE: Record<TextRole, keyof typeof typography.weight> = {
  rating: 'bold',
  displayXl: 'bold',
  displayLg: 'medium',
  displayMd: 'bold',
  displaySm: 'semibold',
  titleMd: 'semibold',
  titleSm: 'medium',
  bodyMd: 'regular',
  bodySm: 'regular',
  caption: 'medium',
  captionSm: 'regular',
  badge: 'semibold',
  micro: 'bold',
  tag: 'bold',
  buttonMd: 'medium',
  buttonSm: 'medium',
  link: 'regular',
  navLink: 'semibold',

  hero: 'bold',
  display: 'bold',
  h1: 'bold',
  h2: 'medium',
  h3: 'bold',
  h4: 'semibold',
  lead: 'regular',
  body: 'regular',
  sm: 'regular',
  xs: 'regular',
};

const HEADING_ROLES = new Set<TextRole>([
  'rating',
  'displayXl',
  'displayLg',
  'displayMd',
  'displaySm',
  'hero',
  'display',
  'h1',
  'h2',
  'h3',
  'h4',
]);

export function Text({ role = 'bodyMd', color, weight, align, style, children, ...rest }: KJTextProps) {
  const baseStyle = ROLE_STYLES[role];
  const finalWeight = typography.weight[weight ?? DEFAULT_WEIGHT_BY_ROLE[role]];
  const finalColor = color ?? palette.ink;

  return (
    <RNText
      {...rest}
      accessibilityRole={rest.accessibilityRole ?? (HEADING_ROLES.has(role) ? 'header' : undefined)}
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
