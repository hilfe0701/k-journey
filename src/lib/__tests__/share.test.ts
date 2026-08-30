import * as MediaLibrary from 'expo-media-library/legacy';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';

import { showAlert } from '../alert';
import { surfaceError } from '../errorAlert';
import { saveByeongpungImage, shareByeongpungImage } from '../share';

jest.mock('react-native-view-shot', () => ({ captureRef: jest.fn() }));
jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(),
  shareAsync: jest.fn(),
}));
jest.mock('expo-media-library/legacy', () => ({
  requestPermissionsAsync: jest.fn(),
  saveToLibraryAsync: jest.fn(),
  createAssetAsync: jest.fn(),
}));
jest.mock('../alert', () => ({ showAlert: jest.fn() }));
jest.mock('../errorAlert', () => ({ surfaceError: jest.fn() }));

const capture = captureRef as jest.Mock;
const sharingAvailable = Sharing.isAvailableAsync as jest.Mock;
const share = Sharing.shareAsync as jest.Mock;
const requestPhotos = MediaLibrary.requestPermissionsAsync as jest.Mock;
const save = MediaLibrary.saveToLibraryAsync as jest.Mock;
const createAsset = MediaLibrary.createAssetAsync as jest.Mock;
const alert = showAlert as jest.Mock;
const errorSurface = surfaceError as jest.Mock;
const viewRef = { current: {} } as never;

describe('byeongpung share and save failures', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    capture.mockResolvedValue('/tmp/byeongpung.png');
    sharingAvailable.mockResolvedValue(true);
    share.mockResolvedValue(undefined);
    requestPhotos.mockResolvedValue({ granted: true });
    save.mockResolvedValue(undefined);
    createAsset.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('surfaces capture failure without opening a share sheet', async () => {
    capture.mockRejectedValue(new Error('capture failed'));
    await expect(shareByeongpungImage(viewRef)).resolves.toBe(false);
    expect(alert).toHaveBeenCalledWith('Could not capture image', 'Please try again in a moment.');
    expect(share).not.toHaveBeenCalled();
  });

  it('handles an unavailable or rejected share sheet', async () => {
    sharingAvailable.mockResolvedValueOnce(false);
    await expect(shareByeongpungImage(viewRef)).resolves.toBe(false);
    expect(alert).toHaveBeenCalledWith('Sharing not available', 'This device does not support sharing.');

    sharingAvailable.mockResolvedValueOnce(true);
    share.mockRejectedValueOnce(new Error('dismissed'));
    await expect(shareByeongpungImage(viewRef)).resolves.toBe(false);
  });

  it('turns share availability and photo permission API failures into recoverable results', async () => {
    sharingAvailable.mockRejectedValueOnce(new Error('availability failed'));
    await expect(shareByeongpungImage(viewRef)).resolves.toBe(false);
    expect(alert).toHaveBeenCalledWith('Sharing not available', 'Please try again in a moment.');

    requestPhotos.mockRejectedValueOnce(new Error('permission API failed'));
    await expect(saveByeongpungImage(viewRef)).resolves.toBe(false);
    expect(alert).toHaveBeenCalledWith(
      'Could not request photo access',
      'Please try again in a moment.',
    );
  });

  it('routes denied photo permission to the recoverable permission surface', async () => {
    requestPhotos.mockResolvedValue({ granted: false });
    await expect(saveByeongpungImage(viewRef)).resolves.toBe(false);
    expect(errorSurface).toHaveBeenCalledWith('permission-photos-denied', {
      messageOverride: 'Allow photos access to save your byeongpung to your library.',
    });
    expect(save).not.toHaveBeenCalled();
  });

  it('falls back to asset creation and reports a double failure', async () => {
    save.mockRejectedValueOnce(new Error('save failed'));
    await expect(saveByeongpungImage(viewRef)).resolves.toBe(true);
    expect(createAsset).toHaveBeenCalledWith('file:///tmp/byeongpung.png');
    expect(alert).toHaveBeenCalledWith('Saved', 'Your byeongpung is in your photo library.');

    save.mockRejectedValueOnce(new Error('save failed'));
    createAsset.mockRejectedValueOnce(new Error('fallback failed'));
    await expect(saveByeongpungImage(viewRef)).resolves.toBe(false);
    expect(alert).toHaveBeenCalledWith('Save failed', 'Please try again in a moment.');
  });
});
