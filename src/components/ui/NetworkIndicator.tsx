import React from 'react';
import { View, StyleSheet } from 'react-native';
import { palette } from '../../../design-tokens';
import { useNetwork } from '../../state/useNetwork';

/**
 * A small, calm offline dot for the header (ADR-0031). Muted ash, never the
 * alarm-red dancheong — offline is a state, not an error. The matching toast
 * (useNetworkToasts) carries the announcement; this dot is the persistent cue.
 */
export function NetworkIndicator() {
  const { isConnected } = useNetwork();

  // null = unknown (initial fetch in flight); only render when explicitly false.
  if (isConnected !== false) return null;

  return (
    <View
      style={styles.dot}
      accessible
      accessibilityRole="text"
      accessibilityLabel="Offline — your work is saved on this device"
    />
  );
}

const styles = StyleSheet.create({
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: palette.ash,
  },
});
