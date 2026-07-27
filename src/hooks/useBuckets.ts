import { useMMKVString } from 'react-native-mmkv';
import { Bucket } from '../lib/firebase';
import { getJson, KEYS, storage } from '../lib/storage';

export interface BucketsState {
  loading: boolean;
  buckets: Bucket[];
}

export function useBuckets(): BucketsState {
  const [bucketsJson] = useMMKVString(KEYS.bucketsCache, storage);
  const buckets = bucketsJson ? parseBuckets(bucketsJson) : getJson<Bucket[]>(KEYS.bucketsCache) ?? [];

  return { loading: false, buckets };
}

export function useBucket(bucketId: string | undefined): {
  loading: boolean;
  bucket: Bucket | null;
} {
  const { loading, buckets } = useBuckets();
  if (!bucketId) return { loading, bucket: null };
  return { loading, bucket: buckets.find((bucket) => bucket.id === bucketId) ?? null };
}

function parseBuckets(raw: string): Bucket[] {
  try {
    return JSON.parse(raw) as Bucket[];
  } catch {
    return [];
  }
}
