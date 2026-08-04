/**
 * Modal alerts that also work in a browser.
 *
 * React Native Web ships `class Alert { static alert() {} }` — an empty
 * function. Every `Alert.alert` in this app therefore did nothing at all on
 * web, which is silent in exactly the way the other RNW gaps in
 * `docs/ACCESSIBILITY.md` are: the code reads correctly and the native build
 * behaves.
 *
 * What that cost, measured in Chrome:
 *
 * - **"Delete all local data" was inert.** The confirmation never appeared, so
 *   the only control the product offers for erasing local data could not be
 *   used at all on the deployed web build (`docs/LOCAL_DATA_LIFECYCLE.md`).
 * - **Deleting a Want-to list was inert**, for the same reason.
 * - **T2/T3 errors showed nothing.** `src/lib/errorAlert.ts` routes the two
 *   blocking tiers of the ADR-0012 catalog through `Alert.alert`, so a failed
 *   mutation looked like a no-op — against MUST 11, "every local mutation must
 *   surface a failure".
 * - **Share/save results were invisible**, including "Saved".
 *
 * Native keeps using `Alert.alert`. On web the request goes onto a bus that
 * `AlertHost` renders as a real dialog. If no host is mounted — a non-UI code
 * path early in boot, say — it degrades to `window.confirm` / `window.alert`
 * rather than dropping the interaction a second time.
 */

import { Alert, Platform } from 'react-native';

export interface AlertButton {
  readonly text: string;
  readonly style?: 'default' | 'cancel' | 'destructive';
  readonly onPress?: () => void;
}

export interface AlertRequest {
  readonly id: string;
  readonly title: string;
  readonly message?: string;
  readonly buttons: readonly AlertButton[];
}

type Listener = (request: AlertRequest) => void;

const listeners = new Set<Listener>();
let nextId = 1;

export function subscribeAlerts(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const OK_ONLY: readonly AlertButton[] = [{ text: 'OK' }];

/** Drop-in replacement for `Alert.alert` that survives the web build. */
export function showAlert(
  title: string,
  message?: string,
  buttons: readonly AlertButton[] = OK_ONLY,
): void {
  if (Platform.OS !== 'web') {
    Alert.alert(title, message, buttons as AlertButton[]);
    return;
  }

  const request: AlertRequest = { id: `alert-${nextId++}`, title, message, buttons };
  if (listeners.size > 0) {
    for (const listener of listeners) listener(request);
    return;
  }
  runBrowserFallback(request);
}

/**
 * Last resort when nothing is subscribed. `confirm` maps cleanly onto the
 * cancel/confirm pair the app actually uses; anything else gets an
 * acknowledgement so the message is at least seen.
 */
function runBrowserFallback(request: AlertRequest): void {
  if (typeof window === 'undefined') return;
  const body = request.message ? `${request.title}\n\n${request.message}` : request.title;
  const cancel = request.buttons.find((b) => b.style === 'cancel');
  const confirmButton = request.buttons.find((b) => b.style !== 'cancel');

  if (cancel && confirmButton) {
    if (window.confirm(body)) confirmButton.onPress?.();
    else cancel.onPress?.();
    return;
  }
  window.alert(body);
  request.buttons[0]?.onPress?.();
}
