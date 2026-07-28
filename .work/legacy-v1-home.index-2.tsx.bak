import React, { useMemo } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ShieldAlert, Compass, Sparkles } from 'lucide-react-native';

import { Text, NetworkIndicator, EmptyState } from '../../src/components/ui';
import { ByeongpungStrip } from '../../src/components/byeongpung/ByeongpungStrip';
import { DDayBanner } from '../../src/components/home/DDayBanner';
import { PhaseTabs } from '../../src/components/home/PhaseTabs';
import { JourneyCompletePrompt } from '../../src/components/home/JourneyCompletePrompt';
import { MissionCard } from '../../src/components/mission/MissionCard';

import { palette, space, categoryColors } from '../../design-tokens';
import { useProfile } from '../../src/hooks/useProfile';
import { useCompletedMissions } from '../../src/hooks/useCompletedMissions';
import { useTotalCompletions } from '../../src/hooks/useTotalCompletions';
import { useJourneyMilestones } from '../../src/hooks/useJourneyMilestones';
import { calcPhase, dDay, setPhaseOverride, Phase } from '../../src/hooks/usePhase';
import { missionsForHousing, MissionCategory } from '../../src/data/missions';
import { track } from '../../src/lib/posthog';

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

export default function Home() {
  const router = useRouter();
  const { profile } = useProfile();
  const { set: completedSet } = useCompletedMissions();
  const { missionCount, total: totalCompleted } = useTotalCompletions();

  const arrivalDate = profile?.arrivalDate ?? null;
  const departureDate = profile?.departureDate ?? null;
  const computedPhase = calcPhase({ arrivalDate, departureDate });
  const revealedPanels = useMemo(() => {
    return Array.from({ length: 8 }).filter(
      (_, i) => (totalCompleted - i * 6) / 6 >= 1,
    ).length;
  }, [totalCompleted]);
  useJourneyMilestones({ computedPhase, departureDate });
  const [activePhase, setActivePhase] = React.useState<Phase>(computedPhase);

  React.useEffect(() => {
    setActivePhase(computedPhase);
  }, [computedPhase]);

  const days = dDay(departureDate);

  const housing = profile?.housing ?? null;
  const visibleMissions = useMemo(() => missionsForHousing(housing), [housing]);

  const countsByPhase = useMemo(() => {
    const counts: Record<Phase, { done: number; total: number }> = {
      1: { done: 0, total: 0 },
      2: { done: 0, total: 0 },
      3: { done: 0, total: 0 },
      4: { done: 0, total: 0 },
    };
    for (const m of visibleMissions) {
      counts[m.phase].total += 1;
      if (completedSet.has(m.id)) counts[m.phase].done += 1;
    }
    return counts;
  }, [visibleMissions, completedSet]);

  const phaseMissions = useMemo(
    () => visibleMissions.filter((m) => m.phase === activePhase),
    [visibleMissions, activePhase],
  );
  const groupedByCategory = useMemo(() => {
    const groups: Record<MissionCategory, typeof phaseMissions> = {
      settle: [],
      food: [],
      activity: [],
      culture: [],
    };
    for (const m of phaseMissions) groups[m.category].push(m);
    return groups;
  }, [phaseMissions]);

  function handlePhaseChange(p: Phase) {
    setActivePhase(p);
    if (p !== computedPhase) {
      setPhaseOverride(p);
      track('phase_manual_override', { from: computedPhase, to: p });
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
          <View>
            <Text role="h2">Hi, {profile?.displayName ?? 'traveler'}</Text>
          </View>
          <View style={styles.headerActions}>
            <NetworkIndicator />
            <Pressable
              onPress={() => router.push('/emergency')}
              hitSlop={8}
              style={styles.iconBtn}
              accessibilityRole="button"
              accessibilityLabel="Emergency guide"
            >
              <ShieldAlert size={22} color={palette.meok} strokeWidth={1.5} />
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <JourneyCompletePrompt departureDate={departureDate} />
        </View>

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
          {revealedPanels === 0 ? (
            <Text
              role="sm"
              color={palette.ash}
              align="center"
              style={{ marginTop: space[2] }}
            >
              Complete missions to reveal your byeongpung (병풍).
            </Text>
          ) : null}
        </View>

        <View style={styles.section}>
          <DDayBanner
            daysLeft={days}
            completedCount={missionCount}
            totalMissions={visibleMissions.length}
            phaseLabel={`Phase ${activePhase} · ${PHASE_LABEL[activePhase]}`}
          />
        </View>

        <PhaseTabs active={activePhase} onChange={handlePhaseChange} countsByPhase={countsByPhase} />

        {totalCompleted === 0 && computedPhase === 1 ? (
          <EmptyState
            variant="header"
            screenName="home_pre_arrival"
            icon={<Compass size={48} color={categoryColors.settle} strokeWidth={1.5} />}
            message="Your first mission is below — start anywhere."
            accessibilityLabel="Your journey starts here. Missions are listed below."
          />
        ) : null}
        {totalCompleted === 0 && computedPhase >= 2 ? (
          <EmptyState
            variant="header"
            screenName="home_post_arrival"
            icon={<Sparkles size={48} color={palette.hwanggeum} strokeWidth={1.5} />}
            message="You're here — your first mission is below."
            accessibilityLabel="You've arrived. Missions are listed below."
          />
        ) : null}

        <View style={[styles.section, { gap: space[5] }]}>
          {(Object.keys(groupedByCategory) as MissionCategory[]).map((cat) => {
            const list = groupedByCategory[cat];
            if (list.length === 0) return null;
            return (
              <View key={cat} style={{ gap: space[2] }}>
                <Text role="h4">{CATEGORY_LABEL[cat]}</Text>
                <View style={{ gap: space[2] }}>
                  {list.map((m) => (
                    <MissionCard
                      key={m.id}
                      mission={m}
                      completed={completedSet.has(m.id)}
                      onPress={() => router.push(`/mission/${m.id}`)}
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
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: palette.cloud,
  },
  section: {
    paddingHorizontal: space[5],
    paddingVertical: space[3],
  },
});
