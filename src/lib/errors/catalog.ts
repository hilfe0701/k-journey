/** Current local-first user-facing error and status catalog. */

export type ErrorTier = 'T1' | 'T2' | 'T3' | 'T4' | 'inline' | 'silent';

export interface ErrorRow {
  readonly code: string;
  readonly tier: ErrorTier;
  readonly title?: string;
  readonly body: string;
  readonly primaryCta?: string;
  readonly secondaryCta?: string;
  readonly autoDismissMs?: number;
}

export const ERROR_CATALOG: Record<string, ErrorRow> = {
  'network-offline': {
    code: 'network-offline',
    tier: 'T1',
    body: 'No connection. Your work is saved on this device.',
    primaryCta: 'Retry',
    autoDismissMs: 6000,
  },
  'network-timeout': {
    code: 'network-timeout',
    tier: 'T2',
    title: "Couldn't finish",
    body: 'The request took too long to respond.',
    primaryCta: 'Try again',
    secondaryCta: 'Cancel',
  },
  'validation-arrival-after-departure': {
    code: 'validation-arrival-after-departure',
    tier: 'inline',
    body: 'Arrival date must be before departure date.',
  },
  'validation-departure-too-soon': {
    code: 'validation-departure-too-soon',
    tier: 'inline',
    body: 'Pick a departure date at least 7 days after arrival.',
  },
  'permission-photos-denied': {
    code: 'permission-photos-denied',
    tier: 'T3',
    title: 'Photos access needed',
    body: 'Allow photo-library access to save this image.',
    primaryCta: 'Open Settings',
    secondaryCta: 'Not now',
  },
  'permission-notifications-denied': {
    code: 'permission-notifications-denied',
    tier: 'T3',
    title: 'Notifications are off',
    body: 'Turn on notifications to get D-Day and panel-unlock reminders.',
    primaryCta: 'Open Settings',
    secondaryCta: 'Not now',
  },
  'clock-jump': {
    code: 'clock-jump',
    tier: 'T4',
    title: 'Clock changed',
    body: 'Your device clock changed unexpectedly. Phase progress uses Korea time.',
    primaryCta: 'Got it',
  },
  'profile-updated': {
    code: 'profile-updated',
    tier: 'T1',
    body: 'Profile updated.',
    autoDismissMs: 4000,
  },
  'dates-updated': {
    code: 'dates-updated',
    tier: 'T1',
    body: 'Dates updated. Reminders rescheduled.',
    autoDismissMs: 4000,
  },
  'dates-updated-notifications-off': {
    code: 'dates-updated-notifications-off',
    tier: 'T1',
    body: 'Dates updated. Notifications are off.',
    autoDismissMs: 5000,
  },
  'dates-updated-reminder-warning': {
    code: 'dates-updated-reminder-warning',
    tier: 'T1',
    body: 'Dates updated. The reminder schedule could not be fully refreshed.',
    autoDismissMs: 6000,
  },
  'notification-pref-updated-notifications-off': {
    code: 'notification-pref-updated-notifications-off',
    tier: 'T1',
    body: 'Notification preference saved. System notifications are off.',
    autoDismissMs: 5000,
  },
  'notification-pref-updated-reminder-warning': {
    code: 'notification-pref-updated-reminder-warning',
    tier: 'T1',
    body: 'Notification preference saved. The reminder schedule could not be fully refreshed.',
    autoDismissMs: 6000,
  },
  'phase-changed': {
    code: 'phase-changed',
    tier: 'T2',
    title: 'Phase changed',
    body: 'Your new dates moved you to a different phase. Existing missions stay completed.',
    primaryCta: 'Got it',
  },
  unknown: {
    code: 'unknown',
    tier: 'T2',
    title: "Couldn't complete that",
    body: 'Something went wrong. Try again.',
    primaryCta: 'Try again',
    secondaryCta: 'Cancel',
  },
};

/** Resolve explicit catalog codes and a small set of transport-shaped errors. */
export function resolveErrorRow(input: unknown): ErrorRow {
  if (typeof input === 'string' && ERROR_CATALOG[input]) return ERROR_CATALOG[input];
  if (input && typeof input === 'object') {
    const error = input as { code?: string; message?: string };
    if (error.code && ERROR_CATALOG[error.code]) return ERROR_CATALOG[error.code];
    if (error.message) {
      if (/network request failed|offline|no connection/i.test(error.message)) {
        return ERROR_CATALOG['network-offline'];
      }
      if (/timed? out/i.test(error.message)) return ERROR_CATALOG['network-timeout'];
    }
  }
  return ERROR_CATALOG.unknown;
}
