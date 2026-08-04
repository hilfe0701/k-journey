/**
 * Renders the alerts that `src/lib/alert.ts` publishes.
 *
 * Only web needs this: `Alert.alert` is a no-op function in React Native Web,
 * so on the deployed web build every confirmation and blocking error was
 * invisible — including the "Delete all local data" confirmation, which made
 * that control unusable. Native keeps the OS dialog.
 *
 * Behaviour deliberately matches an OS alert: modal, dismissable with Escape
 * or the backdrop *only when a cancel button exists* (an alert with a single
 * acknowledgement has nothing to cancel to), and announced as an
 * `alertdialog`.
 */

import React, { useEffect, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, View } from 'react-native';

import { MIN_TARGET, Text } from '../ui';
import { palette, radius, space, elevation, semantic } from '../../../design-tokens';
import { subscribeAlerts, type AlertButton, type AlertRequest } from '../../lib/alert';

export function AlertHost() {
  const [request, setRequest] = useState<AlertRequest | null>(null);

  useEffect(() => subscribeAlerts(setRequest), []);

  const cancelButton = request?.buttons.find((b) => b.style === 'cancel');

  function close(button?: AlertButton) {
    setRequest(null);
    button?.onPress?.();
  }

  // Escape closes, but only to the answer the user could have given anyway.
  useEffect(() => {
    if (Platform.OS !== 'web' || !request || typeof document === 'undefined') return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && cancelButton) close(cancelButton);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request, cancelButton]);

  if (!request) return null;

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={() => close(cancelButton)}
      accessibilityViewIsModal
    >
      <Pressable
        style={styles.backdrop}
        // A backdrop tap is a cancel; with no cancel button it does nothing,
        // exactly like an OS alert.
        onPress={cancelButton ? () => close(cancelButton) : undefined}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        aria-hidden
      />
      <View style={styles.centre} pointerEvents="box-none">
        <View
          style={styles.dialog}
          accessibilityRole="alert"
          accessibilityLiveRegion="assertive"
          role="alertdialog"
          aria-modal
          aria-label={request.title}
        >
          <Text role="h4">{request.title}</Text>
          {request.message ? (
            <Text role="sm" color={palette.ash}>
              {request.message}
            </Text>
          ) : null}
          <View style={styles.actions}>
            {request.buttons.map((button) => (
              <Pressable
                key={button.text}
                onPress={() => close(button)}
                accessibilityRole="button"
                accessibilityLabel={button.text}
                style={({ pressed }) => [
                  styles.action,
                  button.style === 'destructive' ? styles.destructive : null,
                  button.style === 'cancel' ? styles.cancel : null,
                  { opacity: pressed ? 0.85 : 1 },
                ]}
              >
                <Text
                  role="body"
                  weight="semibold"
                  color={button.style === 'cancel' ? palette.meok : palette.hanji}
                >
                  {button.text}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: palette.meok + 'A6',
  },
  centre: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: space[5],
  },
  dialog: {
    width: '100%',
    maxWidth: 420,
    gap: space[3],
    padding: space[5],
    borderRadius: radius.card,
    backgroundColor: palette.hanji,
    ...elevation.s3,
  },
  actions: {
    gap: space[2],
    marginTop: space[2],
  },
  action: {
    minHeight: MIN_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space[4],
    borderRadius: radius.pill,
    backgroundColor: palette.meok,
  },
  destructive: {
    backgroundColor: palette.dancheong,
  },
  cancel: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: semantic.border.hairline,
  },
});
