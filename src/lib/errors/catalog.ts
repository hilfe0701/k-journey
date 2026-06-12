/**
 * Error code catalog. Single source of every user-facing error string.
 * Authority: docs/ERROR_MESSAGES.md, ADR-0012 (mutator contract), ADR-0028
 * (4-tier router). Voice: docs/MICROCOPY.md.
 *
 * Tiers:
 *   T1 — toast (transient, auto-dismissable)
 *   T2 — modal (blocking, must acknowledge)
 *   T3 — settings deep-link (permission etc, Linking.openSettings())
 *   T4 — app-level banner (session-wide; sticks until resolved)
 *   inline — caller renders inline copy; router does not surface
 *   silent — no surface
 */

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
  // A. Network & connectivity
  'network-offline': {
    code: 'network-offline',
    tier: 'T1',
    body: 'No connection. Your work is saved on this device.',
    primaryCta: 'Retry',
    autoDismissMs: 6000,
  },
  'network-slow': {
    code: 'network-slow',
    tier: 'T1',
    body: 'Network is slow. Hang on.',
    autoDismissMs: 4000,
  },
  'network-timeout': {
    code: 'network-timeout',
    tier: 'T2',
    title: "Couldn't save",
    body: 'The network took too long to respond.',
    primaryCta: 'Try again',
    secondaryCta: 'Discard',
  },

  // B. Authentication
  'auth-cancelled': {
    code: 'auth-cancelled',
    tier: 'silent',
    body: '',
  },
  'auth-failed': {
    code: 'auth-failed',
    tier: 'T2',
    title: "Sign-in didn't work",
    body: 'Something blocked the sign-in. Try once more.',
    primaryCta: 'Try again',
    secondaryCta: 'Cancel',
  },
  'auth-expired': {
    code: 'auth-expired',
    tier: 'T4',
    title: 'Signed out',
    body: 'Your sign-in session ended. Sign in to continue.',
    primaryCta: 'Sign in',
  },
  'auth-no-account': {
    code: 'auth-no-account',
    tier: 'T2',
    title: 'No account found',
    body: "We couldn't find a K-Journey account for this Apple ID.",
    primaryCta: 'Try a different sign-in',
    secondaryCta: 'Cancel',
  },

  // C. Firestore — saves
  'save-failed': {
    code: 'save-failed',
    tier: 'T2',
    title: "Couldn't save",
    body: 'Something went wrong saving your change.',
    primaryCta: 'Try again',
    secondaryCta: 'Discard',
  },
  'quota-exceeded': {
    code: 'quota-exceeded',
    tier: 'T1',
    body: 'Server is busy. Trying again in a moment.',
    primaryCta: 'Retry now',
    autoDismissMs: 6000,
  },
  'firestore-rules-fail': {
    code: 'firestore-rules-fail',
    tier: 'T4',
    title: 'Sign-in needed',
    body: 'Sign in to keep saving your journey.',
    primaryCta: 'Sign in',
  },
  'firestore-rules-fail-owner': {
    code: 'firestore-rules-fail-owner',
    tier: 'T2',
    title: "Couldn't save",
    body: "This data isn't yours to change.",
    primaryCta: 'OK',
  },
  'firestore-not-found': {
    code: 'firestore-not-found',
    tier: 'T1',
    body: 'That item is no longer there.',
    autoDismissMs: 4000,
  },

  // D. Firestore — reads
  'read-failed': {
    code: 'read-failed',
    tier: 'T1',
    body: "Couldn't refresh. Showing what we have.",
    primaryCta: 'Retry',
    autoDismissMs: 6000,
  },
  'read-failed-empty': {
    code: 'read-failed-empty',
    tier: 'T2',
    title: "Couldn't load your data",
    body: "We couldn't reach the server. Try again in a moment.",
    primaryCta: 'Try again',
    secondaryCta: 'Sign out',
  },

  // E. Validation (inline — caller renders directly)
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
  'validation-name-empty': {
    code: 'validation-name-empty',
    tier: 'inline',
    body: 'Add a name so we can greet you.',
  },
  'validation-photo-too-large': {
    code: 'validation-photo-too-large',
    tier: 'T1',
    body: 'Photo is too large. Try a smaller one.',
    autoDismissMs: 4000,
  },

  // F. Permissions
  'permission-photos-denied': {
    code: 'permission-photos-denied',
    tier: 'T3',
    title: 'Photos access needed',
    body: 'Allow photos access to attach a photo to this mission.',
    primaryCta: 'Open Settings',
    secondaryCta: 'Not now',
  },
  'permission-camera-denied': {
    code: 'permission-camera-denied',
    tier: 'T3',
    title: 'Camera access needed',
    body: 'Allow camera access to take a photo here.',
    primaryCta: 'Open Settings',
    secondaryCta: 'Not now',
  },
  'permission-notifications-denied': {
    code: 'permission-notifications-denied',
    tier: 'T3',
    title: 'Notifications are off',
    body: 'Turn on notifications to get D-Day and panel-unlock pings.',
    primaryCta: 'Open Settings',
    secondaryCta: 'Not now',
  },
  'permission-notifications-undetermined': {
    code: 'permission-notifications-undetermined',
    // Priming UI owns this state (ADR-0029) — router produces no surface.
    tier: 'inline',
    body: "We'll only ping you for big moments.",
  },

  // G. Time & clock
  'clock-jump': {
    code: 'clock-jump',
    tier: 'T4',
    title: 'Clock changed',
    body: 'Your device clock changed by more than a day. Phase progress uses Korea time.',
    primaryCta: 'Got it',
  },
  'clock-future': {
    code: 'clock-future',
    tier: 'T4',
    title: 'Date looks wrong',
    body: "Your device clock is set in the future. Phase progress is paused until it's fixed.",
    primaryCta: 'Got it',
  },

  // H. Media & assets
  'image-load-fail': {
    code: 'image-load-fail',
    tier: 'inline',
    body: 'Image unavailable',
  },
  'image-upload-fail': {
    code: 'image-upload-fail',
    tier: 'T2',
    title: "Couldn't upload photo",
    body: "The upload didn't finish. Try again or skip the photo.",
    primaryCta: 'Try again',
    secondaryCta: 'Skip photo',
  },
  'byeongpung-asset-missing': {
    code: 'byeongpung-asset-missing',
    // PanelImage renders an era-default color fallback inline; no surface.
    tier: 'inline',
    body: 'Image unavailable',
  },

  // I. App-level / system
  'app-update-required': {
    code: 'app-update-required',
    tier: 'T4',
    title: 'Update needed',
    body: 'This version is no longer supported. Update to keep your journey going.',
    primaryCta: 'Open App Store',
  },
  'system-incident': {
    code: 'system-incident',
    tier: 'T4',
    title: 'Service is having a moment',
    body: "We're working on it. Your saved progress is safe.",
    primaryCta: 'Got it',
  },

  // J. Confirmations & status — not errors, but routed through the same
  // T1/T2 surface bus. See docs/ERROR_MESSAGES.md §J. Dynamic-body rows
  // (export-already-queued, phase-changed) accept a messageOverride.
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
  'onboarding-resumed': {
    code: 'onboarding-resumed',
    tier: 'T1',
    body: 'Picking up where you left off.',
    autoDismissMs: 4000,
  },
  'network-offline-recovered': {
    code: 'network-offline-recovered',
    tier: 'T1',
    body: 'Synced.',
    autoDismissMs: 3000,
  },
  'bucket-conflict': {
    code: 'bucket-conflict',
    tier: 'T1',
    body: 'Updated from another device.',
    autoDismissMs: 4000,
  },
  'account-deletion-scheduled': {
    code: 'account-deletion-scheduled',
    tier: 'T1',
    body: 'Account scheduled for deletion. Check your email.',
    autoDismissMs: 6000,
  },
  'account-restored': {
    code: 'account-restored',
    tier: 'T1',
    body: 'Account restored.',
    autoDismissMs: 4000,
  },
  'account-deleted': {
    code: 'account-deleted',
    tier: 'T1',
    body: 'Your account and data have been deleted.',
    autoDismissMs: 6000,
  },
  'export-queued': {
    code: 'export-queued',
    tier: 'T1',
    body: 'Export queued. Check your email shortly.',
    autoDismissMs: 6000,
  },
  'export-already-queued': {
    code: 'export-already-queued',
    tier: 'T2',
    title: 'Export already queued',
    body: 'Check your email — your last export is on its way.',
    primaryCta: 'OK',
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

/**
 * Resolves a thrown value or string code into an ErrorRow.
 *
 * Resolution order:
 *   1. If string and present in catalog → direct lookup
 *   2. If Error with `code` matching catalog → use it
 *   3. If Error with Firebase-shape `code` (e.g. `auth/network-request-failed`)
 *      → map via FIREBASE_CODE_MAP
 *   4. If Error.message contains a known marker → infer
 *   5. → `unknown`
 */
export function resolveErrorRow(input: unknown): ErrorRow {
  if (typeof input === 'string' && ERROR_CATALOG[input]) {
    return ERROR_CATALOG[input];
  }
  if (input && typeof input === 'object') {
    const err = input as { code?: string; message?: string };
    if (err.code && ERROR_CATALOG[err.code]) return ERROR_CATALOG[err.code];
    if (err.code && FIREBASE_CODE_MAP[err.code]) {
      const mapped = FIREBASE_CODE_MAP[err.code];
      if (ERROR_CATALOG[mapped]) return ERROR_CATALOG[mapped];
    }
    if (err.message) {
      if (/network request failed/i.test(err.message)) return ERROR_CATALOG['network-offline'];
      if (/timed? out/i.test(err.message)) return ERROR_CATALOG['network-timeout'];
    }
  }
  return ERROR_CATALOG.unknown;
}

const FIREBASE_CODE_MAP: Record<string, string> = {
  'firestore/permission-denied': 'firestore-rules-fail-owner',
  'firestore/not-found': 'firestore-not-found',
  'firestore/resource-exhausted': 'quota-exceeded',
  'firestore/unavailable': 'network-offline',
  'auth/network-request-failed': 'network-offline',
  'auth/user-not-found': 'auth-no-account',
  'auth/id-token-expired': 'auth-expired',
  'auth/user-cancelled': 'auth-cancelled',
  'storage/canceled': 'auth-cancelled',
  'storage/unknown': 'image-upload-fail',
};
