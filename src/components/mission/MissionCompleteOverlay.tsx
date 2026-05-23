import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Modal, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import * as Icons from 'lucide-react-native';

import { Text } from '../ui';
import { palette, motion, radius } from '../../../design-tokens';
import { useReduceMotion } from '../../lib/a11y';
import { hapticMissionComplete, hapticPanelUnlock } from '../../lib/haptics';

const { width: W, height: H } = Dimensions.get('window');
const CENTER_X = W / 2;
const CENTER_Y = H / 2;
const PANEL_MAX_R = Math.ceil(Math.hypot(W, H) / 2) + 40;
const RING_MAX_R = 220;
const RING_DURATION = 480;
const POST_HOLD_MS = 1200;

const STANDARD = Easing.bezier(0.25, 0.46, 0.45, 0.94);

const LIGHT_PANEL_HEXES = new Set<string>([palette.hwanggeum, palette.hwanggeumLight, palette.hwangto]);

interface Props {
  visible: boolean;
  iconName: string;
  iconColor: string;
  isPanelUnlock: boolean;
  panelNumber?: number;
  panelColor?: string;
  onDismiss: () => void;
}

export function MissionCompleteOverlay({
  visible,
  iconName,
  iconColor,
  isPanelUnlock,
  panelNumber,
  panelColor,
  onDismiss,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent onRequestClose={onDismiss}>
      {visible && (
        <ChoreographyView
          iconName={iconName}
          iconColor={iconColor}
          isPanelUnlock={isPanelUnlock}
          panelNumber={panelNumber}
          panelColor={panelColor}
          onDismiss={onDismiss}
        />
      )}
    </Modal>
  );
}

function ChoreographyView({
  iconName,
  iconColor,
  isPanelUnlock,
  panelNumber,
  panelColor,
  onDismiss,
}: Omit<Props, 'visible'>) {
  const reduceMotion = useReduceMotion();

  const iconScale = useSharedValue(1);
  const iconOpacity = useSharedValue(1);
  const iconY = useSharedValue(0);

  const r0 = useSharedValue(0);
  const r1 = useSharedValue(0);
  const r2 = useSharedValue(0);
  const r3 = useSharedValue(0);

  const panelR = useSharedValue(0);

  const textOpacity = useSharedValue(0);
  const textY = useSharedValue(8);

  useEffect(() => {
    const m = motion.missionComplete;

    // Haptics (ADR-0030). Panel unlock fires now (Reduce Motion steps it down
    // to Light inside the helper); mission-complete is timed to the stage-2
    // ink-ring and is silenced entirely under Reduce Motion.
    let hapticTimer: ReturnType<typeof setTimeout> | undefined;
    if (isPanelUnlock) {
      hapticPanelUnlock(reduceMotion);
    } else if (!reduceMotion) {
      hapticTimer = setTimeout(() => hapticMissionComplete(), m.cardSink);
    }

    // Reduce-motion path (ADR-0025): skip the 4-stage choreography. Cross-fade
    // the icon out, snap the panel and text in. Total ~600 ms instead of ~2400.
    if (reduceMotion) {
      iconOpacity.value = withTiming(0, { duration: 250, easing: STANDARD });
      if (isPanelUnlock) {
        panelR.value = PANEL_MAX_R; // snap, no expanding circle
        textOpacity.value = withDelay(200, withTiming(1, { duration: 250, easing: STANDARD }));
        textY.value = 0;
      }
      const timeoutId = setTimeout(onDismiss, isPanelUnlock ? 1600 : 600);
      return () => clearTimeout(timeoutId);
    }

    iconScale.value = withTiming(0.92, { duration: m.cardSink, easing: STANDARD });
    iconOpacity.value = withTiming(0, { duration: m.cardSink, easing: STANDARD });
    iconY.value = withTiming(20, { duration: m.cardSink, easing: STANDARD });

    [r0, r1, r2, r3].forEach((ring, i) => {
      ring.value = withDelay(
        m.cardSink + i * m.inkRingStagger,
        withTiming(1, { duration: RING_DURATION, easing: STANDARD }),
      );
    });

    let timeoutId: ReturnType<typeof setTimeout>;

    if (isPanelUnlock) {
      panelR.value = withDelay(
        m.cardSink,
        withTiming(PANEL_MAX_R, { duration: m.panelReveal, easing: STANDARD }),
      );
      textOpacity.value = withDelay(
        m.cardSink + m.panelReveal,
        withTiming(1, { duration: m.textFadeIn, easing: STANDARD }),
      );
      textY.value = withDelay(
        m.cardSink + m.panelReveal,
        withTiming(0, { duration: m.textFadeIn, easing: STANDARD }),
      );

      timeoutId = setTimeout(onDismiss, m.total + POST_HOLD_MS);
    } else {
      timeoutId = setTimeout(onDismiss, m.cardSink + 4 * m.inkRingStagger + 240);
    }

    return () => {
      clearTimeout(timeoutId);
      if (hapticTimer) clearTimeout(hapticTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduceMotion]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: iconY.value }, { scale: iconScale.value }],
    opacity: iconOpacity.value,
  }));

  const panelStyle = useAnimatedStyle(() => {
    const r = panelR.value;
    return {
      width: r * 2,
      height: r * 2,
      borderRadius: r,
      left: CENTER_X - r,
      top: CENTER_Y - r,
      opacity: r > 0 ? 1 : 0,
    };
  });

  const ring0Style = useAnimatedStyle(() => {
    const r = RING_MAX_R * r0.value;
    return {
      width: r * 2,
      height: r * 2,
      borderRadius: r,
      left: CENTER_X - r,
      top: CENTER_Y - r,
      opacity: 1 - r0.value,
    };
  });
  const ring1Style = useAnimatedStyle(() => {
    const r = RING_MAX_R * r1.value;
    return {
      width: r * 2,
      height: r * 2,
      borderRadius: r,
      left: CENTER_X - r,
      top: CENTER_Y - r,
      opacity: 1 - r1.value,
    };
  });
  const ring2Style = useAnimatedStyle(() => {
    const r = RING_MAX_R * r2.value;
    return {
      width: r * 2,
      height: r * 2,
      borderRadius: r,
      left: CENTER_X - r,
      top: CENTER_Y - r,
      opacity: 1 - r2.value,
    };
  });
  const ring3Style = useAnimatedStyle(() => {
    const r = RING_MAX_R * r3.value;
    return {
      width: r * 2,
      height: r * 2,
      borderRadius: r,
      left: CENTER_X - r,
      top: CENTER_Y - r,
      opacity: 1 - r3.value,
    };
  });

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textY.value }],
  }));

  type LucideIconProps = { size?: number; color?: string; strokeWidth?: number };
  const iconMap = Icons as unknown as Record<string, React.ComponentType<LucideIconProps>>;
  const Icon = iconMap[iconName] ?? iconMap.Sparkles;

  const textColor = panelColor && LIGHT_PANEL_HEXES.has(panelColor) ? palette.meok : palette.hanji;

  return (
    <Pressable
      style={styles.root}
      onPress={onDismiss}
      accessibilityViewIsModal
      accessibilityRole="button"
      accessibilityLabel={
        isPanelUnlock
          ? panelNumber === 8
            ? 'Byeongpung complete. Your journey is captured.'
            : `Panel ${panelNumber} of 8 unlocked. Open the byeongpung to see your scroll grow.`
          : 'Mission complete. Tap to dismiss.'
      }
      accessibilityHint="Closes the celebration overlay"
    >
      {isPanelUnlock && panelColor && (
        <Animated.View
          pointerEvents="none"
          style={[styles.absolute, { backgroundColor: panelColor }, panelStyle]}
        />
      )}

      <Animated.View
        pointerEvents="none"
        style={[styles.absolute, styles.ring, { borderColor: iconColor }, ring0Style]}
      />
      <Animated.View
        pointerEvents="none"
        style={[styles.absolute, styles.ring, { borderColor: iconColor }, ring1Style]}
      />
      <Animated.View
        pointerEvents="none"
        style={[styles.absolute, styles.ring, { borderColor: iconColor }, ring2Style]}
      />
      <Animated.View
        pointerEvents="none"
        style={[styles.absolute, styles.ring, { borderColor: iconColor }, ring3Style]}
      />

      <View style={[StyleSheet.absoluteFill, styles.center]} pointerEvents="none">
        <Animated.View style={[styles.iconWrap, { backgroundColor: iconColor + '14' }, iconStyle]}>
          <Icon size={56} color={iconColor} strokeWidth={1.4} />
        </Animated.View>
      </View>

      {isPanelUnlock && (
        <Animated.View
          style={[styles.textWrap, textStyle]}
          pointerEvents="none"
          accessibilityLiveRegion="polite"
        >
          <Text role="h2" color={textColor} align="center">
            {panelNumber === 8 ? 'Byeongpung complete' : `Panel ${panelNumber} unlocked`}
          </Text>
          <Text role="body" color={textColor} align="center" style={styles.textHint}>
            {panelNumber === 8 ? 'Your journey is captured.' : 'Tap anywhere to continue'}
          </Text>
        </Animated.View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.hanji,
  },
  absolute: {
    position: 'absolute',
  },
  ring: {
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: H * 0.22,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  textHint: {
    marginTop: 8,
    opacity: 0.78,
  },
});
