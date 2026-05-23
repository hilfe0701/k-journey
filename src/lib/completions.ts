import type { Bucket } from './firebase';

/**
 * Pure aggregation of byeongpung-progress inputs. Extracted from
 * `useTotalCompletions` so it can be unit-tested without React/Firebase deps.
 */
export function aggregateCompletions(
  completedMissionCount: number,
  buckets: Bucket[],
): { missionCount: number; bucketItemCount: number; total: number } {
  const missionCount = completedMissionCount;
  const bucketItemCount = buckets.reduce(
    (sum, b) => sum + b.items.filter((it) => it.completedAtIso).length,
    0,
  );
  return { missionCount, bucketItemCount, total: missionCount + bucketItemCount };
}
