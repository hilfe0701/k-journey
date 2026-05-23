// Mock the PostHog re-export so trackOnce sees a controlled track() spy.
jest.mock('../posthog', () => ({
  track: jest.fn(),
}));

import { trackOnce, _resetTelemetryForTesting } from '../telemetry';
import { track } from '../posthog';

const trackMock = track as jest.Mock;

describe('trackOnce', () => {
  beforeEach(() => {
    trackMock.mockReset();
    _resetTelemetryForTesting();
  });

  it('fires on first call', () => {
    trackOnce('panel_unlock', 'panel-1', { panelNumber: 1, source: 'mission' });
    expect(trackMock).toHaveBeenCalledTimes(1);
    expect(trackMock).toHaveBeenCalledWith('panel_unlock', { panelNumber: 1, source: 'mission' });
  });

  it('does not fire on second call with same dedupeKey', () => {
    trackOnce('panel_unlock', 'panel-1');
    trackOnce('panel_unlock', 'panel-1');
    expect(trackMock).toHaveBeenCalledTimes(1);
  });

  it('fires for different dedupeKeys under same event', () => {
    trackOnce('panel_unlock', 'panel-1');
    trackOnce('panel_unlock', 'panel-2');
    expect(trackMock).toHaveBeenCalledTimes(2);
  });

  it('fires for different events under same dedupeKey', () => {
    trackOnce('panel_unlock', 'shared-key');
    trackOnce('mission_complete', 'shared-key');
    expect(trackMock).toHaveBeenCalledTimes(2);
  });

  it('_resetTelemetryForTesting clears the dedupe set', () => {
    trackOnce('panel_unlock', 'panel-1');
    _resetTelemetryForTesting();
    trackOnce('panel_unlock', 'panel-1');
    expect(trackMock).toHaveBeenCalledTimes(2);
  });
});
