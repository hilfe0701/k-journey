import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Plus, Check, Trash2, MoreVertical, ListPlus } from 'lucide-react-native';

import { Text, Input, Button, ProgressBar, Badge, EmptyState } from '../../src/components/ui';
import { palette, space, radius } from '../../design-tokens';
import { BUCKET_TEMPLATES } from '../../src/data/bucketTemplates';
import { BUCKET_TEMPLATE_IMAGES } from '../../src/components/byeongpung/motifs';
import { useBucket } from '../../src/hooks/useBuckets';
import { useTotalCompletions } from '../../src/hooks/useTotalCompletions';
import { useTheme } from '../../src/theme/ThemeProvider';
import {
  addBucketItem,
  toggleBucketItem,
  deleteBucketItem,
  deleteBucket,
} from '../../src/lib/firebase';
import { firePanelUnlock, claimPanelUnlock } from '../../src/lib/notifications';
import { showOperationError } from '../../src/lib/errorAlert';
import { track } from '../../src/lib/posthog';
import { hapticDestructive } from '../../src/lib/haptics';
import { MissionCompleteOverlay } from '../../src/components/mission/MissionCompleteOverlay';

interface OverlayState {
  iconName: string;
  iconColor: string;
  isPanelUnlock: boolean;
  panelNumber?: number;
  panelColor?: string;
}

export default function BucketDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { bucket, loading } = useBucket(id);
  const { total: totalCompletions } = useTotalCompletions();
  const theme = useTheme();

  const inputRef = React.useRef<TextInput>(null);
  const [draft, setDraft] = useState('');
  const [busyItem, setBusyItem] = useState<string | null>(null);
  const [overlay, setOverlay] = useState<OverlayState | null>(null);

  if (loading) {
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
            Loading
          </Text>
          <View style={{ width: 24 }} />
        </View>
      </SafeAreaView>
    );
  }

  if (!bucket) {
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
            Bucket not found
          </Text>
          <View style={{ width: 24 }} />
        </View>
      </SafeAreaView>
    );
  }

  const template = BUCKET_TEMPLATES.find((t) => t.key === bucket.templateKey)!;
  const checked = bucket.items.filter((it) => it.completedAtIso).length;
  const total = bucket.items.length;
  const fullProgress = total > 0 ? checked / total : 0;
  const capacityProgress = checked / bucket.maxItems;
  const canAdd = bucket.items.length < bucket.maxItems;

  async function handleAdd() {
    if (!bucket || !draft.trim() || !canAdd) return;
    const text = draft.trim();
    setDraft('');
    try {
      await addBucketItem(bucket.id, text);
    } catch (err) {
      setDraft(text);
      showOperationError('add this item', err);
    }
  }

  async function handleToggle(itemId: string) {
    if (!bucket) return;
    setBusyItem(itemId);
    try {
      const result = await toggleBucketItem(bucket.id, itemId);
      if (!result) return;
      if (!result.wasCompleted) {
        // Newly checked — fire analytics + maybe panel unlock
        const newTotal = totalCompletions + 1;
        const crossingThreshold = newTotal > 0 && newTotal <= 48 && newTotal % 6 === 0;
        const candidatePanel = crossingThreshold ? newTotal / 6 : undefined;
        const panelClaimed = candidatePanel ? claimPanelUnlock(candidatePanel) : false;
        track('bucket_item_complete', {
          bucketId: bucket.id,
          templateKey: bucket.templateKey,
          itemId,
        });
        if (panelClaimed && candidatePanel) {
          const panelColor = theme.era.panelColors[candidatePanel - 1];
          track('panel_unlock', { panelNumber: candidatePanel, source: 'bucket' });
          firePanelUnlock(candidatePanel, theme.era.nameEn);
          setOverlay({
            iconName: 'Heart',
            iconColor: template.primaryColor,
            isPanelUnlock: true,
            panelNumber: candidatePanel,
            panelColor,
          });
        }
      }
    } catch (err) {
      showOperationError('update this item', err);
    } finally {
      setBusyItem(null);
    }
  }

  async function handleDeleteItem(itemId: string) {
    if (!bucket) return;
    try {
      await deleteBucketItem(bucket.id, itemId);
    } catch (err) {
      showOperationError('delete this item', err);
    }
  }

  function handleDeleteBucket() {
    if (!bucket) return;
    Alert.alert(
      'Delete this bucket?',
      'This removes the bucket and all items. The painting progress is lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            hapticDestructive();
            try {
              await deleteBucket(bucket.id);
              router.back();
            } catch (err) {
              showOperationError('delete this bucket', err);
            }
          },
        },
      ],
    );
  }

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
        <Badge label={template.nameEn} color={template.primaryColor} bg={template.primaryColor + '1F'} />
        <Pressable
          onPress={handleDeleteBucket}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Delete bucket"
        >
          <MoreVertical size={22} color={palette.meok} strokeWidth={1.5} />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <View style={[styles.art, { backgroundColor: template.primaryColor + '14' }]}>
            <Image
              source={BUCKET_TEMPLATE_IMAGES[bucket.templateKey]}
              style={[styles.artImage, { opacity: 0.3 + fullProgress * 0.7 }]}
              resizeMode="cover"
            />
          </View>

          <View style={{ gap: space[2] }}>
            <Text role="h1">{bucket.themeName}</Text>
            <Text role="sm" color={palette.meokMid}>
              {template.symbolism}
            </Text>
            <View style={{ marginTop: space[2], gap: space[2] }}>
              <View style={styles.progressRow}>
                <Text role="xs" color={palette.ash} weight="semibold">
                  {checked} / {bucket.maxItems} completed
                </Text>
                <Text role="xs" color={palette.ash}>
                  {Math.round(capacityProgress * 100)}%
                </Text>
              </View>
              <ProgressBar value={capacityProgress} color={template.primaryColor} />
            </View>
          </View>

          <View style={{ gap: space[2] }}>
            <Text role="sm" color={palette.ash} weight="semibold">
              Items
            </Text>
            {bucket.items.length === 0 ? (
              <EmptyState
                screenName="bucket_detail"
                icon={<ListPlus size={48} color={template.primaryColor} strokeWidth={1.5} />}
                message="Add your first wish to this bucket."
                cta={{
                  label: 'Add a wish',
                  onPress: () => inputRef.current?.focus(),
                }}
                accessibilityLabel="Empty bucket. Tap add a wish to start."
              />
            ) : (
              <View style={{ gap: space[2] }}>
                {bucket.items.map((it) => {
                  const done = !!it.completedAtIso;
                  return (
                    <View key={it.id} style={styles.itemRow}>
                      <Pressable
                        onPress={() => handleToggle(it.id)}
                        disabled={busyItem === it.id}
                        style={[
                          styles.itemCheck,
                          {
                            borderColor: done ? template.primaryColor : palette.hairline,
                            backgroundColor: done ? template.primaryColor : 'transparent',
                          },
                        ]}
                      >
                        {done ? <Check size={16} color={palette.hanji} strokeWidth={2.4} /> : null}
                      </Pressable>
                      <Text
                        role="body"
                        color={done ? palette.ash : palette.meok}
                        style={[
                          { flex: 1 },
                          done && { textDecorationLine: 'line-through' as const },
                        ]}
                      >
                        {it.text}
                      </Text>
                      <Pressable onPress={() => handleDeleteItem(it.id)} hitSlop={8}>
                        <Trash2 size={16} color={palette.ash} strokeWidth={1.6} />
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          {canAdd ? (
            <View style={{ gap: space[2] }}>
              <Input
                ref={inputRef}
                value={draft}
                onChangeText={setDraft}
                placeholder="Add a wish"
                autoCapitalize="sentences"
              />
              <Button
                label="Add wish"
                variant="secondary"
                fullWidth
                onPress={handleAdd}
                disabled={!draft.trim()}
                leftIcon={<Plus size={18} color={palette.meok} />}
              />
            </View>
          ) : (
            <View style={styles.fullNote}>
              <Text role="sm" color={palette.ash} align="center">
                This list is full ({bucket.maxItems} wishes). Remove one to add more.
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <MissionCompleteOverlay
        visible={overlay !== null}
        iconName={overlay?.iconName ?? 'Heart'}
        iconColor={overlay?.iconColor ?? palette.dancheong}
        isPanelUnlock={overlay?.isPanelUnlock ?? false}
        panelNumber={overlay?.panelNumber}
        panelColor={overlay?.panelColor}
        onDismiss={() => setOverlay(null)}
      />
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
    gap: space[5],
  },
  art: {
    height: 200,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  artImage: {
    width: '100%',
    height: '100%',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    paddingVertical: space[2],
    paddingHorizontal: space[3],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.hairline,
    backgroundColor: palette.hanji,
  },
  itemCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullNote: {
    padding: space[3],
    borderRadius: radius.md,
    backgroundColor: palette.cloud,
  },
});
