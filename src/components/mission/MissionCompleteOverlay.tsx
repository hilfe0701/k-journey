import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Modal, Pressable } from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { Text } from '../ui';
import { palette, motion, radius } from '../../../design-tokens';
import { useReduceMotion } from '../../lib/a11y';
import { hapticMissionComplete, hapticPanelUnlock } from '../../lib/haptics';

const { width: W, height: H } = Dimensions.get('window');
const CENTER_X = W / 2;
const CENTER_Y = H / 2;
const PANEL_MAX_R = Math.ceil(Math.hypot(W, H) / 2) + 40;
// Regular completions bloom to a contained radius (then dissipate) instead of
// filling the screen — the full reveal stays reserved for the panel unlock.
const BLOOM_R = Math.round(Math.min(W, H) * 0.7);
const RING_MAX_R = 220;
const RING_DURATION = 480;
const POST_HOLD_MS = 1200;

const STANDARD = Easing.bezier(0.25, 0.46, 0.45, 0.94);

const LIGHT_PANEL_HEXES = new Set<string>([palette.hwanggeum, palette.hwanggeumLight, palette.hwangto]);

// react-native-svg circle whose `r` (and opacity) we drive from the UI thread.
// SVG strokes/fills are anti-aliased, so the expanding edge stays smooth — no
// per-frame re-rasterized borderRadius "stair-stepping" like the old View circle.
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props {
  visible: boolean;
  iconName: string;
  iconColor: string;
  isPanelUnlock: boolean;
  panelNumber?: number;
  panelColor?: string;
  panelImage?: ImageSourcePropType;
  onDismiss: () => void;
}

export function MissionCompleteOverlay({
  visible,
  iconName,
  iconColor,
  isPanelUnlock,
  panelNumber,
  panelColor,
  panelImage,
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
          panelImage={panelImage}
          onDismiss={onDismiss}
        />
      )}
    </Modal>
  );
}

function ChoreographyView({
  iconColor,
  isPanelUnlock,
  panelNumber,
  panelColor,
  panelImage,
  onDismiss,
}: Omit<Props, 'visible'>) {
  const reduceMotion = useReduceMotion();

  // 0→1 progress drivers.
  const r0 = useSharedValue(0);
  const r1 = useSharedValue(0);
  const r2 = useSharedValue(0);
  const r3 = useSharedValue(0);

  const panelR = useSharedValue(0);
  // disc fade — stays 1 for the panel unlock (the painting holds on it); on a
  // regular completion it fades to 0 so the ink bloom dissipates.
  const discOpacity = useSharedValue(1);

  // the actual panel painting — fades + scales in over the ink reveal
  const artScale = useSharedValue(0.82);
  const artOpacity = useSharedValue(0);

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

    // Reduce-motion path (ADR-0025): skip the 4-stage choreography. Snap the
    // panel and text in. Total ~600 ms instead of ~2400.
    if (reduceMotion) {
      if (isPanelUnlock) {
        panelR.value = PANEL_MAX_R; // snap, no expanding circle
        artOpacity.value = withTiming(1, { duration: 250, easing: STANDARD });
        artScale.value = 1;
        textOpacity.value = withDelay(200, withTiming(1, { duration: 250, easing: STANDARD }));
        textY.value = 0;
      }
      const timeoutId = setTimeout(onDismiss, isPanelUnlock ? 1600 : 600);
      return () => clearTimeout(timeoutId);
    }

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
      // painting blooms in while the ink circle is still expanding
      artOpacity.value = withDelay(
        m.cardSink + m.panelReveal * 0.3,
        withTiming(1, { duration: m.panelReveal * 0.7, easing: STANDARD }),
      );
      artScale.value = withDelay(
        m.cardSink + m.panelReveal * 0.3,
        withTiming(1, { duration: m.panelReveal * 0.7, easing: STANDARD }),
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
      // Regular mission complete: a contained ink bloom in the mission's
      // category colour diffuses out, then dissipates.
      panelR.value = withDelay(
        m.cardSink,
        withTiming(BLOOM_R, { duration: m.panelReveal, easing: STANDARD }),
      );
      discOpacity.value = withDelay(
        m.cardSink + m.panelReveal * 0.5,
        withTiming(0, { duration: 500, easing: STANDARD }),
      );
      timeoutId = setTimeout(onDismiss, m.cardSink + m.panelReveal * 0.5 + 500 + 200);
    }

    return () => {
      clearTimeout(timeoutId);
      if (hapticTimer) clearTimeout(hapticTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduceMotion]);

  // ── SVG animated props (UI thread) ─────────────────────────────────────────
  const panelProps = useAnimatedProps(() => ({ r: panelR.value, opacity: discOpacity.value }));
  const ring0Props = useAnimatedProps(() => ({ r: RING_MAX_R * r0.value, opacity: 1 - r0.value }));
  const ring1Props = useAnimatedProps(() => ({ r: RING_MAX_R * r1.value, opacity: 1 - r1.value }));
  const ring2Props = useAnimatedProps(() => ({ r: RING_MAX_R * r2.value, opacity: 1 - r2.value }));
  const ring3Props = useAnimatedProps(() => ({ r: RING_MAX_R * r3.value, opacity: 1 - r3.value }));

  const artStyle = useAnimatedStyle(() => ({
    opacity: artOpacity.value,
    transform: [{ scale: artScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textY.value }],
  }));

  const textColor = panelColor && LIGHT_PANEL_HEXES.has(panelColor) ? palette.meok : palette.hanji;

  // The spreading ink disc: the panel's colour on an unlock, otherwise the
  // mission's category colour for the regular-completion bloom.
  const discColor = isPanelUnlock ? panelColor : iconColor;

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
      {/* Ink-bleed reveal + concentric ink rings, all anti-aliased in one SVG
          layer. The panel disc uses a radial gradient that feathers to
          transparent at the rim, so the colour diffuses into the hanji like ink
          spreading in water rather than a hard geometric wipe. */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <Svg width={W} height={H}>
          <Defs>
            {discColor ? (
              <RadialGradient id="inkBleed" cx="0.5" cy="0.5" r="0.5" gradientUnits="objectBoundingBox">
                <Stop offset="0" stopColor={discColor} stopOpacity={1} />
                <Stop offset="0.74" stopColor={discColor} stopOpacity={1} />
                <Stop offset="0.9" stopColor={discColor} stopOpacity={0.55} />
                <Stop offset="1" stopColor={discColor} stopOpacity={0} />
              </RadialGradient>
            ) : null}
          </Defs>

          {discColor ? (
            <AnimatedCircle cx={CENTER_X} cy={CENTER_Y} fill="url(#inkBleed)" animatedProps={panelProps} />
          ) : null}

          <AnimatedCircle
            cx={CENTER_X}
            cy={CENTER_Y}
            fill="none"
            stroke={iconColor}
            strokeWidth={2}
            animatedProps={ring0Props}
          />
          <AnimatedCircle
            cx={CENTER_X}
            cy={CENTER_Y}
            fill="none"
            stroke={iconColor}
            strokeWidth={2}
            animatedProps={ring1Props}
          />
          <AnimatedCircle
            cx={CENTER_X}
            cy={CENTER_Y}
            fill="none"
            stroke={iconColor}
            strokeWidth={2}
            animatedProps={ring2Props}
          />
          <AnimatedCircle
            cx={CENTER_X}
            cy={CENTER_Y}
            fill="none"
            stroke={iconColor}
            strokeWidth={2}
            animatedProps={ring3Props}
          />
        </Svg>
      </View>

      {isPanelUnlock && panelImage && (
        <Animated.View pointerEvents="none" style={[styles.artWrap, artStyle]}>
          <Animated.Image source={panelImage} style={styles.art} resizeMode="cover" />
        </Animated.View>
      )}

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
  artWrap: {
    position: 'absolute',
    left: W * 0.29,
    top: H * 0.15,
    width: W * 0.42,
    height: H * 0.52,
    borderRadius: radius.card,
    borderWidth: 2,
    borderColor: palette.hwanggeum,
    overflow: 'hidden',
    backgroundColor: palette.hanji,
  },
  art: {
    width: '100%',
    height: '100%',
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
