/**
 * Singleton event bus for the 4-tier error router. UI hosts subscribe via
 * `subscribeErrors` and render T1 toasts / T4 banners / etc. Non-UI callers
 * `emitError(row)` after resolving via `resolveErrorRow`.
 *
 * Why a singleton rather than React Context: the error router is also called
 * from non-component code (firebase mutators, lib/notifications, etc.), and
 * those call sites cannot reach into a React tree. The bus is module-scoped
 * so any caller — component or not — can publish without prop drilling.
 */

import type { ErrorRow } from './catalog';

export interface ErrorEvent {
  readonly id: string;
  readonly row: ErrorRow;
  readonly contextAction?: string;
  readonly onPrimary?: () => void;
  readonly onSecondary?: () => void;
}

type Listener = (event: ErrorEvent) => void;

const listeners = new Set<Listener>();
let nextId = 1;

export function subscribeErrors(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function emitError(
  row: ErrorRow,
  options?: { contextAction?: string; onPrimary?: () => void; onSecondary?: () => void },
) {
  const event: ErrorEvent = {
    id: `err-${nextId++}`,
    row,
    contextAction: options?.contextAction,
    onPrimary: options?.onPrimary,
    onSecondary: options?.onSecondary,
  };
  for (const fn of listeners) fn(event);
}
