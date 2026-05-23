import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Pressable } from 'react-native';
import { Text } from './Text';
import { palette, space, radius } from '../../../design-tokens';
import { useReduceMotion } from '../../lib/a11y';
import { trackOnce } from '../../lib/telemetry';

type Variant = 'centered' | 'header';

interface EmptyStateProps {
  /** Lucide glyph or minhwa motif, rendered in a 48×48 slot. Optional — the
   *  byeongpung caption (EMPTY_STATES.md §7) is intentionally icon-less. */
  icon?: React.ReactNode;
  message: string;
  cta?: { label: string; onPress: () => void };
  accessibilityLabel: string;
  variant?: Variant;
  tone?: 'light' | 'dark';
  /** Screen identifier for the `screen_empty_view` KPI event (ADR-0027,
   *  PRD §4.5). Fires once per session if the empty state is still mounted
   *  after 5 s with no interaction. Omit to opt out of measurement. */
  screenName?: string;
}

const EMPTY_VIEW_DELAY_MS = 5000;

export function EmptyState({
  icon,
  message,
  cta,
  accessibilityLabel,
  variant = 'centered',
  tone = 'light',
  screenName,
}: EmptyStateProps) {
  const reduceMotion = useReduceMotion();
  const opacity = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;
  const emptyViewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (reduceMotion) {
      opacity.setValue(1);
      return;
    }
    Animated.timing(opacity, {
      toValue: 1,
      duration: 200,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [opacity, reduceMotion]);

  // screen_empty_view — fire once per session if the empty state survives
  // 5 s unattended. Unmount (the trigger flipped) or a CTA tap cancels it.
  useEffect(() => {
    if (!screenName) return;
    emptyViewTimer.current = setTimeout(() => {
      trackOnce('screen_empty_view', screenName, { screen: screenName });
    }, EMPTY_VIEW_DELAY_MS);
    return () => {
      if (emptyViewTimer.current) clearTimeout(emptyViewTimer.current);
    };
  }, [screenName]);

  function handleCtaPress() {
    if (emptyViewTimer.current) clearTimeout(emptyViewTimer.current);
    cta?.onPress();
  }

  const fgPrimary = tone === 'dark' ? palette.hanji : palette.meok;

  return (
    <Animated.View
      style={[
        variant === 'centered' ? styles.centered : styles.header,
        { opacity },
      ]}
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel}
    >
      {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
      <Text role="body" align="center" color={fgPrimary}>
        {message}
      </Text>
      {cta ? (
        <Pressable
          onPress={handleCtaPress}
          accessibilityRole="button"
          accessibilityLabel={cta.label}
          style={({ pressed }) => [
            styles.cta,
            { opacity: pressed ? 0.85 : 1 },
          ]}
          hitSlop={8}
        >
          <Text role="body" weight="semibold" color={palette.hanji}>
            {cta.label}
          </Text>
        </Pressable>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    paddingTop: space[16],
    paddingBottom: space[12],
    paddingHorizontal: space[5],
    gap: space[4],
  },
  header: {
    alignItems: 'center',
    paddingVertical: space[5],
    paddingHorizontal: space[5],
    gap: space[3],
  },
  iconWrap: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cta: {
    minHeight: 44,
    paddingHorizontal: space[5],
    paddingVertical: space[3],
    borderRadius: radius.pill,
    backgroundColor: palette.dancheong,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
