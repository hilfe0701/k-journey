// Screen ID: ONB-06 — Nationality and home-country insurance.
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';

import {
  ChoiceCard,
  OnboardingStepShell,
  UNKNOWN_LABEL,
  useOnboardingStepGuard,
} from '../../src/components/onboarding/ConditionStep';
import { Input, Text } from '../../src/components/ui';
import { palette, space } from '../../design-tokens';
import { UNKNOWN, type HomeCountryInsurance } from '../../src/lib/firebase';
import { updateUserProfile } from '../../src/lib/firebase';
import { setOnboardingProgress } from '../../src/lib/storage';
import { showOperationError } from '../../src/lib/errorAlert';
import { track } from '../../src/lib/posthog';

// REQ-DAR-004 · POL-003 · POL-005: collect the minimum NHIS exclusion inputs.
const INSURANCE_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: UNKNOWN, label: UNKNOWN_LABEL },
] satisfies readonly { value: HomeCountryInsurance; label: string }[];

export default function NationalityScreen() {
  const router = useRouter();
  const profile = useOnboardingStepGuard('nationality');
  const [nationality, setNationality] = useState('');
  const [nationalityUnknown, setNationalityUnknown] = useState(false);
  const [homeCountryInsurance, setHomeCountryInsurance] = useState<HomeCountryInsurance>(UNKNOWN);
  const [saving, setSaving] = useState(false);
  const profileNationality = profile?.nationality;
  const profileHomeCountryInsurance = profile?.homeCountryInsurance;

  useEffect(() => {
    if (!profile) return;
    if (profileNationality === UNKNOWN) {
      setNationalityUnknown(true);
      setNationality('');
    } else {
      setNationalityUnknown(false);
      setNationality(profileNationality ?? '');
    }
    setHomeCountryInsurance(profileHomeCountryInsurance ?? UNKNOWN);
  }, [profile, profileHomeCountryInsurance, profileNationality]);

  const canContinue = (nationalityUnknown || nationality.trim().length > 0) && !!homeCountryInsurance;

  async function handleContinue() {
    if (!canContinue) return;
    setSaving(true);
    try {
      await updateUserProfile({
        nationality: nationalityUnknown ? UNKNOWN : nationality.trim(),
        homeCountryInsurance,
      });
      setOnboardingProgress('dates');
      track('onboarding_step_complete', { step: 'nationality' });
      router.push('/(onboarding)/dates');
    } catch (error) {
      showOperationError('save your nationality details', error, { onPrimary: handleContinue });
    } finally {
      setSaving(false);
    }
  }

  return (
    <OnboardingStepShell
      stepNumber={6}
      title="Where are you from?"
      description="This helps us explain which home-country coverage may matter."
      canContinue={canContinue}
      onContinue={handleContinue}
      saving={saving}
    >
      <View style={{ gap: space[3], marginTop: space[5] }}>
        <Input
          label="Nationality"
          value={nationality}
          onChangeText={(value) => {
            setNationalityUnknown(false);
            setNationality(value);
          }}
          placeholder="e.g. Canada"
          accessibilityLabel="Nationality"
        />
        <ChoiceCard
          option={{ value: UNKNOWN, label: UNKNOWN_LABEL, description: 'You can add this later.' }}
          selected={nationalityUnknown}
          onSelect={() => {
            setNationalityUnknown(true);
            setNationality('');
          }}
        />
        <View style={{ gap: space[2], marginTop: space[3] }}>
          <InputLabel label="Home-country insurance" />
          {INSURANCE_OPTIONS.map((option) => (
            <ChoiceCard
              key={option.value}
              option={option}
              selected={homeCountryInsurance === option.value}
              onSelect={setHomeCountryInsurance}
            />
          ))}
          <Text role="sm" color={palette.ash}>
            An exclusion from National Health Insurance Service (NHIS) enrollment depends on qualifying medical coverage, not stay length alone. Confirm the documents with NHIS.
          </Text>
        </View>
      </View>
    </OnboardingStepShell>
  );
}

function InputLabel({ label }: { label: string }) {
  return <Text role="h4">{label}</Text>;
}
