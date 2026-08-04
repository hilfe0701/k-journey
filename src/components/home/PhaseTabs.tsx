import React from 'react';
import { ScrollView, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../ui/Text';
import { palette, space } from '../../../design-tokens';
import { Phase } from '../../hooks/usePhase';
import { a11yState } from '../../lib/a11y';

const PHASES: { phase: Phase; label: string }[] = [
  { phase: 1, label: 'Pre-arrival' },
  { phase: 2, label: 'First week' },
  { phase: 3, label: 'Living' },
  { phase: 4, label: 'Pre-departure' },
];

interface PhaseTabsProps {
  active: Phase;
  onChange: (phase: Phase) => void;
  countsByPhase: Record<Phase, { done: number; total: number }>;
}

/**
 * Airbnb's category strip / product-tab pattern rather than filled color pills:
 * inactive tabs are a muted label on the bare canvas, the active tab is ink with
 * a 2px ink underline beneath it. State is carried by weight, tone, and the
 * rule — never by hue alone — so the strip stays legible without spending the
 * one Rausch voltage on navigation chrome.
 */
export function PhaseTabs({ active, onChange, countsByPhase }: PhaseTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {PHASES.map(({ phase, label }) => {
        const isActive = phase === active;
        const counts = countsByPhase[phase];
        return (
          <Pressable
            key={phase}
            onPress={() => onChange(phase)}
            accessibilityRole="tab"
            {...a11yState({ selected: isActive })}
            accessibilityLabel={`Phase ${phase}, ${label}, ${counts.done} of ${counts.total} complete`}
            style={({ pressed }) => [styles.tab, { opacity: pressed ? 0.6 : 1 }]}
          >
            <View style={styles.labels}>
              <Text
                role="caption"
                weight={isActive ? 'semibold' : 'medium'}
                color={isActive ? palette.ink : palette.muted}
                numberOfLines={1}
              >
                {label}
              </Text>
              <Text role="captionSm" color={palette.muted}>
                {counts.done}/{counts.total}
              </Text>
            </View>
            <View
              style={[
                styles.rule,
                { backgroundColor: isActive ? palette.ink : 'transparent' },
              ]}
            />
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: space[6],
    paddingHorizontal: space[6],
  },
  tab: {
    paddingTop: space[3],
    gap: space[2],
    // Keeps the whole strip cell a comfortable target without a surface fill.
    minHeight: 56,
  },
  labels: {
    alignItems: 'center',
    gap: 2,
  },
  rule: {
    height: 2,
    borderRadius: 2,
    marginTop: 'auto',
  },
});
