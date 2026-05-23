import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, MapPin, Lightbulb, Check, Building2, X } from 'lucide-react-native';
import { resolveIcon } from '../../src/lib/icons';

import { Text, Button, Badge } from '../../src/components/ui';
import { palette, space, radius, categoryColors } from '../../design-tokens';
import { missionById, Mission } from '../../src/data/missions';
import { universityById, University } from '../../src/data/universities';
import { useAuth } from '../../src/hooks/useAuth';
import { useProfile } from '../../src/hooks/useProfile';
import { useCompletedMissions } from '../../src/hooks/useCompletedMissions';
import { useTotalCompletions } from '../../src/hooks/useTotalCompletions';
import { markMissionComplete, unmarkMission } from '../../src/lib/firebase';
import { firePanelUnlock, claimPanelUnlock } from '../../src/lib/notifications';
import { showOperationError } from '../../src/lib/errorAlert';
import { track } from '../../src/lib/posthog';
import { useTheme } from '../../src/theme/ThemeProvider';
import { MissionCompleteOverlay } from '../../src/components/mission/MissionCompleteOverlay';

interface OverlayState {
  iconName: string;
  iconColor: string;
  isPanelUnlock: boolean;
  panelNumber?: number;
  panelColor?: string;
}

export default function MissionDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { set: completedSet } = useCompletedMissions();
  const { total: totalCompletions } = useTotalCompletions();
  const theme = useTheme();
  const [busy, setBusy] = useState(false);
  const [overlay, setOverlay] = useState<OverlayState | null>(null);

  const mission = id ? missionById(id) : null;
  const uni = profile?.university ? universityById(profile.university) : undefined;

  async function toggleComplete(m: NonNullable<typeof mission>) {
    if (!user) return;
    const isCompleting = !completedSet.has(m.id);
    setBusy(true);
    try {
      if (isCompleting) {
        // Write first — celebration / panel-claim only fires on success so a
        // failed write doesn't burn the user's once-per-panel claim.
        await markMissionComplete(user.uid, m.id);
        track('mission_complete', {
          missionId: m.id,
          phase: m.phase,
          category: m.category,
        });

        const newCount = totalCompletions + 1;
        const crossingThreshold = newCount > 0 && newCount <= 48 && newCount % 6 === 0;
        const candidatePanel = crossingThreshold ? newCount / 6 : undefined;
        const panelClaimed = candidatePanel ? claimPanelUnlock(candidatePanel) : false;
        const panelNumber = panelClaimed ? candidatePanel : undefined;
        const panelColor =
          panelNumber ? theme.era.panelColors[panelNumber - 1] : undefined;

        if (panelClaimed && panelNumber) {
          track('panel_unlock', { panelNumber, source: 'mission' });
          firePanelUnlock(panelNumber, theme.era.nameEn);
        }
        setOverlay({
          iconName: m.icon,
          iconColor: categoryColors[m.category],
          isPanelUnlock: panelClaimed,
          panelNumber,
          panelColor,
        });
      } else {
        await unmarkMission(user.uid, m.id);
        track('mission_uncomplete', { missionId: m.id });
        router.back();
      }
    } catch (err) {
      showOperationError(isCompleting ? 'mark this complete' : 'unmark this', err);
    } finally {
      setBusy(false);
    }
  }

  function handleOverlayDismiss() {
    setOverlay(null);
    router.back();
  }

  if (!mission) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <ChevronLeft size={24} color={palette.meok} />
          </Pressable>
          <Text role="body" weight="semibold">
            Mission not found
          </Text>
          <View style={{ width: 24 }} />
        </View>
      </SafeAreaView>
    );
  }

  const isCompleted = completedSet.has(mission.id);
  const color = categoryColors[mission.category];
  const Icon = resolveIcon(mission.icon);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <ChevronLeft size={24} color={palette.meok} />
        </Pressable>
        <Badge label={`PHASE ${mission.phase}`} color={color} bg={color + '1F'} />
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <View style={[styles.iconHero, { backgroundColor: color + '14' }]}>
          <Icon size={48} color={color} strokeWidth={1.4} />
        </View>

        <View style={{ gap: space[2] }}>
          <Text role="h1">{mission.titleEn}</Text>
          {mission.titleKo ? (
            <Text role="lead" color={palette.ash}>
              {mission.titleKo}
            </Text>
          ) : null}
          <Text role="body" color={palette.meokMid}>
            {mission.summary}
          </Text>
        </View>

        <View style={styles.tipsBlock}>
          <View style={styles.sectionHead}>
            <Lightbulb size={18} color={palette.hwanggeum} strokeWidth={1.6} />
            <Text role="body" weight="semibold">
              Tips
            </Text>
          </View>
          {mission.tips.map((tip, idx) => (
            <View key={idx} style={styles.tipRow}>
              <View style={styles.tipBullet} />
              <Text role="sm" color={palette.meokMid}>
                {tip}
              </Text>
            </View>
          ))}
        </View>

        {mission.mapHint ? (
          <View style={styles.mapBlock}>
            <View style={styles.sectionHead}>
              <MapPin size={18} color={palette.cheong} strokeWidth={1.6} />
              <Text role="body" weight="semibold">
                Where to find it
              </Text>
            </View>
            <Text role="sm" color={palette.meokMid}>
              {mission.mapHint}
            </Text>
          </View>
        ) : null}

        <UniversityContextBlock mission={mission} uni={uni} />
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={isCompleted ? 'Mark as not done' : 'Mark complete'}
          onPress={() => toggleComplete(mission)}
          loading={busy}
          variant={isCompleted ? 'secondary' : 'primary'}
          fullWidth
          leftIcon={!isCompleted ? <Check size={18} color={palette.hanji} /> : undefined}
        />
      </View>

      <MissionCompleteOverlay
        visible={overlay !== null}
        iconName={overlay?.iconName ?? 'Sparkles'}
        iconColor={overlay?.iconColor ?? palette.dancheong}
        isPanelUnlock={overlay?.isPanelUnlock ?? false}
        panelNumber={overlay?.panelNumber}
        panelColor={overlay?.panelColor}
        onDismiss={handleOverlayDismiss}
      />
    </SafeAreaView>
  );
}

function UniversityContextBlock({
  mission,
  uni,
}: {
  mission: Mission;
  uni: University | undefined;
}) {
  if (!uni) return null;

  if (mission.id === 'p1_dorm_rules' && mission.appliesTo === 'dormitory') {
    return (
      <View style={styles.uniBlock}>
        <View style={styles.sectionHead}>
          <Building2 size={18} color={palette.hwanggeumDeep} strokeWidth={1.6} />
          <Text role="body" weight="semibold">
            {uni.shortName} dorm — prohibited
          </Text>
        </View>
        <View style={{ gap: space[1], marginTop: space[2] }}>
          {uni.dorm.prohibited.map((item) => (
            <View key={item} style={styles.bullet}>
              <X size={14} color={palette.dancheong} strokeWidth={2} />
              <Text role="sm" color={palette.meokMid} style={{ flex: 1 }}>
                {item}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (mission.id === 'p2_dorm_checkin' && mission.appliesTo === 'dormitory') {
    return (
      <View style={styles.uniBlock}>
        <View style={styles.sectionHead}>
          <Building2 size={18} color={palette.hwanggeumDeep} strokeWidth={1.6} />
          <Text role="body" weight="semibold">
            {uni.shortName} check-in
          </Text>
        </View>
        <Text role="sm" color={palette.meokMid} style={{ marginTop: space[2] }}>
          {uni.dorm.checkin}
        </Text>
        {uni.dorm.laundry ? (
          <Text role="sm" color={palette.meokMid} style={{ marginTop: space[2] }}>
            Laundry: {uni.dorm.laundry}
          </Text>
        ) : null}
      </View>
    );
  }

  if (mission.id === 'p4_dorm_out' && mission.appliesTo === 'dormitory') {
    return (
      <View style={styles.uniBlock}>
        <View style={styles.sectionHead}>
          <Building2 size={18} color={palette.hwanggeumDeep} strokeWidth={1.6} />
          <Text role="body" weight="semibold">
            {uni.shortName} dorm desk
          </Text>
        </View>
        <Text role="sm" color={palette.meokMid} style={{ marginTop: space[2] }}>
          Hand the key in at the same desk you checked in: {uni.dorm.checkin}
        </Text>
      </View>
    );
  }

  if (mission.appliesTo === 'off-campus' && uni.offCampusArea.length > 0) {
    return (
      <View style={styles.uniBlock}>
        <View style={styles.sectionHead}>
          <Building2 size={18} color={palette.hwanggeumDeep} strokeWidth={1.6} />
          <Text role="body" weight="semibold">
            Near {uni.shortName}
          </Text>
        </View>
        <Text role="sm" color={palette.meokMid} style={{ marginTop: space[2] }}>
          Most {uni.shortName} students rent in: {uni.offCampusArea.join(', ')}.
        </Text>
      </View>
    );
  }

  return null;
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
    gap: space[5],
  },
  iconHero: {
    width: 96,
    height: 96,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipsBlock: {
    gap: space[3],
    backgroundColor: palette.cloud,
    padding: space[4],
    borderRadius: radius.card,
  },
  mapBlock: {
    gap: space[2],
    padding: space[4],
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: palette.hairline,
  },
  uniBlock: {
    gap: space[1],
    padding: space[4],
    borderRadius: radius.card,
    backgroundColor: palette.hwanggeum + '14',
    borderWidth: 1,
    borderColor: palette.hwanggeum + '55',
  },
  bullet: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
  },
  tipRow: {
    flexDirection: 'row',
    gap: space[2],
    alignItems: 'flex-start',
  },
  tipBullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: palette.ash,
    marginTop: 8,
  },
  footer: {
    paddingHorizontal: space[5],
    paddingVertical: space[3],
    borderTopWidth: 1,
    borderTopColor: palette.hairline,
  },
});
