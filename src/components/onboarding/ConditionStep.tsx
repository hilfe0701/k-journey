import React, { useEffect } from 'react';
import { ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text, Button, Card, ProgressBar, IconButton, MIN_TARGET } from '../ui';
import { palette, radius, semantic, space } from '../../../design-tokens';
import { useProfile } from '../../hooks/useProfile';
import {
  getOnboardingProgress,
  onboardingRoutePath,
  setOnboardingProgress,
  type OnboardingRoute,
} from '../../lib/storage';
import type { UserProfile } from '../../lib/firebase';
import { a11yState } from '../../lib/a11y';

export const UNKNOWN_LABEL = 'Unknown / not sure';

interface OnboardingStepShellProps {
  stepNumber: number;
  title: string;
  description: string;
  canContinue: boolean;
  onContinue: () => void;
  saving?: boolean;
  continueLabel?: string;
  children: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  showBack?: boolean;
}

export function OnboardingStepShell({
  stepNumber,
  title,
  description,
  canContinue,
  onContinue,
  saving = false,
  continueLabel = 'Continue',
  children,
  contentStyle,
  showBack = true,
}: OnboardingStepShellProps) {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.header}>
        {showBack ? (
          <IconButton
            icon={ChevronLeft}
            size={24}
            accessibilityLabel="Back"
            onPress={() => router.back()}
          />
        ) : (
          <View style={styles.headerSpacer} />
        )}
        <Text role="xs" color={semantic.fg.secondary} weight="semibold">
          Step {stepNumber} of 8
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.progressWrap}>
        <ProgressBar value={stepNumber / 8} color={palette.dancheong} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.body, contentStyle]}
        keyboardShouldPersistTaps="handled"
      >
        <Text role="h1">{title}</Text>
        <Text role="body" color={palette.ash}>
          {description}
        </Text>
        {children}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={continueLabel}
          onPress={onContinue}
          disabled={!canContinue}
          loading={saving}
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}

export interface ChoiceOption<T extends string> {
  value: T;
  label: string;
  description?: string;
}

export function ChoiceCard<T extends string>({
  option,
  selected,
  onSelect,
  accessibilityLabel,
}: {
  option: ChoiceOption<T>;
  selected: boolean;
  onSelect: (value: T) => void;
  accessibilityLabel?: string;
}) {
  return (
    <Card
      onPress={() => onSelect(option.value)}
      accessibilityRole="radio"
      accessibilityLabel={accessibilityLabel ?? option.label}
      {...a11yState({ selected, disabled: false })}
      style={[
        styles.choiceCard,
        {
          borderColor: selected ? palette.dancheong : palette.hairline,
          borderWidth: selected ? 2 : 1,
        },
      ]}
    >
      <View style={styles.choiceCopy}>
        <Text role="body" weight="semibold">
          {option.label}
        </Text>
        {option.description ? (
          <Text role="sm" color={palette.ash}>
            {option.description}
          </Text>
        ) : null}
      </View>
      <View style={[styles.radio, selected ? styles.radioSelected : null]}>
        {selected ? <View style={styles.radioDot} /> : null}
      </View>
    </Card>
  );
}

export function useOnboardingStepGuard(step: OnboardingRoute): UserProfile | null {
  const router = useRouter();
  const { profile } = useProfile();

  useEffect(() => {
    // A completed profile may enter the era picker from Settings. The root
    // gate handles all other direct onboarding URLs.
    if (profile?.onboardingCompletedAt) return;

    const progress = getOnboardingProgress();
    const currentIndex = progress
      ? routeIndex(progress.currentRoute)
      : -1;
    const stepIndex = routeIndex(step);
    const isFirstStep = step === 'university' && !progress;
    if (!isFirstStep && stepIndex > currentIndex) {
      router.replace(onboardingRoutePath(progress?.currentRoute ?? 'university'));
      return;
    }

    setOnboardingProgress(step);
  }, [profile?.onboardingCompletedAt, router, step]);

  return profile;
}

function routeIndex(route: OnboardingRoute): number {
  return ['university', 'program', 'housing', 'stay-length', 'nationality', 'dates', 'era'].indexOf(
    route,
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.hanji },
  header: {
    minHeight: 48,
    paddingHorizontal: space[5],
    paddingVertical: space[2],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerSpacer: { width: MIN_TARGET, height: MIN_TARGET },
  progressWrap: { paddingHorizontal: space[5] },
  scroll: { flex: 1 },
  body: {
    paddingHorizontal: space[5],
    paddingTop: space[6],
    paddingBottom: space[8],
    gap: space[3],
  },
  footer: {
    paddingHorizontal: space[5],
    paddingTop: space[3],
    paddingBottom: space[4],
    borderTopWidth: 1,
    borderTopColor: semantic.border.hairline,
  },
  choiceCard: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space[3],
  },
  choiceCopy: { flex: 1, gap: space[1] },
  radio: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: palette.stone,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: palette.dancheong },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: radius.full,
    backgroundColor: palette.dancheong,
  },
});
