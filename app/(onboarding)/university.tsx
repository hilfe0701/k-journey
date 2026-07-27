import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

import { ChoiceCard, OnboardingStepShell, UNKNOWN_LABEL, useOnboardingStepGuard } from '../../src/components/onboarding/ConditionStep';
import { UNIVERSITIES } from '../../src/data/universities';
import { UNKNOWN } from '../../src/lib/firebase';
import { updateUserProfile } from '../../src/lib/firebase';
import { setOnboardingProgress } from '../../src/lib/storage';
import { showOperationError } from '../../src/lib/errorAlert';
import { track } from '../../src/lib/posthog';
import { space } from '../../design-tokens';
import { useRouter } from 'expo-router';

export default function UniversityScreen() {
  const router = useRouter();
  const profile = useOnboardingStepGuard('university');
  const [universityId, setUniversityId] = useState<string>(UNKNOWN);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile?.universityId) setUniversityId(profile.universityId);
  }, [profile?.universityId]);

  async function handleContinue() {
    setSaving(true);
    try {
      await updateUserProfile({
        universityId,
        university: universityId === UNKNOWN ? null : universityId,
      });
      setOnboardingProgress('program');
      track('onboarding_step_complete', { step: 'university' });
      router.push('/(onboarding)/program');
    } catch (error) {
      showOperationError('save your university', error, { onPrimary: handleContinue });
    } finally {
      setSaving(false);
    }
  }

  return (
    <OnboardingStepShell
      stepNumber={2}
      title="Which university will you attend?"
      description="Choose your campus so we can point you to the right official help."
      canContinue={universityId.length > 0}
      onContinue={handleContinue}
      saving={saving}
      showBack={false}
    >
      <View style={{ gap: space[2], marginTop: space[5] }}>
        {UNIVERSITIES.map((university) => (
          <ChoiceCard
            key={university.id}
            option={{
              value: university.id,
              label: university.nameEn,
              description: `(${university.nameKo})`,
            }}
            selected={universityId === university.id}
            onSelect={setUniversityId}
          />
        ))}
        <ChoiceCard
          option={{ value: UNKNOWN, label: UNKNOWN_LABEL, description: 'You can update this later.' }}
          selected={universityId === UNKNOWN}
          onSelect={setUniversityId}
        />
      </View>
    </OnboardingStepShell>
  );
}
