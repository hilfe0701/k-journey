import { useMemo } from 'react';
import { useCompletedMissions } from './useCompletedMissions';
import { useBuckets } from './useBuckets';
import { aggregateCompletions } from '../lib/completions';

export interface TotalCompletionsState {
  loading: boolean;
  missionCount: number;
  bucketItemCount: number;
  total: number;
}

/**
 * Sum of completed missions and checked-off bucket items.
 * Used to drive byeongpung panel-unlock progress (6 completions per panel).
 */
export function useTotalCompletions(): TotalCompletionsState {
  const { loading: missionsLoading, completed } = useCompletedMissions();
  const { loading: bucketsLoading, buckets } = useBuckets();

  return useMemo(() => {
    const agg = aggregateCompletions(completed.length, buckets);
    return {
      loading: missionsLoading || bucketsLoading,
      ...agg,
    };
  }, [completed, buckets, missionsLoading, bucketsLoading]);
}
