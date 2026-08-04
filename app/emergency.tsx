import React, { useState, useEffect } from 'react';
import { Linking, View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, ChevronDown, ChevronUp, AlertTriangle, AlertCircle } from 'lucide-react-native';
import { resolveIcon } from '../src/lib/icons';

import { Text, IconButton } from '../src/components/ui';
import { palette, space, radius } from '../design-tokens';
import { EMERGENCY_SECTIONS } from '../src/data/emergency';
import { setJson, getJson, KEYS } from '../src/lib/storage';
import { track } from '../src/lib/posthog';
import { surfaceError } from '../src/lib/errorAlert';
import { a11yState } from '../src/lib/a11y';

// Cache emergency data on first render so it's available offline.
setJson(KEYS.emergencyCache, EMERGENCY_SECTIONS);

export default function Emergency() {
  const router = useRouter();
  const [expanded, setExpanded] = useState<string | null>(EMERGENCY_SECTIONS[0]?.id ?? null);
  const sections = getJson(KEYS.emergencyCache) ?? EMERGENCY_SECTIONS;

  useEffect(() => {
    track('emergency_open');
  }, []);

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
          Emergency guide
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.banner}>
          <AlertTriangle size={20} color={palette.dancheong} strokeWidth={1.5} />
          <Text role="sm" color={palette.dancheongDeep}>
            Saved for offline access. Works without signal or data.
          </Text>
        </View>

        {(sections as typeof EMERGENCY_SECTIONS).map((section) => {
          const Icon = resolveIcon(section.icon, AlertCircle);
          const isOpen = expanded === section.id;
          return (
            <View key={section.id} style={styles.section}>
              <Pressable
                onPress={() => setExpanded(isOpen ? null : section.id)}
                accessibilityRole="button"
                accessibilityLabel={section.titleEn}
                {...a11yState({ expanded: isOpen })}
                style={({ pressed }) => [
                  styles.sectionHead,
                  { backgroundColor: pressed ? palette.cloud : palette.hanji },
                ]}
              >
                <View style={styles.sectionHeadIcon}>
                  <Icon size={20} color={palette.dancheong} strokeWidth={1.5} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text role="body" weight="semibold">
                    {section.titleEn}
                  </Text>
                  <Text role="xs" color={palette.ash}>
                    {section.titleKo}
                  </Text>
                </View>
                {isOpen ? (
                  <ChevronUp size={18} color={palette.ash} />
                ) : (
                  <ChevronDown size={18} color={palette.ash} />
                )}
              </Pressable>
              {isOpen ? (
                <View style={styles.sectionItems}>
                  {section.items.map((item, idx) => (
                    <Pressable
                      key={idx}
                      disabled={!item.href}
                      accessibilityRole={item.href ? 'link' : undefined}
                      accessibilityLabel={item.href ? `Call ${item.label}` : undefined}
                      accessibilityHint={item.href ? 'Opens your phone dialer.' : undefined}
                      onPress={() => {
                        if (!item.href) return;
                        Linking.openURL(item.href).catch(() => surfaceError('unknown'));
                      }}
                      style={({ pressed }) => [styles.item, item.href && pressed ? styles.itemPressed : null]}
                    >
                      <Text role="body" weight="semibold" color={item.href ? palette.cheong : undefined}>
                        {item.label}
                      </Text>
                      <Text role="sm" color={palette.ash}>
                        {item.detail}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}
            </View>
          );
        })}
      </ScrollView>
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
    gap: space[3],
  },
  banner: {
    backgroundColor: palette.dancheongLight,
    padding: space[3],
    borderRadius: radius.card,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
  },
  section: {
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: palette.hairline,
    overflow: 'hidden',
    backgroundColor: palette.hanji,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    padding: space[3],
  },
  sectionHeadIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: palette.dancheongLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionItems: {
    paddingHorizontal: space[4],
    paddingTop: space[2],
    paddingBottom: space[3],
    gap: space[3],
    borderTopWidth: 1,
    borderTopColor: palette.hairline,
    backgroundColor: palette.cloud,
  },
  item: {
    gap: 2,
  },
  itemPressed: {
    opacity: 0.72,
  },
});
