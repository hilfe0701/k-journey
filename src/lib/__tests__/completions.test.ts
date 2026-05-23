import { aggregateCompletions } from '../../lib/completions';
import type { Bucket } from '../../lib/firebase';

function bucket(id: string, items: { done: boolean }[]): Bucket {
  return {
    id,
    themeName: id,
    templateKey: 'peony',
    maxItems: 10,
    items: items.map((it, i) => ({
      id: `${id}_${i}`,
      text: `item ${i}`,
      completedAtIso: it.done ? '2026-05-05T00:00:00.000Z' : null,
    })),
    createdAtIso: '2026-05-05T00:00:00.000Z',
  };
}

describe('aggregateCompletions', () => {
  it('returns 0 across the board when nothing is done', () => {
    expect(aggregateCompletions(0, [])).toEqual({
      missionCount: 0,
      bucketItemCount: 0,
      total: 0,
    });
  });

  it('counts only checked bucket items', () => {
    const b = bucket('a', [{ done: true }, { done: false }, { done: true }]);
    expect(aggregateCompletions(0, [b]).bucketItemCount).toBe(2);
  });

  it('sums missions and bucket items', () => {
    const b = bucket('a', [{ done: true }, { done: true }]);
    expect(aggregateCompletions(5, [b]).total).toBe(7);
  });

  it('sums across multiple buckets', () => {
    const b1 = bucket('a', [{ done: true }]);
    const b2 = bucket('b', [{ done: true }, { done: true }]);
    const b3 = bucket('c', [{ done: false }]);
    expect(aggregateCompletions(3, [b1, b2, b3])).toEqual({
      missionCount: 3,
      bucketItemCount: 3,
      total: 6,
    });
  });

  it('reaching panel unlock threshold (6) is detectable', () => {
    // The panel-unlock check is `total > 0 && total <= 48 && total % 6 === 0`.
    // Verify the aggregation produces totals that line up with the threshold.
    const b = bucket('a', [{ done: true }, { done: true }]);
    const agg = aggregateCompletions(4, [b]); // 4 missions + 2 bucket items = 6
    expect(agg.total).toBe(6);
    expect(agg.total % 6).toBe(0);
  });
});
