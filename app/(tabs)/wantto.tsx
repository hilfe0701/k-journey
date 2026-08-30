import React from 'react';
import { View, ScrollView, StyleSheet, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused, useRouter } from 'expo-router';
import { Plus, BookmarkPlus } from 'lucide-react-native';

import { Text, ProgressBar, EmptyState, IconButton } from '../../src/components/ui';
import { palette, space, radius } from '../../design-tokens';
import { BUCKET_TEMPLATES } from '../../src/data/bucketTemplates';
import { BUCKET_TEMPLATE_IMAGES } from '../../src/components/byeongpung/motifs';
import { useBuckets } from '../../src/hooks/useBuckets';
import { useInactiveScreen } from '../../src/lib/inactiveScreen';

export default function WantToTab() {
  const isFocused = useIsFocused();
  const inactiveProps = useInactiveScreen(isFocused);
  const router = useRouter();
  const { buckets } = useBuckets();
  const hasBuckets = buckets.length > 0;

  return (
    <SafeAreaView style={styles.root} edges={['top']} {...inactiveProps}>
      <ScrollView contentContainerStyle={{ paddingBottom: space[16] }}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text role="h1">Your bucket lists</Text>
            </View>
            {hasBuckets ? (
              <IconButton
                icon={Plus}
                size={20}
                tone="inverse"
                accessibilityLabel="Add bucket"
                onPress={() => router.push('/bucket/new')}
                style={styles.headerAdd}
              />
            ) : null}
          </View>
          <Text role="body" color={palette.ash} style={{ marginTop: 4 }}>
            Create your own theme. Pick a minhwa style. Watch it bloom as you check things off.
          </Text>
        </View>

        {!hasBuckets ? (
          <EmptyState
            screenName="bucket_list"
            icon={<BookmarkPlus size={48} color={palette.hwanggeum} strokeWidth={1.5} />}
            message="Make a bucket of things you want to remember."
            cta={{ label: 'Browse templates', onPress: () => router.push('/bucket/new') }}
            accessibilityLabel="No buckets yet. Tap browse templates to start."
          />
        ) : (
          <View style={[styles.section, { gap: space[3] }]}>
            {buckets.map((b) => {
              const template = BUCKET_TEMPLATES.find((t) => t.key === b.templateKey);
              if (!template) return null;
              const checked = b.items.filter((it) => it.completedAtIso).length;
              const total = b.items.length || b.maxItems;
              const progress = total === 0 ? 0 : checked / total;
              return (
                <Pressable
                  key={b.id}
                  onPress={() => router.push(`/bucket/${b.id}`)}
                  accessibilityRole="link"
                  accessibilityLabel={`${b.themeName}, ${checked} of ${b.maxItems} done`}
                  style={({ pressed }) => [
                    styles.bucketCard,
                    { borderColor: template.primaryColor + '55', opacity: pressed ? 0.85 : 1 },
                  ]}
                >
                  <View
                    style={[
                      styles.bucketArt,
                      { backgroundColor: template.primaryColor + '14' },
                    ]}
                  >
                    <Image
                      source={BUCKET_TEMPLATE_IMAGES[b.templateKey]}
                      style={[styles.bucketArtImage, { opacity: 0.4 + progress * 0.6 }]}
                      resizeMode="cover"
                    />
                  </View>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text role="body" weight="semibold" numberOfLines={1}>
                      {b.themeName}
                    </Text>
                    <Text role="xs" color={palette.ash}>
                      {template.nameEn} · {checked}/{b.maxItems}
                    </Text>
                    <View style={{ marginTop: 4 }}>
                      <ProgressBar value={progress} color={template.primaryColor} />
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}

        <View style={styles.section}>
          <Text role="h4">Available painting templates</Text>
          <Text role="sm" color={palette.ash}>
            Each bucket pairs with one minhwa style. The painting fills in as you complete items.
          </Text>
          <View style={styles.templateGrid}>
            {BUCKET_TEMPLATES.map((tpl) => (
              <Pressable
                key={tpl.key}
                onPress={() =>
                  router.push({ pathname: '/bucket/new', params: { template: tpl.key } } as never)
                }
                accessibilityRole="button"
                accessibilityLabel={`Create a bucket with the ${tpl.nameEn} painting`}
                style={({ pressed }) => [
                  styles.templateCard,
                  { borderColor: tpl.primaryColor, opacity: pressed ? 0.82 : 1 },
                ]}
              >
                <View style={[styles.templateSwatch, { backgroundColor: tpl.primaryColor + '14' }]}>
                  <Image
                    source={BUCKET_TEMPLATE_IMAGES[tpl.key]}
                    style={styles.templateSwatchImage}
                    resizeMode="cover"
                  />
                </View>
                <Text role="body" weight="semibold">
                  {tpl.nameEn}
                </Text>
                <Text role="xs" color={palette.ash}>
                  {tpl.symbolism}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
  },
  headerAdd: {
    borderRadius: radius.full,
    backgroundColor: palette.meok,
  },
  section: {
    paddingHorizontal: space[5],
    paddingVertical: space[3],
    gap: space[3],
  },
  bucketCard: {
    flexDirection: 'row',
    gap: space[3],
    padding: space[3],
    borderRadius: radius.card,
    borderWidth: 1,
    backgroundColor: palette.hanji,
    alignItems: 'center',
  },
  bucketArt: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  bucketArtImage: {
    width: '100%',
    height: '100%',
  },
  templateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space[2],
  },
  templateCard: {
    width: '48%',
    padding: space[3],
    borderRadius: radius.card,
    borderWidth: 1,
    backgroundColor: palette.hanji,
    gap: 4,
  },
  templateSwatch: {
    height: 92,
    borderRadius: radius.sm,
    marginBottom: space[2],
    overflow: 'hidden',
  },
  templateSwatchImage: {
    width: '100%',
    height: '100%',
  },
});
