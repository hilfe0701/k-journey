import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Text } from '../ui/Text';
import { palette, radius, space } from '../../../design-tokens';
import { useTheme } from '../../theme/ThemeProvider';
import { BYEONGPUNG_PANEL_IMAGES } from './motifs';

interface ByeongpungStripProps {
  completedCount: number;
}

/**
 * Compact 8-panel preview shown at the top of the home screen.
 * Each panel reveals progressively as `completedCount` grows.
 *   panelReveal(i) = clamp((completedCount - i*6) / 6, 0, 1)
 */
export function ByeongpungStrip({ completedCount }: ByeongpungStripProps) {
  const theme = useTheme();
  const panels = BYEONGPUNG_PANEL_IMAGES[theme.era.key];

  const completedPanels = panels.filter((_, i) => (completedCount - i * 6) / 6 >= 1).length;

  return (
    <View
      style={styles.wrapper}
      accessible
      accessibilityRole="image"
      accessibilityLabel={`Byeongpung — ${completedPanels} of 8 panels revealed. ${completedCount} completions.`}
    >
      <View style={styles.frame}>
        {panels.map((source, i) => {
          const reveal = Math.max(0, Math.min(1, (completedCount - i * 6) / 6));
          return (
            <View key={i} style={styles.panel}>
              <View style={[styles.panelBg, { backgroundColor: theme.era.panelBg }]} />
              <Image
                source={source}
                style={[styles.panelImage, { opacity: 0.15 + reveal * 0.85 }]}
                resizeMode="cover"
              />
              <View style={styles.panelLabel}>
                <View style={styles.panelLabelChip}>
                  <Text role="xs" color={palette.hanji} weight="semibold">
                    {i + 1}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
      <View style={styles.legend}>
        <Text role="xs" color={palette.ash} weight="semibold">
          {completedPanels}/8 panels
        </Text>
        <Text role="xs" color={palette.ash} weight="semibold">
          {completedCount} completions
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: space[2],
  },
  frame: {
    height: 84,
    flexDirection: 'row',
    borderRadius: radius.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: palette.hwanggeum,
  },
  panel: {
    flex: 1,
    borderRightWidth: 0.5,
    borderRightColor: palette.hwanggeum,
  },
  panelBg: {
    ...StyleSheet.absoluteFillObject,
  },
  panelImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  panelLabel: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 4,
  },
  panelLabelChip: {
    backgroundColor: palette.meok + 'B3',
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: 'center',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
