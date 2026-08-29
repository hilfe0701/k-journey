// Screen ID: ONB-03 — Program and visa.
import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';

import {
  ChoiceCard,
  OnboardingStepShell,
  UNKNOWN_LABEL,
  useOnboardingStepGuard,
} from '../../src/components/onboarding/ConditionStep';
import { UNKNOWN, type ProgramType, type VisaTypeOrStatus } from '../../src/lib/firebase';
import { updateUserProfile } from '../../src/lib/firebase';
import { setOnboardingProgress } from '../../src/lib/storage';
import { showOperationError } from '../../src/lib/errorAlert';
import { track } from '../../src/lib/posthog';
import { space } from '../../design-tokens';
import { Text } from '../../src/components/ui';

const PROGRAM_OPTIONS = [
  { value: 'exchange', label: 'Exchange student' },
  { value: 'visiting', label: 'Visiting student' },
  { value: UNKNOWN, label: UNKNOWN_LABEL },
] satisfies readonly { value: ProgramType; label: string }[];

const VISA_OPTIONS = [
  { value: 'D-2-6', label: 'D-2-6 — Exchange Student' },
  { value: 'D-2-8', label: 'D-2-8 — Visiting Student' },
  { value: 'visa_free', label: 'Visa-free stay' },
  { value: 'other', label: 'Another visa or status' },
  { value: UNKNOWN, label: UNKNOWN_LABEL },
] satisfies readonly { value: VisaTypeOrStatus; label: string }[];

export default function ProgramScreen() {
  const profile = useOnboardingStepGuard('program');
  const initialProgramType = profile?.programType ?? UNKNOWN;
  const initialVisaTypeOrStatus = profile?.visaTypeOrStatus ?? UNKNOWN;

  return (
    <ProgramForm
      key={JSON.stringify([!!profile, initialProgramType, initialVisaTypeOrStatus])}
      initialProgramType={initialProgramType}
      initialVisaTypeOrStatus={initialVisaTypeOrStatus}
    />
  );
}

function ProgramForm({
  initialProgramType,
  initialVisaTypeOrStatus,
}: {
  initialProgramType: ProgramType;
  initialVisaTypeOrStatus: VisaTypeOrStatus;
}) {
  const router = useRouter();
  const [programType, setProgramType] = useState<ProgramType>(initialProgramType);
  const [visaTypeOrStatus, setVisaTypeOrStatus] = useState<VisaTypeOrStatus>(initialVisaTypeOrStatus);
  const [saving, setSaving] = useState(false);

  async function handleContinue() {
    setSaving(true);
    try {
      await updateUserProfile({ programType, visaTypeOrStatus });
      setOnboardingProgress('housing');
      track('onboarding_step_complete', { step: 'program' });
      router.push('/(onboarding)/housing');
    } catch (error) {
      showOperationError('save your program details', error, { onPrimary: handleContinue });
    } finally {
      setSaving(false);
    }
  }

  return (
    <OnboardingStepShell
      stepNumber={3}
      title="What brings you to Korea?"
      description="These details help us keep later guidance relevant."
      canContinue={!!programType && !!visaTypeOrStatus}
      onContinue={handleContinue}
      saving={saving}
    >
      <View style={{ gap: space[2], marginTop: space[5] }}>
        <ChoiceGroupLabel label="Program" />
        {PROGRAM_OPTIONS.map((option) => (
          <ChoiceCard
            key={option.value}
            option={option}
            selected={programType === option.value}
            onSelect={setProgramType}
          />
        ))}
        <ChoiceGroupLabel label="Visa or status" />
        {VISA_OPTIONS.map((option) => (
          <ChoiceCard
            key={option.value}
            option={option}
            selected={visaTypeOrStatus === option.value}
            onSelect={setVisaTypeOrStatus}
          />
        ))}
      </View>
    </OnboardingStepShell>
  );
}

function ChoiceGroupLabel({ label }: { label: string }) {
  return <Text role="h4" style={{ marginTop: space[3] }}>{label}</Text>;
}
