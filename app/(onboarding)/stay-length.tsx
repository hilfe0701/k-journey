// Screen ID: ONB-05 — Stay length.
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
import { UNKNOWN } from '../../src/lib/firebase';
import { updateUserProfile } from '../../src/lib/firebase';
import { setOnboardingProgress } from '../../src/lib/storage';
import { showOperationError } from '../../src/lib/errorAlert';
import { track } from '../../src/lib/posthog';

export default function StayLengthScreen() {
  const router = useRouter();
  const profile = useOnboardingStepGuard('stay-length');
  const [stayDays, setStayDays] = useState('');
  const [unknown, setUnknown] = useState(false);
  const [saving, setSaving] = useState(false);
  const profileTotalStayDays = profile?.totalStayDays;

  useEffect(() => {
    if (!profile) return;
    if (profileTotalStayDays === UNKNOWN) {
      setUnknown(true);
      setStayDays('');
      return;
    }
    setUnknown(false);
    setStayDays(String(profileTotalStayDays ?? ''));
  }, [profile, profileTotalStayDays]);

  const parsedDays = Number(stayDays);
  // REQ-DAR-003 · REQ-QUR-002 · POL-003: validate and label stay length explicitly.
  const hasValidDays = /^\d+$/.test(stayDays) && Number.isInteger(parsedDays) && parsedDays >= 0;
  const canContinue = unknown || hasValidDays;

  async function handleContinue() {
    if (!canContinue) return;
    setSaving(true);
    try {
      await updateUserProfile({ totalStayDays: unknown ? UNKNOWN : parsedDays });
      setOnboardingProgress('nationality');
      track('onboarding_step_complete', { step: 'stay-length' });
      router.push('/(onboarding)/nationality');
    } catch (error) {
      showOperationError('save your stay length', error, { onPrimary: handleContinue });
    } finally {
      setSaving(false);
    }
  }

  return (
    <OnboardingStepShell
      stepNumber={5}
      title="How long will you stay?"
      description="Enter the total number of days, even if the dates are not final."
      canContinue={canContinue}
      onContinue={handleContinue}
      saving={saving}
    >
      <View style={{ gap: space[3], marginTop: space[5] }}>
        <Input
          label="Total stay in days"
          value={stayDays}
          onChangeText={(value) => {
            setUnknown(false);
            setStayDays(value.replace(/[^0-9]/g, ''));
          }}
          placeholder="e.g. 120"
          keyboardType="number-pad"
          autoCapitalize="none"
          accessibilityLabel="Total stay in days"
          accessibilityHint="Enter a whole number of days."
        />
        <Text role="sm" color={palette.ash}>
          This is a stay length, not a housing type.
        </Text>
        <ChoiceCard
          option={{ value: UNKNOWN, label: UNKNOWN_LABEL, description: 'You can add the number later.' }}
          selected={unknown}
          onSelect={() => {
            setUnknown(true);
            setStayDays('');
          }}
        />
      </View>
    </OnboardingStepShell>
  );
}
