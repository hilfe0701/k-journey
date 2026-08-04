import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowRight, ShieldAlert, Sparkles } from 'lucide-react-native';
import { useIsFocused } from '@react-navigation/native';

import { IconButton, NetworkIndicator, Text } from '../../src/components/ui';
import { ByeongpungStrip } from '../../src/components/byeongpung/ByeongpungStrip';
import { DDayBanner } from '../../src/components/home/DDayBanner';
import { JourneyCompletePrompt } from '../../src/components/home/JourneyCompletePrompt';
import { JourneyModeSwitch } from '../../src/components/home/JourneyModeSwitch';
import { PhaseTabs } from '../../src/components/home/PhaseTabs';
import { MissionCard } from '../../src/components/mission/MissionCard';
import { palette, radius, space } from '../../design-tokens';
import { missionsForHousing, type MissionCategory } from '../../src/data/missions';
import { useCompletedMissions } from '../../src/hooks/useCompletedMissions';
import { useJourneyMilestones } from '../../src/hooks/useJourneyMilestones';
import { calcDatePhase, calcPhase, dDay, setPhaseOverride, type Phase } from '../../src/hooks/usePhase';
import { useProfile } from '../../src/hooks/useProfile';
import { useTotalCompletions } from '../../src/hooks/useTotalCompletions';
import { knownProfileDate, selectMissionHousing } from '../../src/lib/profileCompat';
import { track } from '../../src/lib/posthog';
import ChecklistHome from './checklist';

const PHASE_LABEL: Record<Phase, string> = {
  1: 'Pre-arrival',
  2: 'First week',
  3: 'Living',
  4: 'Pre-departure',
};

const CATEGORY_LABEL: Record<MissionCategory, string> = {
  settle: 'Settle in',
  food: 'Food & taste',
  activity: 'Activities',
  culture: 'Culture',
};

export default function JourneyHome() {
  const isFocused = useIsFocused();
  const router = useRouter();
  const { view } = useLocalSearchParams<{ view?: string }>();
  const [mode, setMode] = React.useState<'essentials' | 'culture'>(
    view === 'culture' ? 'culture' : 'essentials',
  );

  React.useEffect(() => {
    if (view === 'culture') setMode('culture');
  }, [view]);

  function changeMode(next: 'essentials' | 'culture') {
    if (next === mode) return;
    track('journey_view_change', { from: mode, to: next });
    setMode(next);
    router.setParams({ view: next === 'culture' ? 'culture' : undefined });
  }

  return (
    <View
      style={styles.root}
      accessibilityElementsHidden={!isFocused}
      importantForAccessibility={isFocused ? 'auto' : 'no-hide-descendants'}
      aria-hidden={!isFocused}
    >
      {mode === 'essentials' ? (
        <ChecklistHome onShowCulture={() => changeMode('culture')} />
      ) : (
        <CultureJourneyHome onShowEssentials={() => changeMode('essentials')} />
      )}
    </View>
  );
}

function CultureJourneyHome({ onShowEssentials }: { onShowEssentials: () => void }) {
  const router = useRouter();
  const { profile } = useProfile();
  const { set: completedSet } = useCompletedMissions();
  const { missionCount, total: totalCompleted } = useTotalCompletions();

  const arrivalDate = knownProfileDate(profile?.arrivalDate);
  const departureDate = knownProfileDate(profile?.departureDate);
  const departureDaysLeft = dDay(departureDate);
  const computedPhase = calcDatePhase({ arrivalDate, departureDate });
  const selectedPhase = calcPhase({ arrivalDate, departureDate });
  const housing = selectMissionHousing(profile);
  const visibleMissions = useMemo(() => missionsForHousing(housing), [housing]);
  const revealedPanels = Math.min(8, Math.floor(totalCompleted / 6));

  useJourneyMilestones({ computedPhase, departureDate });
  const [activePhase, setActivePhase] = React.useState<Phase>(selectedPhase);

  React.useEffect(() => {
    setActivePhase(selectedPhase);
  }, [selectedPhase]);

  const countsByPhase = useMemo(() => {
    const counts: Record<Phase, { done: number; total: number }> = {
      1: { done: 0, total: 0 },
      2: { done: 0, total: 0 },
      3: { done: 0, total: 0 },
      4: { done: 0, total: 0 },
    };
    for (const mission of visibleMissions) {
      counts[mission.phase].total += 1;
      if (completedSet.has(mission.id)) counts[mission.phase].done += 1;
    }
    return counts;
  }, [completedSet, visibleMissions]);

  const phaseMissions = useMemo(
    () => visibleMissions.filter((mission) => mission.phase === activePhase),
    [activePhase, visibleMissions],
  );
  const focusMission =
    phaseMissions.find((mission) => !completedSet.has(mission.id)) ?? phaseMissions[0];
  const nextPanel = Math.min(8, Math.floor(totalCompleted / 6) + 1);
  const completionsToNextPanel =
    totalCompleted >= 48 ? 0 : 6 - (totalCompleted % 6);

  const groupedByCategory = useMemo(() => {
    const groups: Record<MissionCategory, typeof phaseMissions> = {
      settle: [],
      food: [],
      activity: [],
      culture: [],
    };
    for (const mission of phaseMissions) groups[mission.category].push(mission);
    return groups;
  }, [phaseMissions]);

  function handlePhaseChange(phase: Phase) {
    setActivePhase(phase);
    if (phase !== computedPhase) {
      setPhaseOverride(phase);
      track('phase_manual_override', { from: computedPhase, to: phase });
    } else {
      setPhaseOverride(null);
    }
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: space[16] }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text role="h2">Hi, {profile?.displayName ?? 'traveler'}</Text>
            <Text role="sm" color={palette.ash}>Make your life in Korea memorable.</Text>
          </View>
          <View style={styles.headerActions}>
            <NetworkIndicator />
            <IconButton
              icon={ShieldAlert}
              accessibilityLabel="Emergency guide"
              surface
              onPress={() => {
                track('emergency_open');
                router.push('/emergency');
              }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <JourneyModeSwitch
            active="culture"
            onChange={(next) => {
              if (next === 'essentials') onShowEssentials();
            }}
          />
        </View>

        {departureDate && departureDaysLeft !== null && departureDaysLeft <= 0 ? (
          <View style={styles.section}>
            <JourneyCompletePrompt departureDate={departureDate} />
          </View>
        ) : null}

        {focusMission ? (
          <View style={styles.section}>
            <Pressable
              onPress={() => router.push(`/mission/${focusMission.id}`)}
              accessibilityRole="button"
              accessibilityLabel={`Start cultural mission: ${focusMission.titleEn}`}
              style={({ pressed }) => [
                styles.focusCard,
                { opacity: pressed ? 0.82 : 1 },
              ]}
            >
              <View style={styles.focusEyebrow}>
                <View style={styles.focusIcon}>
                  <Sparkles size={18} color={palette.hwanggeumDeep} strokeWidth={1.6} />
                </View>
                <Text role="badge" color={palette.hwanggeumDeep}>
                  Start here · Phase {activePhase}
                </Text>
              </View>
              <Text role="h3">{focusMission.titleEn}</Text>
              <Text role="sm" color={palette.meokMid} numberOfLines={2}>
                {focusMission.summary}
              </Text>
              <View style={styles.focusFooter}>
                <Text role="sm" color={palette.cheong} weight="semibold">
                  {completionsToNextPanel === 0
                    ? 'Your folding screen is complete'
                    : `${completionsToNextPanel} moment${completionsToNextPanel === 1 ? '' : 's'} to panel ${nextPanel}`}
                </Text>
                <ArrowRight size={18} color={palette.cheong} strokeWidth={1.7} />
              </View>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.section}>
          <Pressable
            onPress={() => router.push('/(tabs)/byeongpung')}
            accessibilityRole="link"
            accessibilityLabel={
              revealedPanels === 0
                ? 'Byeongpung — 0 of 8 panels revealed. Complete missions to reveal them.'
                : `Open byeongpung, ${revealedPanels} of 8 panels revealed`
            }
          >
            <ByeongpungStrip completedCount={totalCompleted} />
          </Pressable>
          <Text role="sm" color={palette.ash} align="center" style={styles.byeongpungHint}>
            {revealedPanels === 0
              ? 'Complete missions or bucket-list items to reveal your byeongpung (병풍).'
              : `${revealedPanels} of 8 panels revealed · keep exploring`}
          </Text>
        </View>

        <View style={styles.section}>
          <DDayBanner
            daysLeft={departureDaysLeft}
            completedCount={missionCount}
            totalMissions={visibleMissions.length}
            phaseLabel={`Phase ${activePhase} · ${PHASE_LABEL[activePhase]}`}
          />
        </View>

        <PhaseTabs active={activePhase} onChange={handlePhaseChange} countsByPhase={countsByPhase} />

        <View style={[styles.section, styles.missionGroups]}>
          {(Object.keys(groupedByCategory) as MissionCategory[]).map((category) => {
            const missions = groupedByCategory[category];
            if (missions.length === 0) return null;
            return (
              <View key={category} style={styles.missionGroup}>
                <Text role="h4">{CATEGORY_LABEL[category]}</Text>
                <View style={styles.missionList}>
                  {missions.map((mission) => (
                    <MissionCard
                      key={mission.id}
                      mission={mission}
                      completed={completedSet.has(mission.id)}
                      onPress={() => router.push(`/mission/${mission.id}`)}
                    />
                  ))}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.hanji },
  header: {
    paddingHorizontal: space[5],
    paddingVertical: space[4],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space[3],
  },
  headerCopy: { flex: 1, gap: space[1] },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: palette.cloud,
  },
  section: { paddingHorizontal: space[5], paddingVertical: space[3] },
  focusCard: {
    gap: space[2],
    padding: space[4],
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: palette.hwanggeum + '66',
    backgroundColor: palette.hwanggeumLight,
  },
  focusEyebrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
  },
  focusIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.hanji,
  },
  focusFooter: {
    minHeight: 36,
    marginTop: space[1],
    paddingTop: space[2],
    borderTopWidth: 1,
    borderTopColor: palette.hwanggeum + '44',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space[2],
  },
  byeongpungHint: { marginTop: space[2] },
  missionGroups: { gap: space[5] },
  missionGroup: { gap: space[2] },
  missionList: { gap: space[2] },
});
