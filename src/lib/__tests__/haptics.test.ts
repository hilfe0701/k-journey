import * as Haptics from 'expo-haptics';
import {
  hapticMissionComplete,
  hapticPanelUnlock,
  hapticDestructive,
} from '../haptics';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(async () => {}),
  notificationAsync: jest.fn(async () => {}),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
}));

const impactAsync = Haptics.impactAsync as jest.Mock;
const notificationAsync = Haptics.notificationAsync as jest.Mock;

describe('haptics', () => {
  beforeEach(() => {
    impactAsync.mockClear();
    notificationAsync.mockClear();
  });

  it('hapticMissionComplete fires a Light impact', () => {
    hapticMissionComplete();
    expect(impactAsync).toHaveBeenCalledWith('light');
  });

  it('hapticPanelUnlock fires a Success notification', () => {
    hapticPanelUnlock();
    expect(notificationAsync).toHaveBeenCalledWith('success');
  });

  it('hapticDestructive fires a Warning notification', () => {
    hapticDestructive();
    expect(notificationAsync).toHaveBeenCalledWith('warning');
  });

  it('swallows errors so callers never throw', () => {
    impactAsync.mockImplementationOnce(() => {
      throw new Error('haptics unavailable');
    });
    expect(() => hapticMissionComplete()).not.toThrow();
  });

  // ADR-0030 Reduce Motion downgrade table.
  it('hapticMissionComplete is silent under Reduce Motion', () => {
    hapticMissionComplete(true);
    expect(impactAsync).not.toHaveBeenCalled();
  });

  it('hapticPanelUnlock steps down to a Light impact under Reduce Motion', () => {
    hapticPanelUnlock(true);
    expect(impactAsync).toHaveBeenCalledWith('light');
    expect(notificationAsync).not.toHaveBeenCalled();
  });
});
