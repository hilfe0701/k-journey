import React, { useState, useEffect } from 'react';
import { Linking, View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, ChevronDown, ChevronUp, AlertTriangle, AlertCircle } from 'lucide-react-native';
import { resolveIcon } from '../src/lib/icons';

import { Text, IconButton, MIN_TARGET } from '../src/components/ui';
import { palette, space, radius } from '../design-tokens';
import { EMERGENCY_SECTIONS, type EmergencyItem } from '../src/data/emergency';
import { isEvidenceReviewDue } from '../src/lib/contentEvidence';
import { formatKstDate } from '../src/lib/dates';
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
        {/* A heading, not plain bar text: this screen had no heading at all,
            so a screen reader offered nothing to navigate it by. */}
        <Text role="h4">Emergency guide</Text>
        {/* Matches the back button's 44pt box so the title stays centred. */}
        <View style={{ width: MIN_TARGET }} />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.banner}>
          {/* Reassurance, not a warning — this note tells the reader the page
              still works with no signal. It stays neutral so the error tone is
              left for things that are actually wrong. */}
          <AlertTriangle size={20} color={palette.muted} strokeWidth={1.5} />
          <Text role="bodySm" color={palette.ink}>
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
                  <Icon size={20} color={palette.ink} strokeWidth={1.5} />
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
                    <EmergencyEntry key={idx} item={item} />
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

/**
 * One entry, plus the provenance MUST 12 requires of it: a source that can
 * actually be opened, the date it was last checked, and the authority to ask
 * when this screen is wrong.
 *
 * A claim that is unconfirmed or past its review date says so in words. This
 * screen is read in a hurry, and "we have not verified this number" is not
 * something a reader should have to infer from a colour.
 */
function EmergencyEntry({ item }: { item: EmergencyItem }) {
  const { evidence } = item;
  const isDial = item.href?.startsWith('tel:') ?? false;
  const isStale = isEvidenceReviewDue(evidence);
  const wasNeverConfirmed = evidence.verification === 'needs_review';

  return (
    <View style={styles.item}>
      <Pressable
        disabled={!item.href}
        accessibilityRole={item.href ? 'link' : undefined}
        accessibilityLabel={item.href ? `${isDial ? 'Call' : 'Open'} ${item.label}` : undefined}
        accessibilityHint={
          item.href
            ? isDial
              ? 'Opens your phone dialer.'
              : 'Opens the service in your browser.'
            : undefined
        }
        onPress={() => {
          if (!item.href) return;
          Linking.openURL(item.href).catch(() => surfaceError('unknown'));
        }}
        style={({ pressed }) => [styles.itemBody, item.href && pressed ? styles.itemPressed : null]}
      >
        <Text role="body" weight="semibold" color={item.href ? palette.cheong : undefined}>
          {item.label}
        </Text>
        <Text role="sm" color={palette.ash}>
          {item.detail}
        </Text>
      </Pressable>

      {item.languageSupport ? (
        <View style={styles.languageSupport}>
          <Text role="xs" weight="semibold" color={palette.meok}>
            Language access · {item.languageSupport.verification === 'verified' ? 'Verified' : 'Check before relying'}
          </Text>
          <Text role="xs" color={palette.ash}>
            {item.languageSupport.detail} Ask {item.languageSupport.finalAuthority} if the call flow has changed.
          </Text>
          <Pressable
            accessibilityRole="link"
            accessibilityLabel={`Open language-access source: ${item.languageSupport.evidence.sourceTitle}`}
            accessibilityHint="Opens the official language-access source in your browser."
            onPress={() =>
              Linking.openURL(item.languageSupport!.evidence.sourceUrl).catch(() => surfaceError('unknown'))
            }
            style={({ pressed }) => [styles.evidenceLink, pressed ? styles.itemPressed : null]}
          >
            <Text role="xs" color={palette.cheong}>
              {item.languageSupport.evidence.publisher} · Open language-access source
            </Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.evidence}>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={`Official source: ${evidence.sourceTitle}, ${evidence.publisher}`}
          accessibilityHint="Opens the official source in your browser."
          onPress={() =>
            Linking.openURL(evidence.sourceUrl).catch(() => surfaceError('unknown'))
          }
          style={({ pressed }) => [styles.evidenceLink, pressed ? styles.itemPressed : null]}
        >
          <Text role="xs" color={palette.muted}>
            Source: {evidence.publisher} · checked {formatKstDate(evidence.checkedAt)}
          </Text>
        </Pressable>
        <Text role="xs" color={palette.muted}>
          {wasNeverConfirmed
            ? `Not confirmed at the source. Check with ${evidence.finalAuthority} before relying on it.`
            : isStale
              ? `Past its review date. Check with ${evidence.finalAuthority} before relying on it.`
              : `If this is wrong, ${evidence.finalAuthority} decides.`}
        </Text>
      </View>
    </View>
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
    backgroundColor: palette.surfaceSoft,
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
    backgroundColor: palette.surfaceSoft,
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
    gap: space[2],
    paddingVertical: space[1],
  },
  itemBody: {
    gap: 2,
  },
  itemPressed: {
    opacity: 0.72,
  },
  evidence: {
    gap: 2,
    paddingLeft: space[3],
    borderLeftWidth: 2,
    borderLeftColor: palette.hairline,
  },
  evidenceLink: {
    minHeight: MIN_TARGET,
    justifyContent: 'center',
  },
  languageSupport: {
    gap: 2,
    paddingLeft: space[3],
    borderLeftWidth: 2,
    borderLeftColor: palette.hairline,
  },
});
