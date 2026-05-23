import React from 'react';
import { ScrollView, Pressable, StyleSheet } from 'react-native';
import { Text } from '../ui/Text';
import { palette, space, radius, phaseColors } from '../../../design-tokens';
import { Phase } from '../../hooks/usePhase';

const PHASES: { phase: Phase; label: string; colorKey: keyof typeof phaseColors }[] = [
  { phase: 1, label: 'Pre-arrival', colorKey: 'preArrival' },
  { phase: 2, label: 'First week', colorKey: 'firstWeek' },
  { phase: 3, label: 'Living', colorKey: 'living' },
  { phase: 4, label: 'Pre-departure', colorKey: 'preDeparture' },
];

interface PhaseTabsProps {
  active: Phase;
  onChange: (phase: Phase) => void;
  countsByPhase: Record<Phase, { done: number; total: number }>;
}

export function PhaseTabs({ active, onChange, countsByPhase }: PhaseTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {PHASES.map(({ phase, label, colorKey }) => {
        const isActive = phase === active;
        const color = phaseColors[colorKey];
        const counts = countsByPhase[phase];
        return (
          <Pressable
            key={phase}
            onPress={() => onChange(phase)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={`Phase ${phase}, ${label}, ${counts.done} of ${counts.total} complete`}
            style={({ pressed }) => [
              styles.tab,
              {
                backgroundColor: isActive ? color : palette.hanji,
                borderColor: isActive ? color : palette.hairline,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Text
              role="xs"
              weight="bold"
              color={isActive ? palette.hanji : palette.ash}
            >
              Phase {phase}
            </Text>
            <Text role="sm" weight="semibold" color={isActive ? palette.hanji : palette.meok}>
              {label}
            </Text>
            <Text role="xs" color={isActive ? palette.hanji : palette.ash}>
              {counts.done}/{counts.total}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: space[2],
    paddingHorizontal: space[5],
    paddingVertical: space[2],
  },
  tab: {
    paddingHorizontal: space[4],
    paddingVertical: space[2],
    borderRadius: radius.md,
    borderWidth: 1,
    minWidth: 124,
    gap: 2,
  },
});
