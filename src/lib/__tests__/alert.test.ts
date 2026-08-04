/**
 * Guards the web half of the modal-alert surface.
 *
 * React Native Web's `Alert` is `class Alert { static alert() {} }` — an empty
 * function — so before `src/lib/alert.ts` every confirmation in the browser
 * silently did nothing, including "Delete all local data". These assert that
 * web goes to a host (or, with no host mounted, to a browser dialog) while
 * native still gets the OS alert.
 */

type AlertModule = typeof import('../alert');

function loadFor(os: 'ios' | 'web') {
  jest.resetModules();
  const alertSpy = jest.fn();
  jest.doMock('react-native', () => ({
    Alert: { alert: alertSpy },
    Platform: { OS: os },
  }));
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod: AlertModule = require('../alert');
  return { mod, alertSpy };
}

// The jest-expo environment provides a `window` without the browser dialog
// functions, so they are installed per test rather than spied on.
function stubBrowserDialogs(confirmResult: boolean) {
  const confirmMock = jest.fn().mockReturnValue(confirmResult);
  const alertMock = jest.fn();
  (window as unknown as Record<string, unknown>).confirm = confirmMock;
  (window as unknown as Record<string, unknown>).alert = alertMock;
  return { confirmMock, alertMock };
}

afterEach(() => {
  jest.resetModules();
  jest.restoreAllMocks();
  delete (window as unknown as Record<string, unknown>).confirm;
  delete (window as unknown as Record<string, unknown>).alert;
});

describe('native', () => {
  it('delegates to the OS alert', () => {
    const { mod, alertSpy } = loadFor('ios');
    const buttons = [{ text: 'Cancel', style: 'cancel' as const }, { text: 'Delete' }];
    mod.showAlert('Delete this journey?', 'Cannot be undone.', buttons);
    expect(alertSpy).toHaveBeenCalledWith('Delete this journey?', 'Cannot be undone.', buttons);
  });
});

describe('web with a host mounted', () => {
  it('publishes the request instead of calling the no-op RNW Alert', () => {
    const { mod, alertSpy } = loadFor('web');
    const seen: import('../alert').AlertRequest[] = [];
    const unsubscribe = mod.subscribeAlerts((request) => seen.push(request));

    mod.showAlert('Delete this journey?', 'Cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete everything', style: 'destructive' },
    ]);

    expect(alertSpy).not.toHaveBeenCalled();
    expect(seen).toHaveLength(1);
    expect(seen[0].title).toBe('Delete this journey?');
    expect(seen[0].buttons.map((b) => b.text)).toEqual(['Cancel', 'Delete everything']);
    unsubscribe();
  });

  it('stops publishing after the host unsubscribes', () => {
    const { mod } = loadFor('web');
    const seen: unknown[] = [];
    mod.subscribeAlerts((r) => seen.push(r))();
    // With no listener left it falls back to the browser dialog, not silence.
    const { confirmMock } = stubBrowserDialogs(false);
    mod.showAlert('Title', 'Body', [{ text: 'Cancel', style: 'cancel' }, { text: 'Go' }]);
    expect(seen).toHaveLength(0);
    expect(confirmMock).toHaveBeenCalled();
  });
});

describe('web with no host mounted', () => {
  it('confirms a two-button alert and runs the chosen handler', () => {
    const { mod } = loadFor('web');
    stubBrowserDialogs(true);
    const onDelete = jest.fn();
    const onCancel = jest.fn();

    mod.showAlert('Delete this bucket?', 'This removes all items.', [
      { text: 'Cancel', style: 'cancel', onPress: onCancel },
      { text: 'Delete', style: 'destructive', onPress: onDelete },
    ]);

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('runs the cancel handler when the confirmation is declined', () => {
    const { mod } = loadFor('web');
    stubBrowserDialogs(false);
    const onDelete = jest.fn();
    const onCancel = jest.fn();

    mod.showAlert('Delete this bucket?', undefined, [
      { text: 'Cancel', style: 'cancel', onPress: onCancel },
      { text: 'Delete', style: 'destructive', onPress: onDelete },
    ]);

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('acknowledges a single-button alert', () => {
    const { mod } = loadFor('web');
    const { alertMock } = stubBrowserDialogs(false);
    const onOk = jest.fn();

    mod.showAlert('Saved', 'Your byeongpung is in your photo library.', [
      { text: 'OK', onPress: onOk },
    ]);

    expect(alertMock).toHaveBeenCalled();
    expect(onOk).toHaveBeenCalledTimes(1);
  });
});
