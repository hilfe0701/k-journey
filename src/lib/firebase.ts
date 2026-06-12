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
  getDocs,
  deleteDoc,
  writeBatch,
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
// Account deletion — client-side, immediate (replaces the ADR-0033 soft-delete;
// the reaper / export Cloud Functions were never built, so the old "request"
// flow only wrote a marker nothing acted on). Auth-account deletion + re-auth
// live in ./accountDeletion.ts; this wipes only the Firestore footprint.
// Dev-mock branches to MMKV — a missing branch leaves the Firestore offline
// queue spinning forever with no error (feedback_devmock_mutator_required).
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Permanently deletes the user's Firestore data: every completed-mission doc,
 * every bucket doc (items are array fields on the bucket — no subcollection to
 * sweep), then the user profile doc. Allowed by firestore.rules because the
 * caller owns the docs and the profile is not in a deletion-pending state.
 */
export async function deleteAccountData(uid: string): Promise<void> {
  if (isDevMock()) {
    setJson(KEYS.devMockMissions, []);
    setJson(KEYS.devMockBuckets, []);
    mmkv.delete(KEYS.profileCache);
    return;
  }
  const [missions, buckets] = await Promise.all([
    getDocs(completedMissionsCollection(uid)),
    getDocs(bucketsCollection(uid)),
  ]);
  const batch = writeBatch(db());
  missions.forEach((d) => batch.delete(d.ref));
  buckets.forEach((d) => batch.delete(d.ref));
  batch.delete(userDoc(uid));
  await batch.commit();
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
