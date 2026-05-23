/**
 * Async-mutator error surface (ADR-0012). Routes through the 4-tier catalog
 * in src/lib/errors/catalog.ts via the singleton bus in src/lib/errors/host.ts.
 * UI hosts (ToastHost) subscribe and render T1 toasts / T4 banners. T2/T3
 * render via Alert.
 *
 * Call sites use `showOperationError(action, error, options)`. Pass
 * `options.onPrimary` to make the T1 "Retry" / T2 "Try again" button re-run
 * the failed operation (ADR-0028 retry contract). `options.messageOverride`
 * substitutes a dynamic body for catalog rows with a placeholder value
 * (phase-changed, export-already-queued) — the rows stay static + testable.
 */

import { Alert, Linking } from 'react-native';
import { getCrashlytics, recordError } from '@react-native-firebase/crashlytics';
import { getAuth } from '@react-native-firebase/auth';

import { resolveErrorRow, ERROR_CATALOG, type ErrorRow } from './errors/catalog';
import { emitError } from './errors/host';

export interface SurfaceOptions {
  readonly contextAction?: string;
  /** Re-run the failed operation — wired to the T1 "Retry" / T2 "Try again"
   *  button. Without it those buttons only dismiss (ADR-0028). */
  readonly onPrimary?: () => void;
  readonly onSecondary?: () => void;
  /** Substitutes the catalog body for rows carrying a dynamic value. */
  readonly messageOverride?: string;
  /** The underlying thrown value when surfacing by code — recorded to
   *  Crashlytics so the catalog code doesn't lose the original error. */
  readonly cause?: unknown;
}

/**
 * Legacy surface — preserved for ADR-0012 call sites. Resolves the error
 * through the catalog and routes per the row's tier. When resolution falls
 * back to `unknown`, the title is composed from `action` for context.
 */
export function showOperationError(action: string, error: unknown, options?: SurfaceOptions) {
  recordSilently(error);

  let row = applyAuthContext(resolveErrorRow(error));
  if (row.code === 'unknown') {
    row = { ...row, title: `Couldn't ${action}` };
  }
  routeRow(row, { ...options, contextAction: action });
}

/**
 * Direct entry — surface a specific code without a wrapping action verb.
 * Use this for permission flows, banner-level events, confirmation toasts.
 */
export function surfaceError(codeOrError: string | unknown, options?: SurfaceOptions) {
  const resolved = typeof codeOrError === 'string'
    ? (ERROR_CATALOG[codeOrError] ?? resolveErrorRow(codeOrError))
    : resolveErrorRow(codeOrError);
  if (codeOrError instanceof Error) recordSilently(codeOrError);
  if (options?.cause !== undefined) recordSilently(options.cause);
  routeRow(applyAuthContext(resolved), options);
}

/**
 * ERROR_MESSAGES.md / ADR-0021 mapping: a Firestore permission-denied while
 * signed OUT is a "sign in again" banner (T4), not a "not yours" modal (T2).
 * `resolveErrorRow` is a pure function and can't see auth state, so the
 * signed-in/out split is applied here.
 */
function applyAuthContext(row: ErrorRow): ErrorRow {
  if (row.code === 'firestore-rules-fail-owner' && !isSignedIn()) {
    return ERROR_CATALOG['firestore-rules-fail'];
  }
  return row;
}

function isSignedIn(): boolean {
  try {
    return getAuth().currentUser != null;
  } catch {
    // intentional swallow: auth unavailable (tests / not initialized) — assume
    // signed in so the defensive T2 owner row is kept over a misleading banner.
    return true;
  }
}

function routeRow(row: ErrorRow, options?: SurfaceOptions) {
  const body = options?.messageOverride ?? row.body;
  switch (row.tier) {
    case 'T1':
    case 'T4':
      emitError(body === row.body ? row : { ...row, body }, options);
      return;
    case 'T2': {
      const buttons: { text: string; style?: 'cancel' | 'destructive'; onPress?: () => void }[] = [
        { text: row.primaryCta ?? 'OK', onPress: options?.onPrimary },
      ];
      if (row.secondaryCta) {
        buttons.push({
          text: row.secondaryCta,
          style: row.secondaryCta === 'Discard' ? 'destructive' : 'cancel',
          onPress: options?.onSecondary,
        });
      }
      Alert.alert(row.title ?? "Couldn't complete that", body, buttons);
      return;
    }
    case 'T3': {
      Alert.alert(
        row.title ?? 'Permission needed',
        body,
        [
          {
            text: row.secondaryCta ?? 'Not now',
            style: 'cancel',
            onPress: options?.onSecondary,
          },
          {
            text: row.primaryCta ?? 'Open Settings',
            onPress: () => {
              options?.onPrimary?.();
              Linking.openSettings().catch(() => {
                // intentional swallow: openSettings may fail on simulators.
              });
            },
          },
        ],
      );
      return;
    }
    case 'inline':
    case 'silent':
      // Inline rows are rendered by callers; silent rows produce no surface.
      return;
  }
}

function recordSilently(err: unknown) {
  try {
    recordError(getCrashlytics(), err instanceof Error ? err : new Error(String(err)));
  } catch {
    // intentional swallow: Crashlytics unavailable.
  }
}
