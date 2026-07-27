/**
 * Local journey data access.
 *
 * The filename is retained for import compatibility with the first slice, but
 * this module deliberately has no Firebase Auth, Firestore, or Storage path.
 * Firebase remains available to the app's platform services (for example
 * Crashlytics); journey state is stored on this device through MMKV.
 */

import { BucketTemplateKey } from '../data/bucketTemplates';
import { kstNow } from './dates';
import { getJson, KEYS, setJson, storage } from './storage';

export const LOCAL_PROFILE_ID = 'local-profile';

/** Explicitly unknown is a condition value, not an omitted/null field. */
export const UNKNOWN = 'unknown' as const;
export type UnknownValue = typeof UNKNOWN;

export type ProgramType = 'exchange' | 'visiting' | UnknownValue;
export type VisaTypeOrStatus =
  | 'D-2-6'
  | 'D-2-8'
  | 'visa_free'
  | 'other'
  | UnknownValue;
export type HousingType =
  | 'dormitory'
  | 'own_lease'
  | 'third_party_lease'
  | 'registered_business'
  | UnknownValue;
export type ContractHolder = 'self' | 'third_party' | 'none' | 'undecided' | 'n_a' | UnknownValue;
export type HomeCountryInsurance = 'yes' | 'no' | UnknownValue;
export type ResidenceCardStatus =
  | 'not_started'
  | 'booked'
  | 'submitted'
  | 'issued'
  | 'rejected'
  | 'n_a'
  | UnknownValue;

export type ConditionAxis =
  | 'universityId'
  | 'programType'
  | 'visaTypeOrStatus'
  | 'housingType'
  | 'contractHolder'
  | 'totalStayDays'
  | 'nationality'
  | 'homeCountryInsurance'
  | 'residenceCardStatus'
  | 'arrivalDate'
  | 'departureDate'
  | 'programStartDate';

export interface UserProfile {
  uid: string;
  email: null;
  displayName: string | null;
  photoUrl: null;
  university: string | null;
  stayType: 'exchange-1' | 'exchange-2' | 'language' | 'working-holiday' | null;
  housing: 'dormitory' | 'off-campus' | null;
  /** Condition axes. `UNKNOWN` is intentionally persisted as a value. */
  universityId: string | UnknownValue;
  programType: ProgramType;
  visaTypeOrStatus: VisaTypeOrStatus;
  housingType: HousingType;
  contractHolder: ContractHolder;
  totalStayDays: number | UnknownValue;
  nationality: string | UnknownValue;
  homeCountryInsurance: HomeCountryInsurance;
  residenceCardStatus: ResidenceCardStatus;
  arrivalDate: (string | UnknownValue) | null;
  departureDate: (string | UnknownValue) | null;
  programStartDate: string | UnknownValue;
  era: 'joseon' | 'silla' | 'goryeo' | null;
  onboardingCompletedAt: string | null;
  createdAt: string | null;
}

export type ConditionProfile = Pick<UserProfile, ConditionAxis>;

export interface DevMockCompletedDoc {
  missionId: string;
  completedAtIso: string;
}

export interface BucketItem {
  id: string;
  text: string;
  completedAtIso: string | null;
}

export interface Bucket {
  id: string;
  themeName: string;
  templateKey: BucketTemplateKey;
  maxItems: number;
  items: BucketItem[];
  createdAtIso: string;
}

const EMPTY_PROFILE: UserProfile = {
  uid: LOCAL_PROFILE_ID,
  email: null,
  displayName: null,
  photoUrl: null,
  university: null,
  stayType: null,
  housing: null,
  universityId: UNKNOWN,
  programType: UNKNOWN,
  visaTypeOrStatus: UNKNOWN,
  housingType: UNKNOWN,
  contractHolder: UNKNOWN,
  totalStayDays: UNKNOWN,
  nationality: UNKNOWN,
  homeCountryInsurance: UNKNOWN,
  residenceCardStatus: UNKNOWN,
  arrivalDate: null,
  departureDate: null,
  // I02 migration/default policy is intentionally deferred: the existing date
  // fields remain null until the later onboarding slice owns date collection.
  programStartDate: UNKNOWN,
  era: null,
  onboardingCompletedAt: null,
  createdAt: null,
};

export async function updateUserProfile(patch: Partial<UserProfile>): Promise<void> {
  const current = getJson<UserProfile>(KEYS.profileCache) ?? EMPTY_PROFILE;
  setJson(KEYS.profileCache, { ...current, ...patch, uid: LOCAL_PROFILE_ID });
}

export async function markMissionComplete(missionId: string): Promise<void> {
  const list = getJson<DevMockCompletedDoc[]>(KEYS.completedMissionsCache) ?? [];
  if (list.some((item) => item.missionId === missionId)) return;
  list.unshift({ missionId, completedAtIso: kstNow().toISOString() });
  setJson(KEYS.completedMissionsCache, list);
}

export async function unmarkMission(missionId: string): Promise<void> {
  const list = getJson<DevMockCompletedDoc[]>(KEYS.completedMissionsCache) ?? [];
  setJson(KEYS.completedMissionsCache, list.filter((item) => item.missionId !== missionId));
}

function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function readBuckets(): Bucket[] {
  return getJson<Bucket[]>(KEYS.bucketsCache) ?? [];
}

function writeBuckets(list: Bucket[]): void {
  setJson(KEYS.bucketsCache, list);
}

export interface CreateBucketInput {
  themeName: string;
  templateKey: BucketTemplateKey;
  maxItems: number;
  initialItems: string[];
}

export async function createBucket(input: CreateBucketInput): Promise<Bucket> {
  const bucket: Bucket = {
    id: newId('bkt'),
    themeName: input.themeName.trim(),
    templateKey: input.templateKey,
    maxItems: input.maxItems,
    items: input.initialItems
      .map((text) => text.trim())
      .filter((text) => text.length > 0)
      .slice(0, input.maxItems)
      .map((text) => ({ id: newId('itm'), text, completedAtIso: null })),
    createdAtIso: kstNow().toISOString(),
  };
  const list = readBuckets();
  list.unshift(bucket);
  writeBuckets(list);
  return bucket;
}

export async function deleteBucket(bucketId: string): Promise<void> {
  writeBuckets(readBuckets().filter((bucket) => bucket.id !== bucketId));
}

export async function addBucketItem(bucketId: string, text: string): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed) return;
  const list = readBuckets();
  const index = list.findIndex((bucket) => bucket.id === bucketId);
  if (index < 0) return;
  const bucket = list[index];
  if (bucket.items.length >= bucket.maxItems) return;
  list[index] = {
    ...bucket,
    items: [...bucket.items, { id: newId('itm'), text: trimmed, completedAtIso: null }],
  };
  writeBuckets(list);
}

export async function toggleBucketItem(
  bucketId: string,
  itemId: string,
): Promise<{ wasCompleted: boolean; nextCompletedCount: number } | null> {
  const list = readBuckets();
  const index = list.findIndex((bucket) => bucket.id === bucketId);
  if (index < 0) return null;
  const bucket = list[index];
  let wasCompleted = false;
  const items = bucket.items.map((item) => {
    if (item.id !== itemId) return item;
    wasCompleted = !!item.completedAtIso;
    return {
      ...item,
      completedAtIso: item.completedAtIso ? null : kstNow().toISOString(),
    };
  });
  list[index] = { ...bucket, items };
  writeBuckets(list);
  return {
    wasCompleted,
    nextCompletedCount: items.filter((item) => item.completedAtIso).length,
  };
}

export async function deleteBucketItem(bucketId: string, itemId: string): Promise<void> {
  const list = readBuckets();
  const index = list.findIndex((bucket) => bucket.id === bucketId);
  if (index < 0) return;
  list[index] = {
    ...list[index],
    items: list[index].items.filter((item) => item.id !== itemId),
  };
  writeBuckets(list);
}

/** Clears all local journey state for the development reset control. */
export function clearLocalJourneyData(): void {
  [
    KEYS.profileCache,
    KEYS.completedMissionsCache,
    KEYS.bucketsCache,
    KEYS.firedPanelUnlocks,
    KEYS.lastSeenPhase,
    KEYS.lastFiredDDayMilestones,
    KEYS.phaseOverride,
    KEYS.galleryDismissed,
  ].forEach((key) => storage.delete(key));
}
