import React, { useEffect, useRef, useState } from 'react';
import { View, Modal, StyleSheet, Pressable, Image, Animated, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '../ui';
import { palette, space, radius, elevation } from '../../../design-tokens';
import { useReduceMotion } from '../../lib/a11y';
import { BYEONGPUNG_PANEL_IMAGES } from '../byeongpung/motifs';
import { storage } from '../../lib/storage';
import { track } from '../../lib/posthog';
import type { EraKey } from '../../theme/eras';

const TOUR_KEY = 'tour:firstLaunch:shown';

export function hasShownAhaMoment(): boolean {
  return storage.getString(TOUR_KEY) === 'true';
}

export function markAhaMomentShown() {
  storage.set(TOUR_KEY, 'true');
}

export function resetAhaMoment() {
  storage.delete(TOUR_KEY);
}

/**
 * First-launch aha-moment per PRD §4.6. Surfaces once after onboarding
 * completes. The selected era's panel 1 reveals progressively as a
 * brand-defining welcome.
 */
export function AhaMomentTour({
  visible,
  era,
  onDismiss,
}: {
  visible: boolean;
  era: EraKey;
  onDismiss: () => void;
}) {
  const reduceMotion = useReduceMotion();
  const reveal = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;
  const [mountedAt, setMountedAt] = useState<number | null>(null);

  useEffect(() => {
    if (!visible) return;
    setMountedAt(Date.now());
    track('tour_aha_moment_shown');
    if (reduceMotion) {
      reveal.setValue(1);
      return;
    }
    reveal.setValue(0);
    Animated.timing(reveal, {
      toValue: 1,
      duration: 1200,
      // React Native Web has no native animation driver. Keeping this platform-aware
      // avoids a noisy console warning without changing the native animation path.
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [visible, reduceMotion, reveal]);

  function handleDismiss() {
    const secondsViewed = mountedAt ? (Date.now() - mountedAt) / 1000 : 0;
    track('tour_aha_moment_dismissed', { secondsViewed: Math.round(secondsViewed * 10) / 10 });
    markAhaMomentShown();
    onDismiss();
  }

  const panel = BYEONGPUNG_PANEL_IMAGES[era][0];

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={handleDismiss}>
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <View style={styles.body}>
          <Animated.View
            style={[styles.panelFrame, { opacity: reveal }]}
            accessible
            accessibilityRole="image"
            accessibilityLabel={`Your ${era} byeongpung, panel 1.`}
          >
            <Image source={panel} style={styles.panelImage} resizeMode="cover" />
          </Animated.View>
          <View style={{ gap: space[3], alignItems: 'center' }}>
            <Text role="h2" align="center">
              Your K-Journey begins
            </Text>
            <Text role="body" color={palette.meokMid} align="center">
              Complete cultural missions and bucket-list moments to reveal your byeongpung. Your
              administrative checklist stays alongside them, sorted by what applies to you.
            </Text>
          </View>
        </View>
        <View style={styles.footer}>
          <Pressable
            onPress={handleDismiss}
            accessibilityRole="button"
            accessibilityLabel="See my journey"
            style={({ pressed }) => [styles.cta, { opacity: pressed ? 0.85 : 1 }]}
          >
            <Text role="body" weight="semibold" color={palette.hanji}>
              See my journey
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.hanji,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space[6],
    gap: space[8],
  },
  panelFrame: {
    width: 200,
    height: 280,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: palette.hwangto,
    borderWidth: 1,
    borderColor: palette.hwanggeum,
    ...elevation.s2,
  },
  panelImage: {
    width: '100%',
    height: '100%',
  },
  footer: {
    paddingHorizontal: space[5],
    paddingBottom: space[4],
    paddingTop: space[3],
  },
  cta: {
    minHeight: 52,
    borderRadius: radius.pill,
    backgroundColor: palette.dancheong,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space[5],
  },
});
