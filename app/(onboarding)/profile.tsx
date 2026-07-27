import React, { useState } from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Building2, Home as HomeIcon } from 'lucide-react-native';

import { Text, Button, Input, Card, ProgressBar } from '../../src/components/ui';
import { palette, space, radius, semantic } from '../../design-tokens';
import { updateUserProfile } from '../../src/lib/firebase';
import { UNIVERSITIES } from '../../src/data/universities';
import { track } from '../../src/lib/posthog';
import { showOperationError } from '../../src/lib/errorAlert';

const STAY_TYPES = [
  { value: 'exchange-1', label: 'Exchange — 1 semester' },
  { value: 'exchange-2', label: 'Exchange — 2 semesters' },
  { value: 'language', label: 'Language program' },
  { value: 'working-holiday', label: 'Working holiday' },
] as const;

const HOUSING_TYPES = [
  { value: 'dormitory', label: 'University dormitory', icon: 'building' },
  { value: 'off-campus', label: 'Off-campus (rented)', icon: 'home' },
] as const;

export default function ProfileSetup() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [universityId, setUniversityId] = useState<string | null>(null);
  const [stayType, setStayType] = useState<typeof STAY_TYPES[number]['value'] | null>(null);
  const [housing, setHousing] = useState<typeof HOUSING_TYPES[number]['value'] | null>(null);
  const [saving, setSaving] = useState(false);

  const totalSteps = 4;

  function canAdvance(): boolean {
    if (step === 0) return name.trim().length >= 1;
    if (step === 1) return universityId !== null;
    if (step === 2) return stayType !== null;
    if (step === 3) return housing !== null;
    return false;
  }

  async function handleNext() {
    if (!canAdvance()) return;
    if (step < totalSteps - 1) {
      setStep((s) => s + 1);
      track('onboarding_step_complete', { step: 'profile_' + step });
      return;
    }
    setSaving(true);
    try {
      await updateUserProfile({
        displayName: name.trim(),
        university: universityId,
        stayType,
        housing,
      });
      track('onboarding_step_complete', { step: 'profile_done' });
      router.push('/(onboarding)/dates');
    } catch (err) {
      showOperationError('save your profile', err, { onPrimary: handleNext });
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.header}>
        {step > 0 ? (
          <Pressable
            onPress={() => setStep((s) => s - 1)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <ChevronLeft size={24} color={palette.meok} />
          </Pressable>
        ) : (
          <View style={{ width: 24 }} />
        )}
        <ProgressBar value={(step + 1) / totalSteps} color={palette.dancheong} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.body}>
        {step === 0 && (
          <View style={{ gap: space[3] }}>
            <Text role="h1">What should we call you?</Text>
            <Text role="body" color={palette.ash}>
              The name that shows up next to your byeongpung.
            </Text>
            <View style={{ marginTop: space[5] }}>
              <Input
                value={name}
                onChangeText={setName}
                placeholder="e.g. Alex"
                autoFocus
                autoCapitalize="words"
              />
            </View>
          </View>
        )}

        {step === 1 && (
          <View style={{ gap: space[3] }}>
            <Text role="h1">Which university?</Text>
            <Text role="body" color={palette.ash}>
              Pick yours — we&apos;ll tailor your missions to your campus.
            </Text>
            <View style={{ gap: space[2], marginTop: space[5] }}>
              {UNIVERSITIES.map((uni) => {
                const active = universityId === uni.id;
                return (
                  <Card
                    key={uni.id}
                    onPress={() => setUniversityId(uni.id)}
                    style={{
                      borderColor: active ? palette.dancheong : palette.hairline,
                      borderWidth: active ? 2 : 1,
                    }}
                  >
                    <Text role="body" weight="semibold">
                      {uni.shortName}
                    </Text>
                    <Text role="sm" color={palette.ash}>
                      {uni.nameEn} ({uni.nameKo})
                    </Text>
                  </Card>
                );
              })}
            </View>
          </View>
        )}

        {step === 2 && (
          <View style={{ gap: space[3] }}>
            <Text role="h1">What kind of stay?</Text>
            <Text role="body" color={palette.ash}>
              We&apos;ll set the right number of phases for your time here.
            </Text>
            <View style={{ gap: space[2], marginTop: space[5] }}>
              {STAY_TYPES.map((t) => {
                const active = stayType === t.value;
                return (
                  <Card
                    key={t.value}
                    onPress={() => setStayType(t.value)}
                    style={{
                      borderColor: active ? palette.dancheong : palette.hairline,
                      borderWidth: active ? 2 : 1,
                    }}
                  >
                    <Text role="body" weight="semibold">
                      {t.label}
                    </Text>
                  </Card>
                );
              })}
            </View>
          </View>
        )}

        {step === 3 && (
          <View style={{ gap: space[3] }}>
            <Text role="h1">Where will you live?</Text>
            <Text role="body" color={palette.ash}>
              Dorm or off-campus — your prep checklist looks a bit different.
            </Text>
            <View style={{ gap: space[2], marginTop: space[5] }}>
              {HOUSING_TYPES.map((h) => {
                const active = housing === h.value;
                const Icon = h.value === 'dormitory' ? Building2 : HomeIcon;
                return (
                  <Card
                    key={h.value}
                    onPress={() => setHousing(h.value)}
                    style={{
                      borderColor: active ? palette.dancheong : palette.hairline,
                      borderWidth: active ? 2 : 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: space[3],
                    }}
                  >
                    <View
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: radius.card,
                        backgroundColor: palette.cloud,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={22} color={palette.meok} />
                    </View>
                    <Text role="body" weight="semibold">
                      {h.label}
                    </Text>
                  </Card>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={step < totalSteps - 1 ? 'Next' : 'Continue'}
          onPress={handleNext}
          disabled={!canAdvance()}
          loading={saving}
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.hanji,
  },
  header: {
    paddingHorizontal: space[5],
    paddingVertical: space[4],
    flexDirection: 'row',
    gap: space[3],
    alignItems: 'center',
  },
  body: {
    paddingHorizontal: space[5],
    paddingVertical: space[4],
    paddingBottom: space[8],
  },
  footer: {
    paddingHorizontal: space[5],
    paddingBottom: space[4],
    paddingTop: space[3],
    borderTopWidth: 1,
    borderTopColor: semantic.border.hairline,
  },
});
