import {
  claimPanelUnlock,
  cancelScheduledJourneyNotifications,
  hasFiredPanelUnlock,
  firePanelUnlock,
  rescheduleAllNotifications,
  PUSH_COPY,
} from '../notifications';
import * as Notifications from 'expo-notifications';
import { storage } from '../storage';

// Mock expo-notifications so the module-load side effects don't try to wire
// native handlers. (jest.mock is auto-hoisted above the imports at runtime.)
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  requestPermissionsAsync: jest.fn(async () => ({ granted: true, ios: { status: 2 } })),
  getPermissionsAsync: jest.fn(async () => ({ granted: false })),
  cancelAllScheduledNotificationsAsync: jest.fn(async () => {}),
  scheduleNotificationAsync: jest.fn(async () => 'id'),
  IosAuthorizationStatus: { AUTHORIZED: 2 },
}));

const scheduleMock = Notifications.scheduleNotificationAsync as jest.Mock;
const permsMock = Notifications.getPermissionsAsync as jest.Mock;
const cancelMock = Notifications.cancelAllScheduledNotificationsAsync as jest.Mock;

describe('claimPanelUnlock', () => {
  beforeEach(() => {
    storage.clearAll();
  });

  it('returns true the first time a panel is claimed', () => {
    expect(claimPanelUnlock(1)).toBe(true);
  });

  it('returns false on subsequent claims of the same panel', () => {
    claimPanelUnlock(1);
    expect(claimPanelUnlock(1)).toBe(false);
    expect(claimPanelUnlock(1)).toBe(false);
  });

  it('claims each panel independently', () => {
    expect(claimPanelUnlock(1)).toBe(true);
    expect(claimPanelUnlock(2)).toBe(true);
    expect(claimPanelUnlock(1)).toBe(false);
    expect(claimPanelUnlock(2)).toBe(false);
    expect(claimPanelUnlock(3)).toBe(true);
  });

  it('hasFiredPanelUnlock reflects claim state', () => {
    expect(hasFiredPanelUnlock(5)).toBe(false);
    claimPanelUnlock(5);
    expect(hasFiredPanelUnlock(5)).toBe(true);
    expect(hasFiredPanelUnlock(6)).toBe(false);
  });
});

// ADR-0029 CI gate: every fire path must source its copy from the PUSH_COPY
// catalog. An inline-string regression breaks these by design.
describe('firePanelUnlock — sources copy from PUSH_COPY', () => {
  beforeEach(() => {
    storage.clearAll();
    scheduleMock.mockReset();
    scheduleMock.mockResolvedValue('id');
    permsMock.mockResolvedValue({ granted: true });
  });

  it('schedules a panel-unlock notification with the catalog title + body', async () => {
    await firePanelUnlock(3);
    expect(scheduleMock).toHaveBeenCalledTimes(1);
    expect(scheduleMock.mock.calls[0][0].content).toEqual({
      title: PUSH_COPY.panelUnlock(3).title,
      body: PUSH_COPY.panelUnlock(3).body,
    });
  });

  it('does not schedule when notification permission is not granted', async () => {
    permsMock.mockResolvedValue({ granted: false });
    await firePanelUnlock(2);
    expect(scheduleMock).not.toHaveBeenCalled();
  });
});

describe('rescheduleAllNotifications — sources copy from PUSH_COPY', () => {
  const iso = (daysFromNow: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    return d.toISOString().slice(0, 10);
  };

  beforeEach(() => {
    storage.clearAll();
    scheduleMock.mockReset();
    scheduleMock.mockResolvedValue('id');
    permsMock.mockReset();
    permsMock.mockResolvedValue({ granted: true, ios: { status: 2 }, canAskAgain: true });
    cancelMock.mockReset();
    cancelMock.mockResolvedValue(undefined);
  });

  it('schedules the D-30/14/7 milestones from the catalog, never inline strings', async () => {
    const result = await rescheduleAllNotifications({ arrivalDate: iso(10), departureDate: iso(90) });
    const titles = scheduleMock.mock.calls.map((c) => c[0].content.title);
    expect(titles).toContain(PUSH_COPY.dDay30.title);
    expect(titles).toContain(PUSH_COPY.dDay14.title);
    expect(titles).toContain(PUSH_COPY.dDay7.title);
    expect(result.complete).toBe(true);
    expect(result.permissionGranted).toBe(true);
    expect(result.scheduledCount).toBe(scheduleMock.mock.calls.length);
  });

  it('schedules the phase-boundary notifications from the catalog', async () => {
    await rescheduleAllNotifications({ arrivalDate: iso(10), departureDate: iso(90) });
    const titles = scheduleMock.mock.calls.map((c) => c[0].content.title);
    expect(titles).toContain(PUSH_COPY.phase2Start.title);
    expect(titles).toContain(PUSH_COPY.phase3Start.title);
    expect(titles).toContain(PUSH_COPY.phase4Start.title);
  });

  it('reports a partial refresh when scheduling fails', async () => {
    scheduleMock.mockRejectedValueOnce(new Error('schedule failed'));
    const result = await rescheduleAllNotifications({ arrivalDate: iso(10), departureDate: iso(90) });
    expect(result.complete).toBe(false);
    expect(result.cancelledExisting).toBe(true);
    expect(result.failureCount).toBe(1);
    expect(result.scheduledCount).toBe(scheduleMock.mock.calls.length - 1);
  });

  it('does not add a new schedule when cancellation fails, preventing duplicates', async () => {
    cancelMock.mockRejectedValueOnce(new Error('cancel failed'));
    const result = await rescheduleAllNotifications({ arrivalDate: iso(10), departureDate: iso(90) });
    expect(scheduleMock).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      complete: false,
      permissionGranted: true,
      cancelledExisting: false,
      scheduledCount: 0,
      failureCount: 1,
    });
  });

  it('clears old reminders but does not schedule without OS permission', async () => {
    permsMock.mockResolvedValue({ granted: false, canAskAgain: false });
    const result = await rescheduleAllNotifications({ arrivalDate: iso(10), departureDate: iso(90) });
    expect(cancelMock).toHaveBeenCalledTimes(1);
    expect(scheduleMock).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      complete: false,
      permissionGranted: false,
      cancelledExisting: true,
      scheduledCount: 0,
      failureCount: 0,
    });
  });
});

describe('cancelScheduledJourneyNotifications', () => {
  beforeEach(() => {
    cancelMock.mockReset();
    cancelMock.mockResolvedValue(undefined);
  });

  it('reports whether reminders were actually cleared', async () => {
    await expect(cancelScheduledJourneyNotifications()).resolves.toBe(true);
    cancelMock.mockRejectedValueOnce(new Error('cancel failed'));
    await expect(cancelScheduledJourneyNotifications()).resolves.toBe(false);
  });
});
