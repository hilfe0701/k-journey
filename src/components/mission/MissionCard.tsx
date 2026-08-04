import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Check, ChevronRight } from 'lucide-react-native';

import { Text } from '../ui/Text';
import { palette, space, radius, categoryColors } from '../../../design-tokens';
import { Mission, MissionCategory } from '../../data/missions';
import { resolveIcon } from '../../lib/icons';
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

export function MissionCard({ mission, completed, onPress }: MissionCardProps) {
  const color = categoryColors[mission.category];
  const IconComp = resolveIcon(mission.icon);
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
        {
          backgroundColor: pressed ? palette.cloud : palette.hanji,
          opacity: completed ? 0.7 : 1,
        },
      ]}
    >
      <View style={[styles.iconBox, { backgroundColor: color + '1F' }]}>
        <IconComp size={22} color={color} strokeWidth={1.7} />
      </View>
      <View style={styles.body}>
        <Text role="body" weight="semibold" numberOfLines={1}>
          {mission.titleEn}
        </Text>
        <Text role="sm" color={palette.ash} numberOfLines={1}>
          {mission.summary}
        </Text>
      </View>
      {completed ? (
        <View style={[styles.check, { backgroundColor: palette.jade }]}>
          <Check size={14} color={palette.hanji} />
        </View>
      ) : (
        <ChevronRight size={20} color={palette.stone} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space[3],
    paddingVertical: space[3],
    borderRadius: radius.card,
    gap: space[3],
    borderWidth: 1,
    borderColor: palette.hairline,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    gap: 2,
  },
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
