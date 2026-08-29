import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, ScrollView, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Share2 } from 'lucide-react-native';
import { format } from 'date-fns';
import { resolveIcon } from '../src/lib/icons';

import { Text, EmptyState, IconButton } from '../src/components/ui';
import { palette, space, radius, categoryColors } from '../design-tokens';
import { useTheme } from '../src/theme/ThemeProvider';
import { calcDatePhase, dDay } from '../src/hooks/usePhase';
import { useCompletedMissions } from '../src/hooks/useCompletedMissions';
import { useBuckets } from '../src/hooks/useBuckets';
import { useTotalCompletions } from '../src/hooks/useTotalCompletions';
import { useProfile } from '../src/hooks/useProfile';
import { missionById } from '../src/data/missions';
import { BUCKET_TEMPLATES } from '../src/data/bucketTemplates';
import {
  BYEONGPUNG_PANEL_IMAGES,
  BUCKET_TEMPLATE_IMAGES,
} from '../src/components/byeongpung/motifs';
import { track } from '../src/lib/posthog';
import { shareByeongpungImage } from '../src/lib/share';
import { knownProfileDate } from '../src/lib/profileCompat';

export default function Gallery() {
  const router = useRouter();
  const theme = useTheme();
  const { profile } = useProfile();
  const { completed } = useCompletedMissions();
  const { buckets } = useBuckets();
  const { total: totalCompleted } = useTotalCompletions();

  const shareRef = useRef<View>(null);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    // `completedTotal` is required per docs/ANALYTICS_SCHEMA.md so cohorts can
    // be filtered by completion progress at gallery-entry time.
    track('gallery_open', { completedTotal: totalCompleted });
  }, [totalCompleted]);

  const sortedCompletions = useMemo(() => {
    return [...completed]
      .filter((c) => c.completedAt !== null)
      .sort((a, b) => (b.completedAt!.getTime() - a.completedAt!.getTime()));
  }, [completed]);

  const panels = BYEONGPUNG_PANEL_IMAGES[theme.era.key];
  const arrivalDate = knownProfileDate(profile?.arrivalDate);
  const departureDate = knownProfileDate(profile?.departureDate);
  const phase = calcDatePhase({ arrivalDate, departureDate });
  const daysLeft = dDay(departureDate);
  const isPostDeparture = phase === 4 && daysLeft !== null && daysLeft < 0;
  const chaekgeoriPanel = panels[7];
  const completedPanels = panels.filter(
    (_, i) => (totalCompleted - i * 6) / 6 >= 1,
  ).length;

  const canShare = totalCompleted > 0;

  async function handleShare() {
    if (!canShare || sharing) return;
    setSharing(true);
    try {
      const ok = await shareByeongpungImage(shareRef, 'Share your journey');
      if (ok) track('byeongpung_share', { source: 'gallery', completedPanels });
    } finally {
      setSharing(false);
    }
  }

  const displayName = profile?.displayName ?? 'Traveler';

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <IconButton
          icon={ChevronLeft}
          size={24}
          tone="inverse"
          accessibilityLabel="Back"
          onPress={() => router.back()}
        />
        <Text role="body" weight="semibold" color={palette.hanji}>
          Memory gallery
        </Text>
        <IconButton
          icon={Share2}
          tone="inverse"
          accessibilityLabel="Share your byeongpung"
          onPress={handleShare}
          disabled={!canShare || sharing}
          disabledReason={
            sharing
              ? 'Preparing the image.'
              : 'Complete at least one mission or bucket-list item first.'
          }
        />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <View style={{ gap: space[2], paddingHorizontal: space[5] }}>
          <Text role="xs" color={palette.stone} weight="semibold">
            Byeongpung · {theme.era.nameEn}
          </Text>
          <Text role="h2" color={palette.hanji}>
            {displayName}&apos;s journey
          </Text>
          <Text role="sm" color={palette.stone}>
            {completedPanels}/8 panels · {totalCompleted} completions
          </Text>
        </View>

        <ScrollView
          horizontal
          contentContainerStyle={styles.byeongpungScroll}
          showsHorizontalScrollIndicator={false}
        >
          {panels.map((source, i) => {
            const reveal = Math.max(0, Math.min(1, (totalCompleted - i * 6) / 6));
            return (
              <View
                key={i}
                style={[styles.miniPanel, { backgroundColor: theme.era.panelBg }]}
              >
                <Image
                  source={source}
                  style={[styles.miniPanelImage, { opacity: 0.15 + reveal * 0.85 }]}
                  resizeMode="cover"
                />
              </View>
            );
          })}
        </ScrollView>

        {buckets.length > 0 ? (
          <View style={[styles.section, { gap: space[2] }]}>
            <Text role="xs" color={palette.stone} weight="semibold">
              Your buckets
            </Text>
            <View style={{ gap: space[2] }}>
              {buckets.map((b) => {
                const template = BUCKET_TEMPLATES.find((t) => t.key === b.templateKey);
                if (!template) return null;
                const checked = b.items.filter((it) => it.completedAtIso).length;
                return (
                  <View key={b.id} style={styles.bucketRow}>
                    <View
                      style={[
                        styles.bucketArt,
                        { backgroundColor: template.primaryColor + '33' },
                      ]}
                    >
                      <Image
                        source={BUCKET_TEMPLATE_IMAGES[b.templateKey]}
                        style={styles.bucketArtImage}
                        resizeMode="cover"
                      />
                    </View>
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text role="body" weight="semibold" color={palette.hanji}>
                        {b.themeName}
                      </Text>
                      <Text role="xs" color={palette.stone}>
                        {template.nameEn} · {checked}/{b.maxItems}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        ) : null}

        <View style={[styles.section, { gap: space[2] }]}>
          <Text role="xs" color={palette.stone} weight="semibold">
            Timeline
          </Text>
          {sortedCompletions.length === 0 ? (
            <EmptyState
              tone="dark"
              screenName="gallery"
              icon={
                <Image
                  source={chaekgeoriPanel}
                  style={[
                    styles.emptyMotif,
                    { opacity: isPostDeparture ? 0.35 : 0.75 },
                  ]}
                  resizeMode="cover"
                />
              }
              message={
                isPostDeparture
                  ? 'Your journey ended without saved memories.'
                  : 'Your gallery starts when you complete your first mission.'
              }
              accessibilityLabel={
                isPostDeparture
                  ? 'Gallery is empty. The journey ended without saved memories.'
                  : 'Gallery is empty. Complete missions to fill it.'
              }
            />
          ) : (
            <View style={{ gap: space[2] }}>
              {sortedCompletions.map((c) => {
                const m = missionById(c.missionId);
                if (!m) return null;
                const Icon = resolveIcon(m.icon);
                const color = categoryColors[m.category];
                return (
                  <View key={c.missionId} style={styles.timelineRow}>
                    <View style={[styles.timelineIcon, { backgroundColor: color + '33' }]}>
                      <Icon size={18} color={color} strokeWidth={1.6} />
                    </View>
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text role="body" weight="semibold" color={palette.hanji} numberOfLines={1}>
                        {m.titleEn}
                      </Text>
                      <Text role="xs" color={palette.stone}>
                        {c.completedAt ? format(c.completedAt, 'MMM d, yyyy') : '—'}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      <View pointerEvents="none" style={styles.offscreen}>
        <View ref={shareRef} collapsable={false} style={styles.shareCard}>
          <View style={styles.shareHeader}>
            <Text role="badge" color={palette.muted}>
              K&#x2013;JOURNEY · {theme.era.nameEn}
            </Text>
            <Text role="h1" color={palette.meok} style={{ marginTop: space[2] }}>
              {displayName}&apos;s journey
            </Text>
            <Text role="sm" color={palette.ash} style={{ marginTop: space[1] }}>
              {completedPanels}/8 panels · {totalCompleted} completions
            </Text>
          </View>
          <View style={styles.sharePanelsRow}>
            {panels.map((source, i) => {
              const reveal = Math.max(0, Math.min(1, (totalCompleted - i * 6) / 6));
              return (
                <View
                  key={i}
                  style={[styles.sharePanel, { backgroundColor: theme.era.panelBg }]}
                >
                  <Image
                    source={source}
                    style={[styles.sharePanelImage, { opacity: 0.15 + reveal * 0.85 }]}
                    resizeMode="cover"
                  />
                </View>
              );
            })}
          </View>
          <Text role="xs" color={palette.ash} style={{ marginTop: space[3] }}>
            {theme.era.tagline}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const SHARE_CARD_WIDTH = 720;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.meok },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space[5],
    paddingVertical: space[4],
  },
  body: {
    paddingBottom: space[12],
    gap: space[5],
  },
  byeongpungScroll: {
    paddingHorizontal: space[5],
    gap: space[2],
    paddingVertical: space[3],
  },
  miniPanel: {
    width: 56,
    height: 200,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: palette.hwanggeum + '88',
  },
  miniPanelImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  section: {
    paddingHorizontal: space[5],
  },
  bucketRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    backgroundColor: palette.meok,
    padding: space[3],
    borderRadius: radius.card,
  },
  bucketArt: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  bucketArtImage: {
    width: '100%',
    height: '100%',
  },
  emptyMotif: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    backgroundColor: palette.meok,
    padding: space[3],
    borderRadius: radius.md,
  },
  timelineIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // The share card is laid out only so `captureRef` has something to snapshot.
  // At `left: 0` its 720px width extended the document's scroll width, so the
  // whole gallery page scrolled sideways at phone widths. A negative offset
  // keeps it rendered without contributing to the scrollable area.
  offscreen: {
    position: 'absolute',
    top: -10000,
    left: -10000,
  },
  shareCard: {
    width: SHARE_CARD_WIDTH,
    backgroundColor: palette.hanji,
    padding: space[6],
  },
  shareHeader: {
    marginBottom: space[5],
  },
  sharePanelsRow: {
    flexDirection: 'row',
    gap: space[2],
  },
  sharePanel: {
    width: 76,
    height: 260,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: palette.hwanggeum,
  },
  sharePanelImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
});
