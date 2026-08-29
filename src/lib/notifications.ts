/**
 * Behavior-triggered local notifications.
 *
 * Per design decision: K-Journey only fires on
 *   - D-30 / D-14 / D-7 milestones (computed from departureDate)
 *   - Phase transitions (when date crosses a boundary)
 *   - Byeongpung panel unlocks (immediate, fired from completion flow)
 *
 * No daily reminders, no marketing pushes.
 */

import * as Notifications from 'expo-notifications';
import { kstNow, scheduleAtKstMorning, toKstStartOfDay } from './dates';
import { getJson, setJson, KEYS, storage } from './storage';
import { PUSH_COPY } from './notifications/copy';
import { getCrashlytics, recordError } from '@react-native-firebase/crashlytics';

export { PUSH_COPY, PUSH_PRIMING } from './notifications/copy';
export type { PushCategory } from './notifications/copy';

export const SETTINGS_KEYS = {
  dDay30: 'settings:notifications:dDay30',
  dDay14: 'settings:notifications:dDay14',
  dDay7: 'settings:notifications:dDay7',
  phaseTransitions: 'settings:notifications:phaseTransitions',
  panelUnlocks: 'settings:notifications:panelUnlocks',
} as const;

function isEnabled(key: string): boolean {
  // Default ON unless explicitly disabled in Settings.
  const raw = storage.getString(key);
  if (raw === undefined) return true;
  return raw === 'true';
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestPermission(): Promise<boolean> {
  const settings = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: true, allowSound: false },
  });
  return settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.AUTHORIZED;
}

export type PermissionState = 'granted' | 'denied' | 'undetermined';

export async function getPermissionState(): Promise<PermissionState> {
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.AUTHORIZED) {
    return 'granted';
  }
  if (settings.canAskAgain) return 'undetermined';
  return 'denied';
}

export interface ScheduleInput {
  arrivalDate: string;   // ISO YYYY-MM-DD
  departureDate: string;
}

export interface NotificationScheduleResult {
  complete: boolean;
  permissionGranted: boolean;
  cancelledExisting: boolean;
  scheduledCount: number;
  failureCount: number;
}

/**
 * Records a notification-scheduling failure to Crashlytics. The scheduler also
 * returns a partial result so an owning save flow cannot claim full success.
 * A missed reminder never blocks the underlying profile write.
 */
function recordScheduleError(e: unknown) {
  try {
    recordError(getCrashlytics(), e instanceof Error ? e : new Error(String(e)));
  } catch {
    // intentional swallow: Crashlytics unavailable; the failure stays silent.
  }
}

/** Clears journey reminders when a date becomes unknown. Failures remain best-effort but observable. */
export async function cancelScheduledJourneyNotifications(): Promise<boolean> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    return true;
  } catch (e) {
    recordScheduleError(e);
    return false;
  }
}

export async function rescheduleAllNotifications({
  arrivalDate,
  departureDate,
}: ScheduleInput): Promise<NotificationScheduleResult> {
  const cancelledExisting = await cancelScheduledJourneyNotifications();
  let scheduledCount = 0;
  let failureCount = cancelledExisting ? 0 : 1;

  let permissionGranted = false;
  try {
    permissionGranted = (await getPermissionState()) === 'granted';
  } catch (e) {
    failureCount += 1;
    recordScheduleError(e);
  }
  // If cancellation failed, adding a new set can leave duplicate reminders.
  // Stop here even when permission is granted; the caller surfaces the partial refresh.
  if (!cancelledExisting || !permissionGranted) {
    return {
      complete: false,
      permissionGranted,
      cancelledExisting,
      scheduledCount,
      failureCount,
    };
  }

  const today = kstNow();

  // A. D-30 / D-14 / D-7 milestones — fire at KST 09:00 (ADR-0022).
  const milestoneSlots: { days: number; key: keyof typeof SETTINGS_KEYS; copy: typeof PUSH_COPY.dDay30 }[] = [
    { days: 30, key: 'dDay30', copy: PUSH_COPY.dDay30 },
    { days: 14, key: 'dDay14', copy: PUSH_COPY.dDay14 },
    { days: 7, key: 'dDay7', copy: PUSH_COPY.dDay7 },
  ];
  for (const slot of milestoneSlots) {
    if (!isEnabled(SETTINGS_KEYS[slot.key])) continue;
    const fireDate = scheduleAtKstMorning(departureDate, slot.days);
    if (fireDate > today) {
      try {
        await Notifications.scheduleNotificationAsync({
          content: { title: slot.copy.title, body: slot.copy.body },
          trigger: { type: 'date', date: fireDate } as Notifications.DateTriggerInput,
        });
        scheduledCount += 1;
      } catch (e) {
        failureCount += 1;
        recordScheduleError(e);
      }
    }
  }

  // B. Phase transitions — fire at KST 09:00 on the relevant calendar day.
  if (isEnabled(SETTINGS_KEYS.phaseTransitions)) {
    const arrivalMidnight = toKstStartOfDay(arrivalDate);
    const phaseDates = [
      { fire: scheduleAtKstMorning(arrivalDate, 0), copy: PUSH_COPY.phase2Start },
      { fire: scheduleAtKstMorning(arrivalMidnight, -8), copy: PUSH_COPY.phase3Start },
      { fire: scheduleAtKstMorning(departureDate, 20), copy: PUSH_COPY.phase4Start },
    ];
    for (const phase of phaseDates) {
      if (phase.fire > today) {
        try {
          await Notifications.scheduleNotificationAsync({
            content: { title: phase.copy.title, body: phase.copy.body },
            trigger: { type: 'date', date: phase.fire } as Notifications.DateTriggerInput,
          });
          scheduledCount += 1;
        } catch (e) {
          failureCount += 1;
          recordScheduleError(e);
        }
      }
    }
  }

  return {
    complete: permissionGranted && cancelledExisting && failureCount === 0,
    permissionGranted,
    cancelledExisting,
    scheduledCount,
    failureCount,
  };
}

export async function fireImmediate(title: string, body: string) {
  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: null,
  });
}

/**
 * Fired immediately when the user crosses a 6-completion threshold and
 * a new byeongpung panel is unlocked. Best-effort — never throws.
 * Caller must gate through `claimPanelUnlock(n)` (ADR-0009). `eraNameEn`
 * preserved for the function signature but no longer used in the catalog
 * copy (ADR-0029 — body is identical across panels).
 */
export async function firePanelUnlock(panelNumber: number, _eraNameEn?: string) {
  try {
    if (!isEnabled(SETTINGS_KEYS.panelUnlocks)) return;
    const granted = await Notifications.getPermissionsAsync();
    if (!granted.granted) return;
    const copy = PUSH_COPY.panelUnlock(panelNumber);
    await fireImmediate(copy.title, copy.body);
  } catch (e) {
    // Never block the UI on a notification error — record and move on (PRD §7.6).
    recordScheduleError(e);
  }
}

/**
 * Returns true the FIRST time the user crosses panelN's threshold and records it.
 * Subsequent calls for the same panel return false. Used to gate the
 * mission-complete celebration overlay, panel_unlock analytics, and the
 * notification — so toggling an item off and back on cannot re-fire any of them.
 */
export function claimPanelUnlock(panelNumber: number): boolean {
  const fired = getJson<number[]>(KEYS.firedPanelUnlocks) ?? [];
  if (fired.includes(panelNumber)) return false;
  fired.push(panelNumber);
  setJson(KEYS.firedPanelUnlocks, fired);
  return true;
}

export function hasFiredPanelUnlock(panelNumber: number): boolean {
  const fired = getJson<number[]>(KEYS.firedPanelUnlocks) ?? [];
  return fired.includes(panelNumber);
}
