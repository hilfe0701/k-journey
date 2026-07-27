import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  withDelay,
  withTiming,
  Easing,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { Text } from '../../src/components/ui';
import { palette, motion } from '../../design-tokens';
import { useProfile } from '../../src/hooks/useProfile';

const PANEL_COLORS = [
  palette.dancheong,
  palette.lotus,
  palette.hwanggeum,
  palette.cheong,
  palette.jade,
  palette.lotus,
  palette.meok,
  palette.hwanggeum,
];

export default function Splash() {
  const router = useRouter();
  const { loading, profile } = useProfile();
  const titleOpacity = useSharedValue(0);
  const taglineOpacity = useSharedValue(0);

  useEffect(() => {
    titleOpacity.value = withDelay(800, withTiming(1, { duration: 600 }));
    taglineOpacity.value = withDelay(1200, withTiming(1, { duration: 600 }));

    const timer = setTimeout(() => {
      if (loading) return;
      if (profile?.onboardingCompletedAt) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(onboarding)/profile');
      }
    }, motion.splashTotal);

    return () => clearTimeout(timer);
  }, [loading, profile, router, titleOpacity, taglineOpacity]);

  const titleStyle = useAnimatedStyle(() => ({ opacity: titleOpacity.value }));
  const taglineStyle = useAnimatedStyle(() => ({ opacity: taglineOpacity.value }));

  return (
    <View style={styles.root}>
      <View style={styles.panelRow}>
        {PANEL_COLORS.map((color, idx) => (
          <RisingPanel key={idx} color={color} delay={idx * 90} />
        ))}
      </View>

      <View style={styles.center}>
        <Animated.View style={titleStyle}>
          <Text role="display" align="center" color={palette.meok}>
            K&#x2013;Journey
          </Text>
        </Animated.View>
        <Animated.View style={[{ marginTop: 8 }, taglineStyle]}>
          <Text role="lead" align="center" color={palette.ash}>
            Your Korean semester, painted slowly.
          </Text>
        </Animated.View>
      </View>

      <View style={{ height: 60 }} />
    </View>
  );
}

function RisingPanel({ color, delay }: { color: string; delay: number }) {
  const y = useSharedValue(50);
  const opacity = useSharedValue(0);

  useEffect(() => {
    y.value = withDelay(delay, withTiming(0, { duration: 700, easing: Easing.out(Easing.cubic) }));
    opacity.value = withDelay(delay, withTiming(1, { duration: 700 }));
  }, [delay, y, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          flex: 1,
          height: 240,
          backgroundColor: color,
          marginHorizontal: 1,
        },
        animatedStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.hanji,
    justifyContent: 'space-between',
  },
  panelRow: {
    flexDirection: 'row',
    height: 240,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
});
