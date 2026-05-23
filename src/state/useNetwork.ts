import { useEffect, useState } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export interface NetworkStatus {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
}

const INITIAL: NetworkStatus = { isConnected: null, isInternetReachable: null };

export function useNetwork(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>(INITIAL);

  useEffect(() => {
    let mounted = true;

    NetInfo.fetch().then((state) => {
      if (mounted) setStatus(toStatus(state));
    });

    const unsub = NetInfo.addEventListener((state) => {
      if (mounted) setStatus(toStatus(state));
    });

    return () => {
      mounted = false;
      unsub();
    };
  }, []);

  return status;
}

function toStatus(state: NetInfoState): NetworkStatus {
  return {
    isConnected: state.isConnected,
    isInternetReachable: state.isInternetReachable,
  };
}
