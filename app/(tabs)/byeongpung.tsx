import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Image,
  ActionSheetIOS,
  Alert,
  Platform,
} from 'react-native';
import type { RefObject } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Share2, Download } from 'lucide-react-native';

import { Text } from '../../src/components/ui';
import { palette, space, radius } from '../../design-tokens';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useTotalCompletions } from '../../src/hooks/useTotalCompletions';
import {
  BYEONGPUNG_PANEL_IMAGES,
  PANEL_MOTIF_NAMES,
} from '../../src/components/byeongpung/motifs';
import { shareByeongpungImage, saveByeongpungImage } from '../../src/lib/share';
import { track } from '../../src/lib/posthog';

export default function ByeongpungTab() {
  const theme = useTheme();
  const { total: totalCompleted } = useTotalCompletions();
  const shareRef = useRef<View>(null);
  const panelRefs = useRef<(View | null)[]>([null, null, null, null, null, null, null, null]);
  const [busy, setBusy] = useState<'share' | 'save' | null>(null);

  const panels = BYEONGPUNG_PANEL_IMAGES[theme.era.key];

  const completedPanels = useMemo(() => {
    return panels.filter((_, i) => (totalCompleted - i * 6) / 6 >= 1).length;
  }, [panels, totalCompleted]);

  const canExport = completedPanels > 0;

  async function handleShare() {
    if (!canExport || busy) return;
    setBusy('share');
    try {
      const ok = await shareByeongpungImage(shareRef, 'Share your byeongpung');
      if (ok) track('byeongpung_share', { source: 'byeongpung_tab', completedPanels });
    } finally {
      setBusy(null);
    }
  }

  async function captureAndSave(ref: RefObject<View>, panelIndex: number | null) {
    setBusy('save');
    try {
      const ok = await saveByeongpungImage(ref);
      if (ok) {
        track('byeongpung_save_image', {
          source: 'byeongpung_tab',
          completedPanels,
          panelIndex,
        });
      }
    } finally {
      setBusy(null);
    }
  }

  function tryPanelSave(panelIdx: number) {
    const reveal = (totalCompleted - panelIdx * 6) / 6;
    if (reveal < 1) {
      const needed = (panelIdx + 1) * 6 - totalCompleted;
      Alert.alert(
        'Panel not yet complete',
        `Panel ${panelIdx + 1} (${PANEL_MOTIF_NAMES[panelIdx]}) must be 100% revealed before it can be saved on its own. ${needed} more completion${needed > 1 ? 's' : ''} needed.`,
      );
      return;
    }
    const node = panelRefs.current[panelIdx];
    if (!node) return;
    const ref = { current: node } as RefObject<View>;
    captureAndSave(ref, panelIdx);
  }

  function handleSave() {
    if (!canExport || busy) return;
    if (Platform.OS === 'ios') {
      const options = [
        'Full byeongpung',
        ...PANEL_MOTIF_NAMES.map((name, i) => `Panel ${i + 1}: ${name}`),
        'Cancel',
      ];
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: 'Save image',
          options,
          cancelButtonIndex: options.length - 1,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) {
            captureAndSave(shareRef, null);
          } else if (buttonIndex >= 1 && buttonIndex <= 8) {
            tryPanelSave(buttonIndex - 1);
          }
        },
      );
    } else {
      // Android fallback: save full byeongpung. Per-panel picker TBD.
      captureAndSave(shareRef, null);
    }
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Text role="h1">Your folding screen</Text>
        <Text role="body" color={palette.ash} style={{ marginTop: 4 }}>
          {theme.era.nameEn} ({theme.era.nameKo}) · {theme.era.tagline}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <View style={styles.shareCanvas}>
          {panels.map((source, i) => {
            const reveal = Math.max(0, Math.min(1, (totalCompleted - i * 6) / 6));
            const motifName = PANEL_MOTIF_NAMES[i];
            return (
              <View key={i} style={[styles.panel, { backgroundColor: theme.era.panelBg }]}>
                <Image
                  source={source}
                  style={[styles.panelImage, { opacity: 0.15 + reveal * 0.85 }]}
                  resizeMode="cover"
                />
                <View style={styles.panelLabel}>
                  <Text role="badge" color={palette.hanji}>
                    Panel {i + 1}
                  </Text>
                  <Text role="xs" color={palette.hanji}>
                    {motifName} · {Math.round(reveal * 100)}%
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View pointerEvents="none" style={styles.offscreen}>
        <View ref={shareRef} collapsable={false} style={styles.shareCanvas}>
          {panels.map((source, i) => {
            const reveal = Math.max(0, Math.min(1, (totalCompleted - i * 6) / 6));
            return (
              <View key={i} style={[styles.panel, { backgroundColor: theme.era.panelBg }]}>
                <Image
                  source={source}
                  style={[styles.panelImage, { opacity: 0.15 + reveal * 0.85 }]}
                  resizeMode="cover"
                />
              </View>
            );
          })}
        </View>

        {panels.map((source, i) => (
          <View
            key={`single-${i}`}
            ref={(el) => {
              panelRefs.current[i] = el;
            }}
            collapsable={false}
            style={[styles.singlePanel, { backgroundColor: theme.era.panelBg }]}
          >
            <Image source={source} style={styles.panelImage} resizeMode="cover" />
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={handleShare}
          disabled={!canExport || busy !== null}
          style={({ pressed }) => [
            styles.actionBtn,
            { opacity: !canExport || busy !== null ? 0.4 : pressed ? 0.7 : 1 },
          ]}
        >
          <Share2 size={18} color={palette.meok} strokeWidth={1.6} />
          <Text role="sm" color={palette.meok} weight="semibold">
            {busy === 'share' ? 'Sharing' : 'Share'}
          </Text>
        </Pressable>
        <Pressable
          onPress={handleSave}
          disabled={!canExport || busy !== null}
          style={({ pressed }) => [
            styles.actionBtn,
            { opacity: !canExport || busy !== null ? 0.4 : pressed ? 0.7 : 1 },
          ]}
        >
          <Download size={18} color={palette.meok} strokeWidth={1.6} />
          <Text role="sm" color={palette.meok} weight="semibold">
            {busy === 'save' ? 'Saving' : 'Save image'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.legend}>
        <Text role="body" color={palette.ash}>
          {completedPanels === 8
            ? 'Your byeongpung is complete.'
            : `${completedPanels}/8 panels unlocked. ${6 - (totalCompleted % 6)} more to reveal panel ${completedPanels + 1}.`}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.hanji },
  header: {
    paddingHorizontal: space[5],
    paddingTop: space[3],
    paddingBottom: space[5],
  },
  scrollContainer: {
    paddingVertical: space[4],
  },
  shareCanvas: {
    flexDirection: 'row',
    gap: space[2],
    paddingHorizontal: space[5],
    backgroundColor: palette.hanji,
  },
  panel: {
    width: 110,
    height: 380,
    borderRadius: radius.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: palette.hwanggeum,
    justifyContent: 'flex-end',
  },
  panelImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  panelLabel: {
    padding: space[2],
    gap: 2,
    backgroundColor: palette.meok + 'B3',
  },
  actions: {
    flexDirection: 'row',
    gap: space[3],
    paddingHorizontal: space[5],
    paddingTop: space[3],
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    paddingVertical: space[3],
    paddingHorizontal: space[4],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.hairline,
  },
  legend: {
    paddingHorizontal: space[5],
    paddingVertical: space[4],
  },
  offscreen: {
    position: 'absolute',
    top: -10000,
    left: 0,
  },
  singlePanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 600,
    height: 2040,
    overflow: 'hidden',
  },
});
