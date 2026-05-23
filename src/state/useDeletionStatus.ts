/**
 * Account-deletion grace-period status (ADR-0033 §C).
 *
 * Reads users/{uid}._meta.deletionRequestedAt (set by requestAccountDeletion).
 * When present, the account is in the 30-day soft-delete window — the recovery
 * modal uses `pending` to offer "Cancel deletion" and counts down to the
 * reaper Cloud Function's purge.
 */

import { useProfile } from '../hooks/useProfile';
import { metaTimestampToDate } from '../lib/firebase';
import { kstNow } from '../lib/dates';

export const DELETION_GRACE_DAYS = 30;

export interface DeletionStatus {
  pending: boolean;
  daysRemaining: number | null;
}

export function useDeletionStatus(): DeletionStatus {
  const { profile } = useProfile();
  const requestedAt = metaTimestampToDate(profile?._meta?.deletionRequestedAt);
  if (!requestedAt) return { pending: false, daysRemaining: null };
  const elapsedDays = Math.floor((kstNow().getTime() - requestedAt.getTime()) / 86_400_000);
  return { pending: true, daysRemaining: Math.max(0, DELETION_GRACE_DAYS - elapsedDays) };
}
