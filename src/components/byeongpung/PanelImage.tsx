/**
 * Byeongpung panel image with onError fallback.
 *
 * If a PNG fails to load (low storage, corrupted bundle, missing asset),
 * render a solid ink-colour fallback so the byeongpung still shows progress
 * via opacity rather than an empty rectangle. See ADR-0008 §Negative Consequences
 * and PRD v1.1 §6.7.
 *
 * The fallback is intentionally minimal — a single View with the era's ink
 * colour at the same opacity the image would have had. Users in this state
 * still see "progress is happening", just not the artwork detail.
 */

import React, { useState } from 'react';
import {
  Image,
  View,
  StyleSheet,
  type ImageSourcePropType,
  type ImageStyle,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

export interface PanelImageProps {
  source: ImageSourcePropType;
  inkColor: string;
  reveal: number; // 0..1
  /** Style applied to the wrapping container (Image or fallback View share this geometry). */
  style?: StyleProp<ViewStyle>;
  accessibilityElementsHidden?: boolean;
}

export function PanelImage({
  source,
  inkColor,
  reveal,
  style,
  accessibilityElementsHidden = true,
}: PanelImageProps) {
  const [failed, setFailed] = useState(false);
  const opacity = 0.15 + reveal * 0.85;

  if (failed) {
    return (
      <View
        style={[styles.panelView, { backgroundColor: inkColor, opacity }, style]}
        accessibilityElementsHidden={accessibilityElementsHidden}
        importantForAccessibility={accessibilityElementsHidden ? 'no-hide-descendants' : 'auto'}
      />
    );
  }

  // Image requires ImageStyle, not ViewStyle. Geometry is identical so the
  // shared sizing lives in styles.panelImage; opacity is the only dynamic part.
  return (
    <Image
      source={source}
      onError={() => setFailed(true)}
      resizeMode="cover"
      style={[styles.panelImage, { opacity }, style as StyleProp<ImageStyle>]}
      accessibilityElementsHidden={accessibilityElementsHidden}
      importantForAccessibility={accessibilityElementsHidden ? 'no-hide-descendants' : 'auto'}
    />
  );
}

const styles = StyleSheet.create({
  panelView: {
    width: '100%',
    height: '100%',
  } as ViewStyle,
  panelImage: {
    width: '100%',
    height: '100%',
  } as ImageStyle,
});
