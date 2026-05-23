import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '../ui';
import { palette, space, radius, elevation } from '../../../design-tokens';
import { subscribeErrors, type ErrorEvent } from '../../lib/errors/host';
import { useReduceMotion } from '../../lib/a11y';
import { track } from '../../lib/posthog';

interface Toast {
  event: ErrorEvent;
  expiresAt: number;
}

/**
 * Subscribes to the singleton error bus and surfaces T1 toasts and T4
 * banners. T1 toasts auto-dismiss after their `autoDismissMs` (default 4 s).
 * T4 banners persist until primary CTA tap.
 */
export function ToastHost() {
  const reduceMotion = useReduceMotion();
  const [toast, setToast] = useState<Toast | null>(null);
  const [banner, setBanner] = useState<ErrorEvent | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    return subscribeErrors((event) => {
      if (event.row.tier === 'T1') {
        const ttl = event.row.autoDismissMs ?? 4000;
        setToast({ event, expiresAt: Date.now() + ttl });
      } else if (event.row.tier === 'T4') {
        setBanner(event);
      }
    });
  }, []);

  useEffect(() => {
    if (!toast) {
      opacity.setValue(0);
      return;
    }
    if (reduceMotion) {
      opacity.setValue(1);
    } else {
      Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    }
    const ms = Math.max(0, toast.expiresAt - Date.now());
    const id = setTimeout(() => dismissToast('auto'), ms);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast, reduceMotion]);

  function dismissToast(via: 'auto' | 'tap' | 'retry') {
    if (!toast) return;
    track('error_toast_dismissed', {
      code: toast.event.row.code,
      tier: toast.event.row.tier,
      dismissedVia: via,
    });
    if (reduceMotion) {
      setToast(null);
      return;
    }
    Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setToast(null);
    });
  }

  function handlePrimaryToast() {
    if (!toast) return;
    toast.event.onPrimary?.();
    dismissToast('retry');
  }

  function handlePrimaryBanner() {
    if (!banner) return;
    banner.onPrimary?.();
    setBanner(null);
  }

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      {banner ? (
        <SafeAreaView edges={['top']} style={styles.bannerSafe}>
          <View
            style={styles.banner}
            accessibilityRole="alert"
            accessibilityLabel={`${banner.row.title ?? 'Notice'}. ${banner.row.body}`}
          >
            <View style={{ flex: 1, gap: 2 }}>
              {banner.row.title ? (
                <Text role="body" weight="semibold" color={palette.hanji}>
                  {banner.row.title}
                </Text>
              ) : null}
              <Text role="sm" color={palette.hanji}>
                {banner.row.body}
              </Text>
            </View>
            {banner.row.primaryCta ? (
              <Pressable
                onPress={handlePrimaryBanner}
                accessibilityRole="button"
                accessibilityLabel={banner.row.primaryCta}
                hitSlop={8}
                style={styles.bannerCta}
              >
                <Text role="sm" weight="semibold" color={palette.hanji}>
                  {banner.row.primaryCta}
                </Text>
              </Pressable>
            ) : null}
          </View>
        </SafeAreaView>
      ) : null}

      {toast ? (
        <SafeAreaView edges={['bottom']} style={styles.toastSafe} pointerEvents="box-none">
          <Animated.View style={[styles.toast, { opacity }]}>
            <Pressable
              onPress={() => dismissToast('tap')}
              accessibilityRole="alert"
              accessibilityLiveRegion="assertive"
              accessibilityLabel={toast.event.row.body}
              style={styles.toastInner}
            >
              <Text role="sm" color={palette.hanji} style={{ flex: 1 }}>
                {toast.event.row.body}
              </Text>
              {toast.event.row.primaryCta ? (
                <Pressable
                  onPress={handlePrimaryToast}
                  accessibilityRole="button"
                  accessibilityLabel={toast.event.row.primaryCta}
                  hitSlop={8}
                  style={styles.toastCta}
                >
                  <Text role="sm" weight="semibold" color={palette.hwanggeumLight}>
                    {toast.event.row.primaryCta}
                  </Text>
                </Pressable>
              ) : null}
            </Pressable>
          </Animated.View>
        </SafeAreaView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bannerSafe: {
    backgroundColor: palette.dancheong,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    paddingHorizontal: space[5],
    paddingVertical: space[3],
    backgroundColor: palette.dancheong,
  },
  bannerCta: {
    paddingHorizontal: space[3],
    paddingVertical: space[2],
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  toastSafe: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  toast: {
    marginHorizontal: space[5],
    marginBottom: space[5],
    borderRadius: radius.card,
    backgroundColor: palette.meok,
    ...elevation.s2,
  },
  toastInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    paddingHorizontal: space[4],
    paddingVertical: space[3],
  },
  toastCta: {
    paddingHorizontal: space[2],
    paddingVertical: space[1],
  },
});
