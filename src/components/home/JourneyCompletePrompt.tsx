import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useMMKVBoolean } from 'react-native-mmkv';
import { Image as ImageIcon } from 'lucide-react-native';

import { Text, Button } from '../ui';
import { palette, space, radius } from '../../../design-tokens';
import { storage, KEYS } from '../../lib/storage';
import { kstDifferenceInDays, kstNow, toKstStartOfDay } from '../../lib/dates';

interface Props {
  departureDate: string | null;
}

/**
 * Per CLAUDE.md NEVER #14: don't auto-switch to the gallery when departure
 * passes. Show this prompt instead. Once dismissed it stays dismissed (a
 * permanent banner would feel nagging once the user has reopened gallery).
 */
export function JourneyCompletePrompt({ departureDate }: Props) {
  const router = useRouter();
  const [dismissed, setDismissed] = useMMKVBoolean(KEYS.galleryDismissed, storage);

  if (!departureDate || dismissed) return null;
  const today = toKstStartOfDay(kstNow());
  const departure = toKstStartOfDay(departureDate);
  if (kstDifferenceInDays(today, departure) < 0) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <View style={styles.iconBox}>
          <ImageIcon size={20} color={palette.hwanggeum} strokeWidth={1.6} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text role="body" weight="semibold">
            Your journey is complete
          </Text>
          <Text role="sm" color={palette.ash}>
            Open your gallery to see your finished byeongpung and timeline.
          </Text>
        </View>
      </View>
      <View style={styles.actions}>
        <Pressable onPress={() => setDismissed(true)} hitSlop={8} style={styles.dismiss}>
          <Text role="sm" color={palette.ash} weight="semibold">
            Stay
          </Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Button
            label="Open gallery"
            onPress={() => router.push('/gallery')}
            fullWidth
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: palette.hwanggeumLight,
    borderRadius: radius.card,
    padding: space[4],
    gap: space[3],
    borderWidth: 1,
    borderColor: palette.hwanggeum + '55',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.hanji,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
  },
  dismiss: {
    paddingHorizontal: space[3],
    paddingVertical: space[3],
  },
});
