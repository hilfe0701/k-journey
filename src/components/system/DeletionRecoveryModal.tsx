import React, { useState } from 'react';
import { View, Modal, StyleSheet, Pressable } from 'react-native';

import { Text } from '../ui';
import { palette, space, radius } from '../../../design-tokens';
import { useAuth } from '../../hooks/useAuth';
import { useDeletionStatus } from '../../state/useDeletionStatus';
import { cancelAccountDeletion } from '../../lib/firebase';
import { showOperationError, surfaceError } from '../../lib/errorAlert';
import { track } from '../../lib/posthog';

/**
 * Account-deletion recovery modal (ADR-0033 §C). When a signed-in user has a
 * pending soft-delete, this surfaces once per session offering "Cancel
 * deletion". Mounted in AuthGate so it appears on app foreground.
 */
export function DeletionRecoveryModal() {
  const { user } = useAuth();
  const { pending, daysRemaining } = useDeletionStatus();
  const [dismissed, setDismissed] = useState(false);
  const [busy, setBusy] = useState(false);

  const visible = pending && !dismissed && !!user;
  const daysText = daysRemaining === 1 ? '1 day' : `${daysRemaining ?? 0} days`;

  async function handleCancelDeletion() {
    if (!user) return;
    setBusy(true);
    try {
      await cancelAccountDeletion(user.uid);
      track('account_delete_initiated', { stage: 'cancelled' });
      setDismissed(true);
      surfaceError('account-restored');
    } catch (err) {
      showOperationError('restore your account', err, { onPrimary: handleCancelDeletion });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => setDismissed(true)}
    >
      <View style={styles.backdrop}>
        <View
          style={styles.card}
          accessibilityViewIsModal
          accessibilityRole="alert"
          accessibilityLabel={`Welcome back. Your account is scheduled for deletion in ${daysText}. Tap Cancel deletion to keep your byeongpung.`}
        >
          <Text role="h2" align="center">
            Welcome back
          </Text>
          <Text role="body" color={palette.ash} align="center">
            Your account is scheduled for deletion in {daysText}.
          </Text>
          <Text role="sm" color={palette.ash} align="center">
            Tap &quot;Cancel deletion&quot; to keep your byeongpung.
          </Text>
          <Pressable
            onPress={handleCancelDeletion}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel="Cancel deletion"
            style={({ pressed }) => [styles.primary, { opacity: pressed || busy ? 0.85 : 1 }]}
          >
            <Text role="body" weight="semibold" color={palette.hanji}>
              Cancel deletion
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setDismissed(true)}
            accessibilityRole="button"
            accessibilityLabel="Continue with deletion"
            style={({ pressed }) => [styles.secondary, { opacity: pressed ? 0.85 : 1 }]}
          >
            <Text role="body" weight="medium" color={palette.dancheong}>
              Continue with deletion
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: palette.meok + '8C',
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
