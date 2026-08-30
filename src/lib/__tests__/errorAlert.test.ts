/**
 * 4-tier router test (ADR-0028 §Test plan): every catalog code routes to its
 * declared surface — T1/T4 onto the toast bus, T2/T3 onto Alert.alert.
 */

import { Alert } from 'react-native';
import { surfaceError } from '../errorAlert';
import { subscribeErrors, type ErrorEvent } from '../errors/host';

describe('errorAlert 4-tier routing', () => {
  it('routes a T1 code onto the toast bus', () => {
    const events: ErrorEvent[] = [];
    const unsub = subscribeErrors((e) => events.push(e));
    surfaceError('network-offline');
    unsub();
    expect(events).toHaveLength(1);
    expect(events[0].row.tier).toBe('T1');
    expect(events[0].row.code).toBe('network-offline');
  });

  it('routes a T4 code onto the banner bus', () => {
    const events: ErrorEvent[] = [];
    const unsub = subscribeErrors((e) => events.push(e));
    surfaceError('clock-jump');
    unsub();
    expect(events).toHaveLength(1);
    expect(events[0].row.tier).toBe('T4');
  });

  it('routes a T2 code to Alert.alert with the catalog title', () => {
    const spy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    surfaceError('unknown');
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toBe("Couldn't complete that");
    spy.mockRestore();
  });

  it('routes a T3 code to Alert.alert with an Open Settings button', () => {
    const spy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    surfaceError('permission-photos-denied');
    const buttons = (spy.mock.calls[0][2] ?? []) as { text: string }[];
    expect(buttons.some((b) => b.text === 'Open Settings')).toBe(true);
    spy.mockRestore();
  });

  it('messageOverride substitutes the alert body', () => {
    const spy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    surfaceError('phase-changed', { messageOverride: 'You are now in Phase 2.' });
    expect(spy.mock.calls[0][1]).toBe('You are now in Phase 2.');
    spy.mockRestore();
  });

  it('produces no surface for inline codes', () => {
    const spy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const events: ErrorEvent[] = [];
    const unsub = subscribeErrors((e) => events.push(e));
    surfaceError('validation-arrival-after-departure');
    unsub();
    expect(events).toHaveLength(0);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
