import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Plus, Minus } from 'lucide-react-native';

import { Text, Button, Input, IconButton, MIN_TARGET } from '../../src/components/ui';
import { palette, space, radius } from '../../design-tokens';
import { BUCKET_TEMPLATES, BucketTemplateKey } from '../../src/data/bucketTemplates';
import { BUCKET_TEMPLATE_IMAGES } from '../../src/components/byeongpung/motifs';
import { createBucket } from '../../src/lib/firebase';
import { showOperationError } from '../../src/lib/errorAlert';
import { track } from '../../src/lib/posthog';
import { a11yState } from '../../src/lib/a11y';

const MAX_OPTIONS = [5, 8, 10, 12, 15, 20];

export default function NewBucket() {
  const router = useRouter();
  const { template: templateParam } = useLocalSearchParams<{ template?: string }>();
  const initialTemplate = BUCKET_TEMPLATES.some((tpl) => tpl.key === templateParam)
    ? (templateParam as BucketTemplateKey)
    : 'peony';
  const [themeName, setThemeName] = useState('');
  const [maxItems, setMaxItems] = useState(10);
  const [templateKey, setTemplateKey] = useState<BucketTemplateKey>(initialTemplate);
  const [items, setItems] = useState<string[]>(['']);
  const [busy, setBusy] = useState(false);

  const template = BUCKET_TEMPLATES.find((t) => t.key === templateKey)!;

  function updateItem(idx: number, text: string) {
    setItems((prev) => prev.map((it, i) => (i === idx ? text : it)));
  }
  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }
  function addItemRow() {
    if (items.length >= maxItems) return;
    setItems((prev) => [...prev, '']);
  }
  function addSuggestedItem(suggestion: string) {
    setItems((prev) => {
      if (prev.some((item) => item.trim() === suggestion)) return prev;
      const firstEmpty = prev.findIndex((item) => item.trim().length === 0);
      if (firstEmpty >= 0) {
        return prev.map((item, index) => (index === firstEmpty ? suggestion : item));
      }
      return prev.length < maxItems ? [...prev, suggestion] : prev;
    });
  }

  const filledItems = items.filter((t) => t.trim().length > 0);
  const canSave = themeName.trim().length > 0 && !busy;

  async function handleSave() {
    if (!canSave) return;
    setBusy(true);
    try {
      const bucket = await createBucket({
        themeName,
        templateKey,
        maxItems,
        initialItems: items,
      });
      track('bucket_create', {
        bucketId: bucket.id,
        templateKey,
        maxItems,
        initialItemCount: filledItems.length,
      });
      router.replace(`/bucket/${bucket.id}`);
    } catch (err) {
      showOperationError('create this bucket', err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <IconButton
          icon={ChevronLeft}
          size={24}
          accessibilityLabel="Back"
          onPress={() => router.back()}
        />
        <Text role="body" weight="semibold">
          New bucket
        </Text>
        <View style={{ width: MIN_TARGET }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.preview}>
            <View style={[styles.previewArt, { backgroundColor: template.primaryColor + '14' }]}>
              <Image
                source={BUCKET_TEMPLATE_IMAGES[templateKey]}
                style={styles.previewArtImage}
                resizeMode="cover"
              />
            </View>
            <View style={{ gap: 4 }}>
              <Text role="xs" color={palette.ash} weight="semibold">
                Template
              </Text>
              <Text role="h3">{template.nameEn}</Text>
              <Text role="sm" color={palette.meokMid}>
                {template.symbolism}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Input
              label="Theme name"
              value={themeName}
              onChangeText={setThemeName}
              placeholder="e.g. Cafés to try"
              autoCapitalize="sentences"
              autoFocus
            />
          </View>

          <View style={styles.section}>
            <Text role="sm" color={palette.ash}>
              Max wishes per bucket
            </Text>
            <View style={styles.maxRow} accessibilityRole="radiogroup">
              {MAX_OPTIONS.map((n) => {
                const active = n === maxItems;
                return (
                  <Pressable
                    key={n}
                    onPress={() => {
                      setMaxItems(n);
                      if (items.length > n) setItems(items.slice(0, n));
                    }}
                    accessibilityRole="radio"
                    accessibilityLabel={`${n} wishes`}
                    {...a11yState({ selected: active })}
                    style={[
                      styles.maxChip,
                      active && { backgroundColor: palette.meok, borderColor: palette.meok },
                    ]}
                  >
                    <Text role="sm" color={active ? palette.hanji : palette.meok} weight="semibold">
                      {n}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text role="sm" color={palette.ash}>
              Painting template
            </Text>
            <View style={styles.templateGrid} accessibilityRole="radiogroup">
              {BUCKET_TEMPLATES.map((tpl) => {
                const active = tpl.key === templateKey;
                return (
                  <Pressable
                    key={tpl.key}
                    onPress={() => setTemplateKey(tpl.key)}
                    accessibilityRole="radio"
                    accessibilityLabel={`${tpl.nameEn} template — ${tpl.hintFor}`}
                    {...a11yState({ selected: active })}
                    style={[
                      styles.templateCard,
                      {
                        borderColor: active ? tpl.primaryColor : palette.hairline,
                        borderWidth: active ? 2 : 1,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.templateSwatch,
                        { backgroundColor: tpl.primaryColor + '14' },
                      ]}
                    >
                      <Image
                        source={BUCKET_TEMPLATE_IMAGES[tpl.key]}
                        style={styles.templateSwatchImage}
                        resizeMode="cover"
                      />
                    </View>
                    <Text role="sm" weight="semibold">
                      {tpl.nameEn}
                    </Text>
                    <Text role="xs" color={palette.ash}>
                      {tpl.hintFor}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.itemsHead}>
              <Text role="sm" color={palette.ash}>
                Wishes ({filledItems.length}/{maxItems})
              </Text>
            </View>
            <View style={styles.suggestions}>
              <Text role="xs" color={palette.ash}>
                Optional ideas — tap to add
              </Text>
              <View style={styles.suggestionList}>
                {template.suggestedItems.map((suggestion) => {
                  const added = items.some((item) => item.trim() === suggestion);
                  const disabled = added || filledItems.length >= maxItems;
                  return (
                    <Pressable
                      key={suggestion}
                      onPress={() => addSuggestedItem(suggestion)}
                      disabled={disabled}
                      accessibilityRole="button"
                      accessibilityLabel={`${added ? 'Added' : 'Add'} suggestion: ${suggestion}`}
                      {...a11yState({ disabled })}
                      style={[styles.suggestionChip, disabled && styles.suggestionChipDisabled]}
                    >
                      <Plus size={16} color={disabled ? palette.muted : palette.meok} strokeWidth={1.6} />
                      <Text role="xs" color={disabled ? palette.muted : palette.meok}>
                        {suggestion}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
            <View style={{ gap: space[2] }}>
              {items.map((it, idx) => (
                <View key={idx} style={styles.itemRow}>
                  <View style={{ flex: 1 }}>
                    <Input
                      value={it}
                      onChangeText={(t) => updateItem(idx, t)}
                      placeholder={`Wish ${idx + 1}`}
                      autoCapitalize="sentences"
                    />
                  </View>
                  {items.length > 1 ? (
                    <IconButton
                      icon={Minus}
                      size={18}
                      color={palette.ash}
                      accessibilityLabel={`Remove wish ${idx + 1}`}
                      onPress={() => removeItem(idx)}
                      style={styles.itemRemove}
                    />
                  ) : null}
                </View>
              ))}
              {items.length < maxItems ? (
                <Pressable
                  onPress={addItemRow}
                  accessibilityRole="button"
                  accessibilityLabel="Add another wish"
                  style={styles.addRow}
                >
                  <Plus size={18} color={palette.meok} strokeWidth={1.6} />
                  <Text role="sm" color={palette.meok} weight="semibold">
                    Add another
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <Button
          label="Create bucket"
          onPress={handleSave}
          loading={busy}
          disabled={!canSave}
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
    gap: space[5],
  },
  preview: {
    backgroundColor: palette.cloud,
    padding: space[4],
    borderRadius: radius.card,
    gap: space[3],
    alignItems: 'center',
  },
  previewArt: {
    width: 160,
    height: 160,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  previewArtImage: {
    width: '100%',
    height: '100%',
  },
  section: { gap: space[2] },
  maxRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
  maxChip: {
    minWidth: MIN_TARGET,
    minHeight: MIN_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space[3],
    paddingVertical: space[2],
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: palette.hairline,
    backgroundColor: palette.hanji,
  },
  templateGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
  templateCard: {
    width: '48%',
    padding: space[3],
    borderRadius: radius.card,
    backgroundColor: palette.hanji,
    gap: 4,
  },
  templateSwatch: {
    height: 72,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space[2],
    overflow: 'hidden',
  },
  templateSwatchImage: {
    width: '100%',
    height: '100%',
  },
  itemsHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  suggestions: {
    gap: space[2],
  },
  suggestionList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space[2],
  },
  suggestionChip: {
    minHeight: MIN_TARGET,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    paddingHorizontal: space[3],
    paddingVertical: space[2],
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: palette.hairline,
    backgroundColor: palette.cloud,
  },
  suggestionChipDisabled: {
    opacity: 0.55,
  },
  itemRow: { flexDirection: 'row', gap: space[2], alignItems: 'flex-start' },
  itemRemove: { height: 52 },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: space[3],
    gap: space[2],
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: palette.hairline,
  },
  footer: {
    paddingHorizontal: space[5],
    paddingVertical: space[3],
    borderTopWidth: 1,
    borderTopColor: palette.hairline,
  },
});
