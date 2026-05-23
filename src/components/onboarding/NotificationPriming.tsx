import React, { useEffect } from 'react';
import { View, Modal, StyleSheet, Pressable } from 'react-native';
import { Bell } from 'lucide-react-native';

import { Text } from '../ui';
import { palette, space, radius } from '../../../design-tokens';
import { PUSH_PRIMING, requestPermission, getPermissionState } from '../../lib/notifications';
import { storage } from '../../lib/storage';
import { track } from '../../lib/posthog';

const PRIMED_KEY = 'onboarding:notification-priming:shown';

export function hasShownPriming(): boolean {
  return storage.getString(PRIMED_KEY) === 'true';
}

export function markPrimingShown() {
  storage.set(PRIMED_KEY, 'true');
}

/**
 * Permission priming card. Surfaces once before triggering the OS push prompt.
 * Per ADR-0029: the OS prompt is ONLY triggered after this card.
 */
export function NotificationPriming({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: (granted: boolean) => void;
}) {
  useEffect(() => {
    if (visible) track('notification_priming_shown');
  }, [visible]);

  async function handleAllow() {
    track('notification_priming_response', { response: 'granted' });
    let granted = false;
    try {
      granted = await requestPermission();
    } catch {
      // intentional swallow: OS prompt failure → treat as not granted. The
      // priming card must still close so onboarding is never stuck.
    }
    markPrimingShown();
    onClose(granted);
  }

  function handleDecline() {
    track('notification_priming_response', { response: 'dismissed' });
    markPrimingShown();
    onClose(false);
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleDecline}>
      <View style={styles.backdrop}>
        <View
          style={styles.card}
          accessibilityRole="alert"
          accessibilityLabel={`${PUSH_PRIMING.title}. ${PUSH_PRIMING.body}`}
        >
          <View style={styles.iconWrap}>
            <Bell size={32} color={palette.dancheong} strokeWidth={1.5} />
          </View>
          <Text role="h3" align="center">
            {PUSH_PRIMING.title}
          </Text>
          <Text role="sm" color={palette.ash} align="center">
            {PUSH_PRIMING.body}
          </Text>
          <Pressable
            onPress={handleAllow}
            accessibilityRole="button"
            accessibilityLabel={PUSH_PRIMING.primaryCta}
            style={({ pressed }) => [styles.primary, { opacity: pressed ? 0.85 : 1 }]}
          >
            <Text role="body" weight="semibold" color={palette.hanji}>
              {PUSH_PRIMING.primaryCta}
            </Text>
          </Pressable>
          <Pressable
            onPress={handleDecline}
            accessibilityRole="button"
            accessibilityLabel={PUSH_PRIMING.secondaryCta}
            style={({ pressed }) => [styles.secondary, { opacity: pressed ? 0.85 : 1 }]}
          >
            <Text role="body" weight="medium" color={palette.ash}>
              {PUSH_PRIMING.secondaryCta}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

/**
 * Returns true when the priming card should be shown: OS permission is
 * `undetermined` AND we haven't shown the priming card yet. False otherwise
 * (already granted, denied, or primed).
 */
export async function shouldShowPriming(): Promise<boolean> {
  if (hasShownPriming()) return false;
  const state = await getPermissionState();
  return state === 'undetermined';
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(44, 36, 22, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: space[5],
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: palette.hanji,
    borderRadius: radius.lg,
    padding: space[6],
    gap: space[3],
    alignItems: 'center',
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: palette.dancheongLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space[1],
  },
  primary: {
    width: '100%',
    minHeight: 48,
    borderRadius: radius.pill,
    backgroundColor: palette.dancheong,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space[5],
    marginTop: space[3],
  },
  secondary: {
    width: '100%',
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space[5],
  },
});
