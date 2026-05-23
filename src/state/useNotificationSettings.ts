/**
 * Per-category notification preferences (docs/SETTINGS.md §1).
 *
 * Each toggle controls whether that push category is scheduled. Default ON —
 * absence of a key in MMKV means "enabled". OFF only when the user explicitly
 * disables it in Settings. These flags are read by
 * `rescheduleAllNotifications` and `firePanelUnlock` in src/lib/notifications.ts.
 *
 * Storage: MMKV mirror only for MVP. Future: round-trip to
 * `users/{uid}/settings/notifications.{code}` (ADR-0032).
 */

import { useMMKVString } from 'react-native-mmkv';
import { storage } from '../lib/storage';
import { SETTINGS_KEYS } from '../lib/notifications';

export type NotificationPrefKey = keyof typeof SETTINGS_KEYS;

function read(key: string): boolean {
  const raw = storage.getString(key);
  if (raw === undefined) return true;
  return raw === 'true';
}

export function getNotificationPref(key: NotificationPrefKey): boolean {
  return read(SETTINGS_KEYS[key]);
}

export function setNotificationPref(key: NotificationPrefKey, value: boolean) {
  storage.set(SETTINGS_KEYS[key], value ? 'true' : 'false');
}

export function useNotificationPref(key: NotificationPrefKey): [boolean, (v: boolean) => void] {
  const [raw, setRaw] = useMMKVString(SETTINGS_KEYS[key], storage);
  const value = raw === undefined ? true : raw === 'true';
  return [value, (v: boolean) => setRaw(v ? 'true' : 'false')];
}
