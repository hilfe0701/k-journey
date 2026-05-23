/**
 * Offline / reconnect toasts (ADR-0031, PRD §11.13).
 *
 * On a sustained offline state, surfaces the `network-offline` T1 toast; on
 * reconnect it surfaces `Synced.` — but ONLY if the offline toast had shown.
 * A short debounce swallows brief connectivity blips so a 2-second Wi-Fi
 * stutter never produces a pair of toasts.
 *
 * Mounted once in AuthGate so it is screen-independent.
 */

import { useEffect, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { surfaceError } from '../lib/errorAlert';

const OFFLINE_DEBOUNCE_MS = 2500;

export function useNetworkToasts() {
  const offlineToastShown = useRef(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let prevConnected: boolean | null = null;

    const unsub = NetInfo.addEventListener((state) => {
      const connected = state.isConnected;
      if (connected === prevConnected) return;
      prevConnected = connected;

      if (connected === false) {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
          offlineToastShown.current = true;
          // The Retry button re-checks connectivity rather than dismissing.
          surfaceError('network-offline', { onPrimary: () => void NetInfo.refresh() });
        }, OFFLINE_DEBOUNCE_MS);
      } else if (connected === true) {
        if (debounceTimer.current) {
          clearTimeout(debounceTimer.current);
          debounceTimer.current = null;
        }
        if (offlineToastShown.current) {
          offlineToastShown.current = false;
          surfaceError('network-offline-recovered');
        }
      }
    });

    return () => {
      unsub();
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);
}
