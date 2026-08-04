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
          // The surface stays neutral in both states. Urgency is spoken by the
          // countdown numeral and the progress fill turning Rausch — a tinted
          // card would read as "featured" instead of "running out of time".
          backgroundColor: palette.surfaceSoft,
        },
      ]}
    >
      <View style={styles.row}>
        <View>
          <Text role="micro" color={palette.muted}>
            {phaseLabel.toUpperCase()}
          </Text>
          {/* The countdown is this product's rating-display moment — the one
              place type alone is trusted to carry the hierarchy. */}
          <Text role="hero" color={isUrgent ? palette.rausch : palette.ink}>
            {big}
          </Text>
          <Text role="bodySm" color={palette.muted}>
            {sub}
          </Text>
        </View>
        <View style={styles.stat}>
          <Text role="micro" color={palette.muted}>
            MISSIONS
          </Text>
          <Text role="displayLg" weight="bold">
            {completedCount}
            <Text role="lead" color={palette.muted}>
              /{totalMissions}
            </Text>
          </Text>
        </View>
      </View>
      <ProgressBar
        value={completedCount / totalMissions}
        color={isUrgent ? palette.rausch : palette.ink}
        bg={palette.hairline}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: radius.card,
    padding: space[6],
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
