import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../ui/Text';
import { ProgressBar } from '../ui/ProgressBar';
import { palette, space, radius } from '../../../design-tokens';
import { dDayLabel } from '../../hooks/usePhase';

interface DDayBannerProps {
  daysLeft: number | null;
  completedCount: number;
  totalMissions: number;
  phaseLabel: string;
}

export function DDayBanner({ daysLeft, completedCount, totalMissions, phaseLabel }: DDayBannerProps) {
  const isUrgent = daysLeft !== null && daysLeft < 14;
  const { big, sub, a11y } = dDayLabel(daysLeft);
  const a11yLabel = `${phaseLabel}. ${a11y}. ${completedCount} of ${totalMissions} missions complete.`;
  return (
    <View
      accessible
      accessibilityRole="summary"
      accessibilityLabel={a11yLabel}
      style={[
        styles.wrapper,
        {
          backgroundColor: isUrgent ? palette.dancheongLight : palette.cloud,
        },
      ]}
    >
      <View style={styles.row}>
        <View>
          <Text role="xs" color={palette.ash} weight="semibold">
            {phaseLabel.toUpperCase()}
          </Text>
          <Text role="display" color={isUrgent ? palette.dancheong : palette.meok}>
            {big}
          </Text>
          <Text role="sm" color={palette.ash}>
            {sub}
          </Text>
        </View>
        <View style={styles.stat}>
          <Text role="xs" color={palette.ash} weight="semibold">
            MISSIONS
          </Text>
          <Text role="h2">
            {completedCount}
            <Text role="lead" color={palette.ash}>
              /{totalMissions}
            </Text>
          </Text>
        </View>
      </View>
      <ProgressBar
        value={completedCount / totalMissions}
        color={isUrgent ? palette.dancheong : palette.cheong}
        bg={palette.hairline}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: radius.lg,
    padding: space[4],
    gap: space[3],
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  stat: {
    alignItems: 'flex-end',
  },
});
