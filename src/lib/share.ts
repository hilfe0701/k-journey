/**
 * Capture-and-share helpers for the byeongpung gallery.
 *
 * Implements PRD §6.4 — exporting the completed (or partial) folding screen
 * to the phone gallery and to system share sheets. Best-effort: errors are
 * surfaced via an Alert and never propagate to render code.
 */

import { Alert } from 'react-native';
import type { RefObject } from 'react';
import type { View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { surfaceError } from './errorAlert';

interface CaptureOptions {
  format?: 'png' | 'jpg';
  quality?: number;
}

async function captureViewToFile(
  viewRef: RefObject<View>,
  options: CaptureOptions = {},
): Promise<string | null> {
  if (!viewRef.current) return null;
  try {
    const uri = await captureRef(viewRef, {
      format: options.format ?? 'png',
      quality: options.quality ?? 0.95,
      result: 'tmpfile',
    });
    return uri.startsWith('file://') ? uri : `file://${uri}`;
  } catch (err) {
    console.warn('[share] captureRef failed', err);
    return null;
  }
}

export async function shareByeongpungImage(
  viewRef: RefObject<View>,
  dialogTitle: string = 'Share your byeongpung',
): Promise<boolean> {
  const uri = await captureViewToFile(viewRef);
  if (!uri) {
    Alert.alert('Could not capture image', 'Please try again in a moment.');
    return false;
  }

  const available = await Sharing.isAvailableAsync();
  if (!available) {
    Alert.alert('Sharing not available', 'This device does not support sharing.');
    return false;
  }

  try {
    await Sharing.shareAsync(uri, {
      mimeType: 'image/png',
      dialogTitle,
      UTI: 'public.png',
    });
    return true;
  } catch (err) {
    console.warn('[share] shareAsync failed', err);
    return false;
  }
}

export async function saveByeongpungImage(viewRef: RefObject<View>): Promise<boolean> {
  const uri = await captureViewToFile(viewRef);
  if (!uri) {
    Alert.alert('Could not capture image', 'Please try again in a moment.');
    return false;
  }

  const perm = await MediaLibrary.requestPermissionsAsync(true);
  if (!perm.granted) {
    // T3 — Settings deep-link (ADR-0028). messageOverride keeps the catalog
    // row generic while giving this flow byeongpung-save-specific copy.
    surfaceError('permission-photos-denied', {
      messageOverride: 'Allow photos access to save your byeongpung to your library.',
    });
    return false;
  }

  try {
    await MediaLibrary.saveToLibraryAsync(uri);
    Alert.alert('Saved', 'Your byeongpung is in your photo library.');
    return true;
  } catch (err) {
    console.warn('[share] saveToLibraryAsync failed, retrying via createAssetAsync', err);
    try {
      await MediaLibrary.createAssetAsync(uri);
      Alert.alert('Saved', 'Your byeongpung is in your photo library.');
      return true;
    } catch (retryErr) {
      console.warn('[share] createAssetAsync also failed', retryErr);
      Alert.alert('Save failed', 'Please try again in a moment.');
      return false;
    }
  }
}
