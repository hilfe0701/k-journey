import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Check, ChevronRight } from 'lucide-react-native';

import { Text } from '../ui/Text';
import { palette, space, radius } from '../../../design-tokens';
import { Mission, MissionCategory } from '../../data/missions';
import { iconElement } from '../../lib/icons';
import { a11yState } from '../../lib/a11y';

interface MissionCardProps {
  mission: Mission;
  completed: boolean;
  onPress?: () => void;
}

const CATEGORY_NAME: Record<MissionCategory, string> = {
  settle: 'Settle in',
  food: 'Food and taste',
  activity: 'Activities',
  culture: 'Culture',
};

/**
 * A mission row in Airbnb's card idiom: white surface, 14px clipping, a neutral
 * icon plate, then the meta stack — ink title over muted summary. Category is
 * carried by the illustrated icon rather than a tint, matching the way Airbnb
 * distinguishes its categories.
 *
 * Completion is the one Rausch moment here — it is this product's equivalent of
 * the heart save state.
 */
export function MissionCard({ mission, completed, onPress }: MissionCardProps) {
  const a11yLabel = `${mission.titleEn}. ${CATEGORY_NAME[mission.category]} category.${completed ? ' Completed.' : ''}`;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={a11yLabel}
      {...a11yState({ selected: completed })}
      accessibilityHint={completed ? 'Tap to see details.' : 'Tap to open this mission.'}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: pressed ? palette.surfaceSoft : palette.canvas },
      ]}
    >
      <View style={styles.iconBox}>
        {iconElement(mission.icon, {
          size: 22,
          color: completed ? palette.muted : palette.ink,
          strokeWidth: 1.7,
        })}
      </View>
      <View style={styles.body}>
        <Text
          role="titleMd"
          color={completed ? palette.muted : palette.ink}
          numberOfLines={1}
          style={completed ? styles.struck : undefined}
        >
          {mission.titleEn}
        </Text>
        <Text role="bodySm" color={palette.muted} numberOfLines={1}>
          {mission.summary}
        </Text>
      </View>
      {completed ? (
        <View style={styles.check}>
          <Check size={14} color={palette.onPrimary} strokeWidth={3} />
        </View>
      ) : (
        <ChevronRight size={20} color={palette.muted} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space[4],
    paddingVertical: space[4],
    borderRadius: radius.card,
    gap: space[4],
    borderWidth: 1,
    borderColor: palette.hairline,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: radius.card,
    backgroundColor: palette.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    gap: 2,
  },
  // Completion is announced via accessibilityState; the strike-through and the
  // filled check are the visual half, so state never rests on color alone.
  struck: {
    textDecorationLine: 'line-through',
  },
  check: {
    width: 26,
    height: 26,
    borderRadius: radius.full,
    backgroundColor: palette.rausch,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
