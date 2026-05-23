/**
 * Firebase services initialization (modular API — RNFB v22-ready).
 *
 * Native modules from @react-native-firebase/* auto-initialize on app start
 * because plugins are registered in app.json. This file is the typed wrapper
 * for Firestore reads/writes that the rest of the app uses.
 *
 * NOTE: Requires GoogleService-Info.plist (iOS) and google-services.json (Android)
 * at project root. Generate them in Firebase Console → Project Settings.
 */

import type { FirebaseAuthTypes } from '@react-native-firebase/auth';
import {
  getFirestore,
  doc,
  collection,
  setDoc,
  getDoc,
  deleteDoc,
  deleteField,
  runTransaction,
  serverTimestamp,
  type FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';

import { storage as mmkv, KEYS, getJson, setJson } from './storage';
import { BucketTemplateKey } from '../data/bucketTemplates';

const db = () => getFirestore();

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

function isDevMock(): boolean {
  return __DEV__ && (mmkv.getBoolean(KEYS.devMockAuth) ?? false);
}

// ─────────────────────────────────────────────────────────────────────────────
// User profile shape stored in Firestore at users/{uid}
// ─────────────────────────────────────────────────────────────────────────────
export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoUrl: string | null;
  university: string | null;
  stayType: 'exchange-1' | 'exchange-2' | 'language' | 'working-holiday' | null;
  housing: 'dormitory' | 'off-campus' | null;
  arrivalDate: string | null;       // ISO date YYYY-MM-DD
  departureDate: string | null;
  era: 'joseon' | 'silla' | 'goryeo' | null;
  onboardingCompletedAt: string | null;
  createdAt: FirebaseFirestoreTypes.Timestamp | null;
  /** Account-lifecycle markers (ADR-0033). Written only via the dedicated
   *  request/cancel mutators below — never patched through updateUserProfile. */
  _meta?: {
    deletionRequestedAt?: FirebaseFirestoreTypes.Timestamp | string | null;
    exportRequestedAt?: FirebaseFirestoreTypes.Timestamp | string | null;
  } | null;
}

export const userDoc = (uid: string) => doc(db(), 'users', uid);

export const completedMissionsCollection = (uid: string) =>
  collection(userDoc(uid), 'completedMissions');

export const bucketsCollection = (uid: string) =>
  collection(userDoc(uid), 'buckets');

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
export async function ensureUserDocument(user: FirebaseAuthTypes.User): Promise<void> {
  const ref = userDoc(user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists) {
    await setDoc(ref, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoUrl: user.photoURL,
      university: null,
      stayType: null,
      housing: null,
      arrivalDate: null,
      departureDate: null,
      era: null,
      onboardingCompletedAt: null,
      createdAt: serverTimestamp(),
    });
  }
}

export async function updateUserProfile(uid: string, patch: Partial<UserProfile>): Promise<void> {
  if (isDevMock()) {
    const current = getJson<UserProfile>(KEYS.profileCache);
    const merged: UserProfile = current
      ? { ...current, ...patch }
      : ({ uid, ...patch } as UserProfile);
    setJson(KEYS.profileCache, merged);
    return;
  }
  await setDoc(userDoc(uid), patch, { merge: true });
}

// ─────────────────────────────────────────────────────────────────────────────
// Account-lifecycle markers — users/{uid}._meta (ADR-0033, GDPR / PIPA)
//
// Written with serverTimestamp() so the reaper Cloud Function's age query
// cannot be gamed by a client clock (CLAUDE.md NEVER #21). Dev-mock branches
// to MMKV — a missing branch leaves the Firestore offline queue spinning
// forever with no error (project memory: feedback_devmock_mutator_required).
// ─────────────────────────────────────────────────────────────────────────────

/** Coerce a _meta timestamp (Firestore Timestamp | ISO string | null) to a Date. */
export function metaTimestampToDate(value: unknown): Date | null {
  if (!value) return null;
  if (typeof value === 'string') {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof value === 'object') {
    const ts = value as { toDate?: () => Date; seconds?: number };
    if (typeof ts.toDate === 'function') return ts.toDate();
    if (typeof ts.seconds === 'number') return new Date(ts.seconds * 1000);
  }
  return null;
}

/** Schedules soft-deletion — the 30-day grace window starts now (ADR-0033 §A). */
export async function requestAccountDeletion(uid: string): Promise<void> {
  if (isDevMock()) {
    const current = getJson<UserProfile>(KEYS.profileCache);
    setJson(KEYS.profileCache, {
      ...(current ?? ({ uid } as UserProfile)),
      _meta: { ...(current?._meta ?? {}), deletionRequestedAt: new Date().toISOString() },
    } as UserProfile);
    return;
  }
  await setDoc(userDoc(uid), { _meta: { deletionRequestedAt: serverTimestamp() } }, { merge: true });
}

/** Cancels a pending soft-deletion within the grace window (ADR-0033 §C). */
export async function cancelAccountDeletion(uid: string): Promise<void> {
  if (isDevMock()) {
    const current = getJson<UserProfile>(KEYS.profileCache);
    if (current?._meta) {
      const restMeta = { ...current._meta };
      delete restMeta.deletionRequestedAt;
      setJson(KEYS.profileCache, { ...current, _meta: restMeta } as UserProfile);
    }
    return;
  }
  await setDoc(userDoc(uid), { _meta: { deletionRequestedAt: deleteField() } }, { merge: true });
}

/** Queues a data export — the generateExport Cloud Function triggers on this write (ADR-0033 §B). */
export async function requestDataExport(uid: string): Promise<void> {
  if (isDevMock()) {
    const current = getJson<UserProfile>(KEYS.profileCache);
    setJson(KEYS.profileCache, {
      ...(current ?? ({ uid } as UserProfile)),
      _meta: { ...(current?._meta ?? {}), exportRequestedAt: new Date().toISOString() },
    } as UserProfile);
    return;
  }
  await setDoc(userDoc(uid), { _meta: { exportRequestedAt: serverTimestamp() } }, { merge: true });
}

export async function markMissionComplete(
  uid: string,
  missionId: string,
): Promise<void> {
  if (isDevMock()) {
    const list = getJson<DevMockCompletedDoc[]>(KEYS.devMockMissions) ?? [];
    if (!list.find((d) => d.missionId === missionId)) {
      list.unshift({ missionId, completedAtIso: new Date().toISOString() });
      setJson(KEYS.devMockMissions, list);
    }
    return;
  }
  await setDoc(doc(completedMissionsCollection(uid), missionId), {
    missionId,
    completedAt: serverTimestamp(),
  });
}

export async function unmarkMission(uid: string, missionId: string): Promise<void> {
  if (isDevMock()) {
    const list = getJson<DevMockCompletedDoc[]>(KEYS.devMockMissions) ?? [];
    const next = list.filter((d) => d.missionId !== missionId);
    setJson(KEYS.devMockMissions, next);
    return;
  }
  await deleteDoc(doc(completedMissionsCollection(uid), missionId));
}

// ─────────────────────────────────────────────────────────────────────────────
// Bucket (Want To) CRUD
// ─────────────────────────────────────────────────────────────────────────────

function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function readMockBuckets(): Bucket[] {
  return getJson<Bucket[]>(KEYS.devMockBuckets) ?? [];
}

function writeMockBuckets(list: Bucket[]) {
  setJson(KEYS.devMockBuckets, list);
}

export interface CreateBucketInput {
  themeName: string;
  templateKey: BucketTemplateKey;
  maxItems: number;
  initialItems: string[];
}

export async function createBucket(uid: string, input: CreateBucketInput): Promise<Bucket> {
  const bucket: Bucket = {
    id: newId('bkt'),
    themeName: input.themeName.trim(),
    templateKey: input.templateKey,
    maxItems: input.maxItems,
    items: input.initialItems
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .slice(0, input.maxItems)
      .map((text) => ({ id: newId('itm'), text, completedAtIso: null })),
    createdAtIso: new Date().toISOString(),
  };

  if (isDevMock()) {
    const list = readMockBuckets();
    list.unshift(bucket);
    writeMockBuckets(list);
    return bucket;
  }

  await setDoc(doc(bucketsCollection(uid), bucket.id), {
    ...bucket,
    createdAt: serverTimestamp(),
  });
  return bucket;
}

export async function deleteBucket(uid: string, bucketId: string): Promise<void> {
  if (isDevMock()) {
    writeMockBuckets(readMockBuckets().filter((b) => b.id !== bucketId));
    return;
  }
  await deleteDoc(doc(bucketsCollection(uid), bucketId));
}

export async function addBucketItem(
  uid: string,
  bucketId: string,
  text: string,
): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed) return;

  if (isDevMock()) {
    const list = readMockBuckets();
    const idx = list.findIndex((b) => b.id === bucketId);
    if (idx < 0) return;
    const bucket = list[idx];
    if (bucket.items.length >= bucket.maxItems) return;
    bucket.items = [...bucket.items, { id: newId('itm'), text: trimmed, completedAtIso: null }];
    list[idx] = bucket;
    writeMockBuckets(list);
    return;
  }

  const ref = doc(bucketsCollection(uid), bucketId);
  await runTransaction(db(), async (tx) => {
    const snap = await tx.get(ref);
    const data = snap.data() as Bucket | undefined;
    if (!data) return;
    if (data.items.length >= data.maxItems) return;
    const items = [...data.items, { id: newId('itm'), text: trimmed, completedAtIso: null }];
    tx.update(ref, { items });
  });
}

export async function toggleBucketItem(
  uid: string,
  bucketId: string,
  itemId: string,
): Promise<{ wasCompleted: boolean; nextCompletedCount: number } | null> {
  if (isDevMock()) {
    const list = readMockBuckets();
    const idx = list.findIndex((b) => b.id === bucketId);
    if (idx < 0) return null;
    const bucket = list[idx];
    let wasCompleted = false;
    bucket.items = bucket.items.map((it) => {
      if (it.id !== itemId) return it;
      wasCompleted = !!it.completedAtIso;
      return {
        ...it,
        completedAtIso: it.completedAtIso ? null : new Date().toISOString(),
      };
    });
    const nextCompletedCount = bucket.items.filter((it) => it.completedAtIso).length;
    list[idx] = bucket;
    writeMockBuckets(list);
    return { wasCompleted, nextCompletedCount };
  }

  const ref = doc(bucketsCollection(uid), bucketId);
  return runTransaction(db(), async (tx) => {
    const snap = await tx.get(ref);
    const data = snap.data() as Bucket | undefined;
    if (!data) return null;
    let wasCompleted = false;
    const items = data.items.map((it) => {
      if (it.id !== itemId) return it;
      wasCompleted = !!it.completedAtIso;
      return {
        ...it,
        completedAtIso: it.completedAtIso ? null : new Date().toISOString(),
      };
    });
    const nextCompletedCount = items.filter((it) => it.completedAtIso).length;
    tx.update(ref, { items });
    return { wasCompleted, nextCompletedCount };
  });
}

export async function deleteBucketItem(
  uid: string,
  bucketId: string,
  itemId: string,
): Promise<void> {
  if (isDevMock()) {
    const list = readMockBuckets();
    const idx = list.findIndex((b) => b.id === bucketId);
    if (idx < 0) return;
    list[idx] = { ...list[idx], items: list[idx].items.filter((it) => it.id !== itemId) };
    writeMockBuckets(list);
    return;
  }
  const ref = doc(bucketsCollection(uid), bucketId);
  await runTransaction(db(), async (tx) => {
    const snap = await tx.get(ref);
    const data = snap.data() as Bucket | undefined;
    if (!data) return;
    tx.update(ref, { items: data.items.filter((it) => it.id !== itemId) });
  });
}
