// Screen ID: ONB-04 — Housing and contract holder.
import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';

import {
  ChoiceCard,
  OnboardingStepShell,
  UNKNOWN_LABEL,
  useOnboardingStepGuard,
} from '../../src/components/onboarding/ConditionStep';
import {
  UNKNOWN,
  type ContractHolder,
  type HousingType,
} from '../../src/lib/firebase';
import { updateUserProfile } from '../../src/lib/firebase';
import { setOnboardingProgress } from '../../src/lib/storage';
import { showOperationError } from '../../src/lib/errorAlert';
import { track } from '../../src/lib/posthog';
import { space } from '../../design-tokens';
import { Text } from '../../src/components/ui';

// REQ-DAR-001 · REQ-DAR-005 · POL-003: collect the four housing types and contract holder.
const HOUSING_OPTIONS = [
  { value: 'dormitory', label: 'University dormitory' },
  { value: 'own_lease', label: 'Private lease' },
  { value: 'third_party_lease', label: 'Shared housing' },
  { value: 'registered_business', label: 'Registered business accommodation' },
  { value: UNKNOWN, label: UNKNOWN_LABEL },
] satisfies readonly { value: HousingType; label: string }[];

const CONTRACT_OPTIONS = [
  { value: 'self', label: 'I hold the contract' },
  { value: 'third_party', label: 'Someone else or a company holds it' },
  { value: 'none', label: 'There is no contract' },
  { value: 'undecided', label: 'Not decided yet' },
  { value: 'n_a', label: 'Not applicable' },
  { value: UNKNOWN, label: UNKNOWN_LABEL },
] satisfies readonly { value: ContractHolder; label: string }[];

export default function HousingScreen() {
  const profile = useOnboardingStepGuard('housing');
  const initialHousingType = profile?.housingType ?? UNKNOWN;
  const initialContractHolder = profile?.contractHolder ?? UNKNOWN;

  return (
    <HousingForm
      key={JSON.stringify([!!profile, initialHousingType, initialContractHolder])}
      initialHousingType={initialHousingType}
      initialContractHolder={initialContractHolder}
    />
  );
}

function HousingForm({
  initialHousingType,
  initialContractHolder,
}: {
  initialHousingType: HousingType;
  initialContractHolder: ContractHolder;
}) {
  const router = useRouter();
  const [housingType, setHousingType] = useState<HousingType>(initialHousingType);
  const [contractHolder, setContractHolder] = useState<ContractHolder>(initialContractHolder);
  const [saving, setSaving] = useState(false);

  async function handleContinue() {
    setSaving(true);
    try {
      await updateUserProfile({
        housingType,
        contractHolder,
        housing: housingType === 'dormitory' ? 'dormitory' : housingType === UNKNOWN ? null : 'off-campus',
      });
      setOnboardingProgress('stay-length');
      track('onboarding_step_complete', { step: 'housing' });
      router.push('/(onboarding)/stay-length');
    } catch (error) {
      showOperationError('save your housing details', error, { onPrimary: handleContinue });
    } finally {
      setSaving(false);
    }
  }

  return (
    <OnboardingStepShell
      stepNumber={4}
      title="Where will you live?"
      description="Your housing and contract holder can change which documents apply."
      canContinue={!!housingType && !!contractHolder}
      onContinue={handleContinue}
      saving={saving}
    >
      <View style={{ gap: space[2], marginTop: space[5] }}>
        <SectionLabel label="Housing" />
        {HOUSING_OPTIONS.map((option) => (
          <ChoiceCard
            key={option.value}
            option={option}
            selected={housingType === option.value}
            onSelect={setHousingType}
          />
        ))}
        <SectionLabel label="Contract holder" />
        {CONTRACT_OPTIONS.map((option) => (
          <ChoiceCard
            key={option.value}
            option={option}
            selected={contractHolder === option.value}
            onSelect={setContractHolder}
          />
        ))}
      </View>
    </OnboardingStepShell>
  );
}

function SectionLabel({ label }: { label: string }) {
  return <Text role="h4" style={{ marginTop: space[3] }}>{label}</Text>;
}
