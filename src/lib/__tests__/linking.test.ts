import { Linking } from 'react-native';

import { showOperationError } from '../errorAlert';
import { openExternalLink } from '../linking';

jest.mock('../errorAlert', () => ({ showOperationError: jest.fn() }));

const errorSurface = showOperationError as jest.Mock;

describe('openExternalLink', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    errorSurface.mockClear();
  });

  it('returns true after the platform opens the destination', async () => {
    jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined as never);
    await expect(openExternalLink('https://example.com')).resolves.toBe(true);
    expect(errorSurface).not.toHaveBeenCalled();
  });

  it('returns false and surfaces a rejected platform handler', async () => {
    const failure = new Error('no handler');
    jest.spyOn(Linking, 'openURL').mockRejectedValue(failure);
    await expect(openExternalLink('https://example.com', 'open the official source')).resolves.toBe(false);
    expect(errorSurface).toHaveBeenCalledWith('open the official source', failure);
  });
});
