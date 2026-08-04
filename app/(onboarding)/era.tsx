// Screen ID: ONB-08 — Optional era choice.
import React, { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';

import {
  OnboardingStepShell,
  useOnboardingStepGuard,
} from '../../src/components/onboarding/ConditionStep';
import { Text } from '../../src/components/ui';
import { palette, elevation, radius, space } from '../../design-tokens';
import { ERA_LIST, type EraKey } from '../../src/theme/eras';
import { BYEONGPUNG_PANEL_IMAGES } from '../../src/components/byeongpung/motifs';
import { updateUserProfile } from '../../src/lib/firebase';
import { clearOnboardingProgress } from '../../src/lib/storage';
import { kstNow } from '../../src/lib/dates';
import { track } from '../../src/lib/posthog';
import { showOperationError } from '../../src/lib/errorAlert';
import { a11yState } from '../../src/lib/a11y';

export default function EraScreen() {
  const router = useRouter();
  const profile = useOnboardingStepGuard('era');
  const isEditing = !!profile?.onboardingCompletedAt;
  const profileEra = profile?.era;
  const [selected, setSelected] = useState<EraKey | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) setSelected(profileEra ?? null);
  }, [profile, profileEra]);

  async function handleContinue() {
    setSaving(true);
    try {
      const previousEra = profile?.era ?? null;
      await updateUserProfile({
        era: selected,
        ...(isEditing ? {} : { onboardingCompletedAt: kstNow().toISOString() }),
      });
      if (isEditing) {
        if (previousEra !== selected && selected) {
          track('era_switch', { from: previousEra, to: selected });
        }
        router.back();
      } else {
        clearOnboardingProgress();
        track('onboarding_complete', { era: selected });
        router.replace('/(tabs)');
      }
    } catch (error) {
      showOperationError('save your era', error, { onPrimary: handleContinue });
    } finally {
      setSaving(false);
    }
  }

  return (
    <OnboardingStepShell
      stepNumber={8}
      title="Choose a visual era"
      description="Optional — choose the painting tradition that will shape your visual accents."
      canContinue={true}
      onContinue={handleContinue}
      saving={saving}
      continueLabel={isEditing ? 'Save era' : selected ? 'Begin your journey' : 'Skip for now'}
    >
      <View style={styles.list}>
        {ERA_LIST.map((era) => {
          const active = era.key === selected;
          return (
            <Pressable
              key={era.key}
              onPress={() => setSelected(era.key)}
              accessibilityRole="radio"
              accessibilityLabel={`${era.nameEn} (${era.nameKo})`}
              {...a11yState({ selected: active, disabled: false })}
              style={({ pressed }) => [
                styles.card,
                {
                  borderColor: active ? era.primary : palette.hairline,
                  borderWidth: active ? 2 : 1,
                  backgroundColor: pressed ? palette.cloud : palette.hanji,
                },
                active ? elevation.s1 : null,
              ]}
            >
              <Image
                source={BYEONGPUNG_PANEL_IMAGES[era.key][0]}
                style={styles.swatch}
                resizeMode="cover"
                accessibilityElementsHidden
              />
              <View style={styles.cardBody}>
                <Text role="h3">{era.nameEn}</Text>
                <Text role="sm" color={palette.ash}>
                  {era.nameKo} · {era.tagline}
                </Text>
              </View>
              {active ? (
                <View style={[styles.check, { backgroundColor: era.primary }]}>
                  <Check size={16} color={palette.hanji} strokeWidth={1.6} />
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </OnboardingStepShell>
  );
}

const styles = StyleSheet.create({
  list: { gap: space[3], marginTop: space[5] },
  card: {
    minHeight: 112,
    borderRadius: radius.card,
    padding: space[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
  },
  swatch: {
    width: 76,
    height: 76,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: palette.hairline,
  },
  cardBody: { flex: 1, gap: space[1] },
  check: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
