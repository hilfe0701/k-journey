// Screen ID: SET-05 (Data export).
// REQ-SFR-012 · POL-010 · DEC-001 · MET-006.
import React, { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AlertTriangle, ChevronLeft, Download, ShieldCheck } from 'lucide-react-native';

import { Button, Card, Text } from '../../src/components/ui';
import { useProfile, useTaskProgress } from '../../src/hooks/useProfile';
import { useCompletedMissions } from '../../src/hooks/useCompletedMissions';
import { useBuckets } from '../../src/hooks/useBuckets';
import {
  buildExportPayload,
  resolveExportResult,
  type ExportResultView,
} from '../../src/lib/dataExport';
import { track } from '../../src/lib/posthog';
import { palette, radius, semantic, space } from '../../design-tokens';

export default function DataExportScreen() {
  const router = useRouter();
  const { profile } = useProfile();
  const { progress } = useTaskProgress();
  const { completed } = useCompletedMissions();
  const { buckets } = useBuckets();
  const [result, setResult] = useState<ExportResultView | null>(null);
  const [busy, setBusy] = useState(false);

  const payload = useMemo(
    () => buildExportPayload(profile, progress, { completedMissions: completed, buckets, era: profile?.era }),
    [profile, progress, completed, buckets],
  );

  async function handleExport() {
    if (busy) return;
    setBusy(true);
    try {
      // AC5 · TC-060: an empty export is never delivered as if it succeeded.
      if (payload.status === 'empty') {
        setResult(resolveExportResult(payload, false));
        return;
      }
      const outcome = await Share.share({ message: payload.text });
      // `dismissedAction` means the user backed out — not a delivery.
      const delivered = outcome.action === Share.sharedAction;
      setResult(resolveExportResult(payload, delivered));
      track(delivered ? 'data_export_delivered' : 'data_export_failed');
    } catch {
      // AC4 · TC-059: a thrown share is a failure, and is reported as one.
      setResult(resolveExportResult(payload, false));
      track('data_export_failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={styles.backButton}
        >
          <ChevronLeft size={24} color={palette.meok} strokeWidth={1.6} />
        </Pressable>
        <Text role="h3">Export your data</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text role="body" color={palette.ash}>
            K-Journey keeps your journey on this device. This readable text includes profile
            conditions, administrative task states, cultural completions, and Want-to lists.
            It is not an importable app backup.
          </Text>
        </View>

        <View style={styles.section}>
          <Text role="h4">{`Conditions (${payload.conditions.length})`}</Text>
          <Card padded bg={palette.cloud} style={styles.listCard}>
            {payload.conditions.map((condition) => (
              <View key={condition.key} style={styles.row}>
                <Text role="xs" color={palette.ash} style={styles.rowLabel}>
                  {condition.label}
                </Text>
                <Text role="sm" weight="semibold" style={styles.rowValue}>
                  {condition.value}
                </Text>
              </View>
            ))}
          </Card>
        </View>

        <View style={styles.section}>
          <Text role="h4">{`Tasks (${payload.tasks.length})`}</Text>
          <Card padded bg={palette.cloud} style={styles.listCard}>
            {payload.tasks.map((task) => (
              <View key={task.taskId} style={styles.row}>
                <Text role="xs" color={palette.ash} style={styles.rowLabel}>
                  {task.title}
                </Text>
                <Text role="sm" weight="semibold" style={styles.rowValue}>
                  {`${task.state} · ${task.completedAt}`}
                </Text>
              </View>
            ))}
          </Card>
        </View>

        <View style={styles.section}>
          <Text role="h4">{`Culture (${payload.missions.length} completed)`}</Text>
          <Card padded bg={palette.cloud} style={styles.listCard}>
            <View style={styles.row}>
              <Text role="xs" color={palette.ash} style={styles.rowLabel}>Era</Text>
              <Text role="sm" weight="semibold" style={styles.rowValue}>{payload.era}</Text>
            </View>
            <View style={styles.row}>
              <Text role="xs" color={palette.ash} style={styles.rowLabel}>Want-to lists</Text>
              <Text role="sm" weight="semibold" style={styles.rowValue}>{payload.buckets.length}</Text>
            </View>
          </Card>
        </View>

        {result ? <ExportOutcome result={result} /> : null}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={payload.status === 'empty' ? 'Nothing to export yet' : 'Export as text'}
          onPress={handleExport}
          loading={busy}
          fullWidth
          leftIcon={<Download size={18} color={palette.hanji} />}
          accessibilityHint="Share the full text of your conditions and task states."
        />
      </View>
    </SafeAreaView>
  );
}

function ExportOutcome({ result }: { result: ExportResultView }) {
  const router = useRouter();
  const failed = result.outcome !== 'delivered';

  return (
    <View style={styles.section}>
      <View
        style={failed ? styles.warningCallout : styles.successCallout}
        accessibilityRole="alert"
      >
        <View style={styles.calloutHeader}>
          {failed ? (
            <AlertTriangle size={19} color={palette.dancheong} strokeWidth={1.5} />
          ) : (
            <ShieldCheck size={19} color={palette.jade} strokeWidth={1.5} />
          )}
          <Text role="h4">
            {result.outcome === 'delivered'
              ? 'Exported — it is yours to keep now'
              : result.outcome === 'nothing_to_export'
                ? 'Nothing to export'
                : 'Not exported'}
          </Text>
        </View>
        <Text role="sm" color={palette.meok}>
          {result.message}
        </Text>
      </View>

      {result.action === 'go_to_onboarding' ? (
        <Button
          label="Go to onboarding"
          variant="secondary"
          onPress={() => router.push('/(onboarding)/university' as never)}
        />
      ) : null}

      {result.copyableText ? (
        <View style={styles.section}>
          <Text role="sm" color={palette.ash}>
            {Platform.OS === 'web'
              ? 'Select the text below and copy it.'
              : 'Press and hold the text below to select and copy it.'}
          </Text>
          <Card padded bg={palette.cloud} style={styles.listCard}>
            <Text role="xs" selectable style={styles.exportText}>
              {result.copyableText}
            </Text>
          </Card>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.hanji },
  header: {
    minHeight: 56,
    paddingHorizontal: space[5],
    paddingVertical: space[2],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerSpacer: { width: 44, height: 44 },
  body: { paddingHorizontal: space[5], paddingBottom: space[8], gap: space[5] },
  section: { gap: space[3] },
  listCard: { gap: 0 },
  row: {
    minHeight: 44,
    paddingVertical: space[2],
    borderBottomWidth: 1,
    borderBottomColor: semantic.border.hairline,
    gap: space[1],
  },
  rowLabel: { textTransform: 'none' },
  rowValue: { flexShrink: 1 },
  calloutHeader: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  warningCallout: {
    gap: space[2],
    padding: space[4],
    backgroundColor: palette.dancheongLight,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: palette.dancheong,
  },
  successCallout: {
    gap: space[2],
    padding: space[4],
    backgroundColor: palette.jadeLight,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: palette.jade,
  },
  exportText: { lineHeight: 18 },
  footer: {
    paddingHorizontal: space[5],
    paddingTop: space[3],
    paddingBottom: space[4],
    borderTopWidth: 1,
    borderTopColor: semantic.border.hairline,
    backgroundColor: palette.hanji,
  },
});
