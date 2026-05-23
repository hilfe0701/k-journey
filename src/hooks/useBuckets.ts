import { useEffect, useRef, useState } from 'react';
import { useMMKVBoolean, useMMKVString } from 'react-native-mmkv';
import { onSnapshot, orderBy, query } from '@react-native-firebase/firestore';
import { useAuth } from './useAuth';
import { Bucket, bucketsCollection } from '../lib/firebase';
import { surfaceError } from '../lib/errorAlert';
import { storage, KEYS } from '../lib/storage';

export interface BucketsState {
  loading: boolean;
  buckets: Bucket[];
}

export function useBuckets(): BucketsState {
  const { user } = useAuth();
  const [devMock] = useMMKVBoolean(KEYS.devMockAuth, storage);
  const [devMockJson] = useMMKVString(KEYS.devMockBuckets, storage);
  const prevItemCount = useRef<number | null>(null);

  const [state, setState] = useState<BucketsState>({ loading: true, buckets: [] });

  useEffect(() => {
    if (__DEV__ && devMock) {
      const list: Bucket[] = devMockJson ? JSON.parse(devMockJson) : [];
      setState({ loading: false, buckets: list });
      return;
    }

    if (!user) {
      setState({ loading: false, buckets: [] });
      return;
    }

    const unsub = onSnapshot(
      query(bucketsCollection(user.uid), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const list: Bucket[] = snapshot.docs.map((d) => d.data() as Bucket);
        // ADR-0031 sync-conflict cue: a wish-count drop on a server-confirmed
        // snapshot (not a local pending write) means another device removed
        // items. `hasPendingWrites` is false only for server-origin changes,
        // so the user's own deletes never trigger this toast.
        const itemCount = list.reduce((sum, b) => sum + b.items.length, 0);
        if (
          prevItemCount.current !== null &&
          itemCount < prevItemCount.current &&
          !snapshot.metadata.hasPendingWrites
        ) {
          surfaceError('bucket-conflict');
        }
        prevItemCount.current = itemCount;
        setState({ loading: false, buckets: list });
      },
      (err) => {
        console.warn('buckets snapshot error', err);
        setState((prev) => ({ ...prev, loading: false }));
      },
    );

    return unsub;
  }, [user, devMock, devMockJson]);

  return state;
}

export function useBucket(bucketId: string | undefined): {
  loading: boolean;
  bucket: Bucket | null;
} {
  const { loading, buckets } = useBuckets();
  if (!bucketId) return { loading, bucket: null };
  return { loading, bucket: buckets.find((b) => b.id === bucketId) ?? null };
}
