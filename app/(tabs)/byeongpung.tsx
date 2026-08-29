import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Image,
  ActionSheetIOS,
  Modal,
  Platform,
  useWindowDimensions,
} from 'react-native';
import type { RefObject } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Share2, Download, Sparkles } from 'lucide-react-native';
import { useIsFocused } from 'expo-router';

import { ProgressBar, Text } from '../../src/components/ui';
import { palette, space, radius, SCRIM } from '../../design-tokens';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useTotalCompletions } from '../../src/hooks/useTotalCompletions';
import {
  BYEONGPUNG_PANEL_IMAGES,
  PANEL_MOTIF_NAMES,
} from '../../src/components/byeongpung/motifs';
import { shareByeongpungImage, saveByeongpungImage } from '../../src/lib/share';
import { track } from '../../src/lib/posthog';
import { a11yState } from '../../src/lib/a11y';
import { showAlert } from '../../src/lib/alert';
import { useInactiveScreen } from '../../src/lib/inactiveScreen';

export default function ByeongpungTab() {
  const isFocused = useIsFocused();
  const inactiveProps = useInactiveScreen(isFocused);
  const { width: windowWidth } = useWindowDimensions();
  const visiblePanelWidth = Platform.OS === 'web' && windowWidth >= 760 ? 88 : 104;
  const theme = useTheme();
  const { total: totalCompleted } = useTotalCompletions();
  const shareRef = useRef<View>(null);
  const panelRefs = useRef<(View | null)[]>([null, null, null, null, null, null, null, null]);
  const [busy, setBusy] = useState<'share' | 'save' | null>(null);
  const [savePickerVisible, setSavePickerVisible] = useState(false);

  const panels = BYEONGPUNG_PANEL_IMAGES[theme.era.key];

  const completedPanels = useMemo(() => {
    return panels.filter((_, i) => (totalCompleted - i * 6) / 6 >= 1).length;
  }, [panels, totalCompleted]);

  const canExport = totalCompleted > 0;
  const totalProgress = Math.min(1, totalCompleted / 48);
  const nextPanelNumber = Math.min(8, completedPanels + 1);
  const remainingForNext = totalCompleted >= 48 ? 0 : 6 - (totalCompleted % 6);

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

  async function captureAndSave(ref: RefObject<View | null>, panelIndex: number | null) {
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
      showAlert(
        'Panel not yet complete',
        `Panel ${panelIdx + 1} (${PANEL_MOTIF_NAMES[panelIdx]}) must be 100% revealed before it can be saved on its own. ${needed} more completion${needed > 1 ? 's' : ''} needed.`,
      );
      return;
    }
    const node = panelRefs.current[panelIdx];
    if (!node) return;
    const ref = { current: node } as RefObject<View | null>;
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
    } else if (Platform.OS === 'android') {
      setSavePickerVisible(true);
    } else {
      captureAndSave(shareRef, null);
    }
  }

  function chooseAndroidSave(panelIndex: number | null) {
    setSavePickerVisible(false);
    if (panelIndex === null) {
      captureAndSave(shareRef, null);
    } else {
      tryPanelSave(panelIndex);
    }
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']} {...inactiveProps}>
      <View style={styles.header}>
        <Text role="h1">Your folding screen</Text>
        <Text role="body" color={palette.ash} style={{ marginTop: 4 }}>
          {theme.era.nameEn} ({theme.era.nameKo}) · {theme.era.tagline}
        </Text>
      </View>

      <View style={styles.progressWrap}>
        <View style={styles.progressCard}>
          <View style={styles.progressTitleRow}>
            <View style={styles.progressIcon}>
              <Sparkles size={18} color={theme.era.primary} strokeWidth={1.6} />
            </View>
            <View style={styles.progressCopy}>
              <Text role="h4">
                {completedPanels === 8
                  ? 'Your eight-panel story is complete'
                  : `Panel ${nextPanelNumber} is taking shape`}
              </Text>
              <Text role="sm" color={palette.ash}>
                {completedPanels === 8
                  ? 'Every cultural mission and wish remains in your local journey.'
                  : `${remainingForNext} more moment${remainingForNext === 1 ? '' : 's'} to reveal the next panel.`}
              </Text>
            </View>
            <Text role="badge" color={theme.era.primary}>
              {Math.min(totalCompleted, 48)}/48
            </Text>
          </View>
          <ProgressBar value={totalProgress} color={theme.era.primary} />
        </View>
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
              <View
                key={i}
                style={[
                  styles.panel,
                  { width: visiblePanelWidth, backgroundColor: theme.era.panelBg },
                ]}
              >
                <Image
                  source={source}
                  style={[styles.panelImage, { opacity: 0.32 + reveal * 0.68 }]}
                  resizeMode="cover"
                />
                <View
                  pointerEvents="none"
                  style={[
                    styles.lockedWash,
                    { backgroundColor: theme.era.panelBg, opacity: (1 - reveal) * 0.34 },
                  ]}
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
          accessibilityRole="button"
          accessibilityLabel="Share current folding screen"
          {...a11yState({ disabled: !canExport || busy !== null })}
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
          accessibilityRole="button"
          accessibilityLabel="Save current folding screen image"
          {...a11yState({ disabled: !canExport || busy !== null })}
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

      <Modal
        visible={savePickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSavePickerVisible(false)}
      >
        <View style={styles.saveSheetBackdrop}>
          <SafeAreaView
            edges={['bottom']}
            style={styles.saveSheet}
            accessibilityViewIsModal
          >
            <View style={styles.saveSheetHeader}>
              <View style={{ flex: 1 }}>
                <Text role="h4">Save image</Text>
                <Text role="sm" color={palette.ash}>
                  Choose the full screen or an unlocked panel.
                </Text>
              </View>
              <Pressable
                onPress={() => setSavePickerVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="Cancel saving image"
                style={styles.cancelButton}
              >
                <Text role="sm" weight="semibold">
                  Cancel
                </Text>
              </Pressable>
            </View>
            <ScrollView style={styles.saveOptions}>
              <Pressable
                onPress={() => chooseAndroidSave(null)}
                accessibilityRole="button"
                accessibilityLabel="Save full folding screen"
                style={({ pressed }) => [styles.saveOption, pressed && styles.saveOptionPressed]}
              >
                <Text role="body" weight="semibold">
                  Full byeongpung
                </Text>
                <Text role="sm" color={palette.ash}>
                  All eight panels in one image
                </Text>
              </Pressable>
              {PANEL_MOTIF_NAMES.slice(0, completedPanels).map((name, index) => (
                <Pressable
                  key={name}
                  onPress={() => chooseAndroidSave(index)}
                  accessibilityRole="button"
                  accessibilityLabel={`Save panel ${index + 1}, ${name}`}
                  style={({ pressed }) => [styles.saveOption, pressed && styles.saveOptionPressed]}
                >
                  <Text role="body" weight="semibold">
                    Panel {index + 1}: {name}
                  </Text>
                  <Text role="sm" color={palette.ash}>
                    Save this unlocked panel
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.hanji },
  header: {
    paddingHorizontal: space[5],
    paddingTop: space[3],
    paddingBottom: space[3],
  },
  progressWrap: {
    paddingHorizontal: space[5],
    paddingVertical: space[2],
  },
  progressCard: {
    gap: space[3],
    padding: space[4],
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: palette.hairline,
    backgroundColor: palette.cloud,
  },
  progressTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
  },
  progressIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.hanji,
  },
  progressCopy: {
    flex: 1,
    gap: space[1],
  },
  scrollContainer: {
    paddingHorizontal: space[5],
    paddingVertical: space[4],
  },
  shareCanvas: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    height: 364,
    overflow: 'hidden',
    borderRadius: radius.sm,
    borderWidth: 5,
    borderColor: palette.meok,
    backgroundColor: palette.hanji,
  },
  panel: {
    width: 104,
    height: 354,
    overflow: 'hidden',
    borderRightWidth: 3,
    borderRightColor: palette.hwanggeumDeep,
    justifyContent: 'flex-end',
  },
  panelImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
    transform: [{ scale: 1.035 }],
  },
  lockedWash: {
    ...StyleSheet.absoluteFill,
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
    minHeight: 44,
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
    paddingVertical: space[3],
  },
  // Off to the left as well as above: at `left: 0` the wide capture canvas
  // widens the document's scroll area in a browser and the page starts
  // scrolling sideways. See the same note in `app/gallery.tsx`.
  offscreen: {
    position: 'absolute',
    top: -10000,
    left: -10000,
  },
  singlePanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 600,
    height: 2040,
    overflow: 'hidden',
  },
  saveSheetBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: SCRIM,
  },
  saveSheet: {
    maxHeight: '78%',
    paddingTop: space[4],
    paddingHorizontal: space[5],
    backgroundColor: palette.hanji,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
  },
  saveSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    paddingBottom: space[4],
  },
  cancelButton: {
    minWidth: 64,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveOptions: {
    marginBottom: space[3],
  },
  saveOption: {
    minHeight: 64,
    justifyContent: 'center',
    gap: space[1],
    paddingHorizontal: space[4],
    paddingVertical: space[3],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.hairline,
  },
  saveOptionPressed: {
    backgroundColor: palette.cloud,
  },
});
