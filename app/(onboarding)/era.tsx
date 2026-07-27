import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Check, ChevronLeft } from 'lucide-react-native';

import { Text, Button } from '../../src/components/ui';
import { palette, space, radius, semantic, elevation } from '../../design-tokens';
import { ERA_LIST } from '../../src/theme/eras';
import { BYEONGPUNG_PANEL_IMAGES } from '../../src/components/byeongpung/motifs';
import { useProfile } from '../../src/hooks/useProfile';
import { updateUserProfile } from '../../src/lib/firebase';
import { track } from '../../src/lib/posthog';
import { showOperationError } from '../../src/lib/errorAlert';

export default function EraScreen() {
  const router = useRouter();
  const { profile } = useProfile();
  const isEditing = !!profile?.onboardingCompletedAt;
  const [selected, setSelected] = useState<typeof ERA_LIST[number]['key']>(
    profile?.era ?? 'joseon',
  );
  const [saving, setSaving] = useState(false);

  async function handleStart() {
    setSaving(true);
    try {
      const previousEra = profile?.era ?? null;
      const patch: Parameters<typeof updateUserProfile>[0] = { era: selected };
      if (!isEditing) patch.onboardingCompletedAt = new Date().toISOString();
      await updateUserProfile(patch);
      if (isEditing) {
        if (previousEra !== selected) {
          track('era_switch', { from: previousEra, to: selected });
        }
        router.back();
      } else {
        track('onboarding_complete', {
          era: selected,
          university: profile?.university ?? null,
          housing: profile?.housing ?? null,
        });
        router.replace('/(tabs)');
      }
    } catch (err) {
      showOperationError('save your era', err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ChevronLeft size={24} color={palette.meok} />
        </Pressable>
        <Text role="body" weight="semibold">
          Pick your era
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <Text role="h1">Which painting tradition?</Text>
        <Text role="body" color={palette.ash}>
          Your byeongpung will unfold in this style. Change it anytime.
        </Text>

        <View style={{ gap: space[3], marginTop: space[5] }}>
          {ERA_LIST.map((era) => {
            const active = era.key === selected;
            return (
              <Pressable
                key={era.key}
                onPress={() => setSelected(era.key)}
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
                />
                <View style={styles.cardBody}>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: space[2] }}>
                    <Text role="h3">{era.nameEn}</Text>
                    <Text role="body" color={palette.ash}>
                      {era.nameKo}
                    </Text>
                  </View>
                  <Text role="sm" color={palette.ash}>
                    {era.tagline}
                  </Text>
                </View>
                {active ? (
                  <View style={[styles.check, { backgroundColor: era.primary }]}>
                    <Check size={16} color={palette.hanji} />
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={isEditing ? 'Save era' : 'Begin your journey'}
          onPress={handleStart}
          loading={saving}
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.hanji },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space[5],
    paddingVertical: space[4],
  },
  body: {
    paddingHorizontal: space[5],
    paddingBottom: space[8],
    gap: space[2],
  },
  card: {
    borderRadius: radius.card,
    padding: space[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
  },
  swatch: {
    width: 88,
    height: 88,
    borderRadius: radius.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: palette.hairline,
  },
  cardBody: {
    flex: 1,
    gap: 4,
  },
  check: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: space[5],
    paddingBottom: space[4],
    paddingTop: space[3],
    borderTopWidth: 1,
    borderTopColor: semantic.border.hairline,
  },
});
