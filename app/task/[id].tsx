// Screen IDs: TASK-00 (Task Detail); regions TASK-01 through TASK-04.
import React, { useMemo, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatInTimeZone } from 'date-fns-tz';
import {
  AlertTriangle,
  ArrowDownUp,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronLeft,
  CircleHelp,
  CircleOff,
  ExternalLink,
  FileCheck2,
  FileText,
  LockKeyhole,
  UserRound,
} from 'lucide-react-native';

import { Badge, Button, Card, Text } from '../../src/components/ui';
import { useProfile, useTaskProgress } from '../../src/hooks/useProfile';
import { calcDatePhase, type Phase } from '../../src/hooks/usePhase';
import {
  getHousingProofDocuments,
  isUnknownConditionValue,
  type HousingDocumentSpec,
} from '../../src/lib/conditionRules';
import {
  saveTaskProgress,
  UNKNOWN,
  type DepartureOrderChoice,
  type LocalTaskProgress,
  type UserProfile,
} from '../../src/lib/firebase';
import {
  DEPARTURE_TASK_IDS,
  DEPOSIT_ACCOUNT_OUTCOMES,
  departureTaskSpec,
  evaluateResidenceCardReturn,
  telecomOverseasGuidance,
  type DepartureType,
  type ReentryException,
} from '../../src/lib/departureTasks';
import {
  DORMITORY_APPLICATION_TASK_ID,
  evaluateDormitoryApplication,
} from '../../src/lib/dormitoryApplication';
import {
  evaluateImmigrationAppointment,
  IMMIGRATION_APPOINTMENT_TASK_ID,
} from '../../src/lib/immigrationAppointment';
import { showOperationError } from '../../src/lib/errorAlert';
import { kstNow } from '../../src/lib/dates';
import { track } from '../../src/lib/posthog';
import {
  isSourceReviewDue,
  taskMetadata,
  taskStateLabel,
  type TaskMetadata,
  type TaskSourceMetadata,
  type TaskSourceValue,
} from '../../src/lib/taskState';
import { buildHomeTasks, type HomeTask } from '../(tabs)/checklist';
import { palette, radius, semantic, space } from '../../design-tokens';
import { KST, toKstStartOfDay } from '../../src/lib/dates';

const DOCUMENT_SPECIFICATIONS: Record<string, string> = {
  'dormitory-confirmation': 'Full confirmation with the residence address and official stamp.',
  'lease-agreement': 'Full copy with the address, both parties, signatures, and stay period.',
  'accommodation-confirmation': 'Full confirmation with the accommodation address and residence start date.',
  'contract-holder-id': 'Both sides of the contract holder identification document.',
  'contract-holder-lease': 'Full copy of the provider lease agreement.',
  'business-accommodation-proof': 'Full proof with the address and residence start date.',
  'business-registration': 'Full certificate showing the registered accommodation address.',
  'current-rent-receipt': 'Current-month receipt or an accepted payment record.',
};

const PHOTO_SPECIFICATION = '3.5 × 4.5 cm, white background, taken within 6 months, front-facing.';

const ORDER_OPTIONS: readonly {
  value: DepartureOrderChoice;
  title: string;
  description: string;
}[] = [
  {
    value: 'deposit-first',
    title: 'Handle the deposit first',
    description: 'Keep the account available until the deposit route is confirmed.',
  },
  {
    value: 'account-first',
    title: 'Handle the account first',
    description: 'Close or change the account after confirming how the deposit will arrive.',
  },
];

type BusyAction = 'status' | 'address' | 'order' | 'departure' | null;

const DEPARTURE_TYPE_OPTIONS: readonly { value: DepartureType; title: string; description: string }[] = [
  {
    value: 'permanent',
    title: 'Leaving Korea for good',
    description: 'You do not plan to return under this residence status.',
  },
  {
    value: 'temporary',
    title: 'Leaving temporarily',
    description: 'You intend to come back while this residence status is still valid.',
  },
];

const REENTRY_EXCEPTION_OPTIONS: readonly { value: ReentryException; title: string; description: string }[] = [
  {
    value: 'yes',
    title: 'One of the three exceptions applies to me',
    description: 'Re-entry permit, multiple-entry visa or exempt nationality, or a refugee travel document.',
  },
  {
    value: 'no',
    title: 'None of them applies',
    description: 'The card is treated the same as a permanent departure.',
  },
];

export default function TaskDetail() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const taskId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { profile } = useProfile();
  const { progress } = useTaskProgress();
  const [localProgress, setLocalProgress] = useState<LocalTaskProgress>(progress);
  const [busyAction, setBusyAction] = useState<BusyAction>(null);

  const phase = useMemo(() => phaseForProfile(profile), [profile]);
  const tasks = useMemo(
    () => (profile ? buildHomeTasks(profile, localProgress, phase) : []),
    [localProgress, phase, profile],
  );
  const task = tasks.find((candidate) => candidate.taskId === taskId);
  const metadata = taskId ? taskMetadata(taskId) : undefined;

  async function persistProgress(
    nextProgress: LocalTaskProgress,
    action: string,
    eventName:
      | 'task_complete'
      | 'task_uncomplete'
      | 'task_order_choice'
      | 'task_housing_address_check'
      | 'task_departure_type',
    busy: Exclude<BusyAction, null>,
  ) {
    setBusyAction(busy);
    try {
      // The local write is synchronous, but keeping the mutation in an async
      // boundary preserves the single error surface for every user action.
      await Promise.resolve().then(() => saveTaskProgress(nextProgress));
      setLocalProgress(nextProgress);
      // DEC-027 is not confirmed: wire the event sink, but keep condition,
      // task, and cohort payloads isolated until that decision is confirmed.
      track(eventName);
    } catch (error) {
      showOperationError(action, error);
    } finally {
      setBusyAction(null);
    }
  }

  function handleStatusToggle() {
    if (!task || !taskId || busyAction) return;
    const isCompleted = task.status === 'completed';
    const nextProgress: LocalTaskProgress = isCompleted
      ? {
          ...localProgress,
          completedTaskIds: localProgress.completedTaskIds.filter((id) => id !== taskId),
          inProgressTaskIds: localProgress.inProgressTaskIds.filter((id) => id !== taskId),
          completedAtByTaskId: withoutKey(localProgress.completedAtByTaskId, taskId),
        }
      : {
          ...localProgress,
          completedTaskIds: unique([...localProgress.completedTaskIds, taskId]),
          inProgressTaskIds: localProgress.inProgressTaskIds.filter((id) => id !== taskId),
          completedAtByTaskId: {
            ...localProgress.completedAtByTaskId,
            [taskId]: kstNow().toISOString(),
          },
        };

    void persistProgress(
      nextProgress,
      isCompleted ? 'mark this task as not done' : 'mark this task complete',
      isCompleted ? 'task_uncomplete' : 'task_complete',
      'status',
    );
  }

  function handleAddressMatch(value: boolean) {
    if (busyAction) return;
    void persistProgress(
      {
        ...localProgress,
        housingProviderAddressMatchesProof: value,
      },
      'save the address check',
      'task_housing_address_check',
      'address',
    );
  }

  function handleOrderChoice(value: DepartureOrderChoice) {
    if (busyAction) return;
    void persistProgress(
      {
        ...localProgress,
        departureOrderChoice: value,
      },
      'save the task order',
      'task_order_choice',
      'order',
    );
  }

  function handleDepartureType(value: DepartureType) {
    if (busyAction) return;
    void persistProgress(
      // Switching to a permanent departure makes the re-entry answer moot, so
      // it is cleared rather than left behind to contradict the new choice.
      {
        ...localProgress,
        departureType: value,
        reentryException: value === 'permanent' ? null : localProgress.reentryException,
      },
      'save your departure type',
      'task_departure_type',
      'departure',
    );
  }

  function handleReentryException(value: ReentryException) {
    if (busyAction) return;
    void persistProgress(
      { ...localProgress, reentryException: value },
      'save the re-entry answer',
      'task_departure_type',
      'departure',
    );
  }

  if (!profile || !task || !metadata) {
    return <MissingTask onBack={() => router.back()} />;
  }

  const canToggleStatus =
    task.status === 'available' ||
    task.status === 'in_progress' ||
    task.status === 'review_required' ||
    task.status === 'completed';
  const statusColor = statusAccent(task);
  const statusLabel = statusLabelFor(task);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Back"
          accessibilityState={{ disabled: false }}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color={palette.meok} strokeWidth={1.6} />
        </Pressable>
        <Text role="xs" color={palette.ash} weight="semibold">
          Task detail
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.titleBlock}>
          <View style={styles.titleRow}>
            <View style={styles.titleIcon}>
              <FileCheck2 size={28} color={palette.cheong} strokeWidth={1.5} />
            </View>
            <View style={styles.flexCopy}>
              <Text role="h1">{metadata.title}</Text>
              <Text role="body" color={palette.ash}>
                {metadata.summary}
              </Text>
            </View>
          </View>
          <Badge label={statusLabel} color={statusColor} bg={statusBackground(task)} />
        </View>

        <WhyTaskSection taskId={metadata.taskId} profile={profile} />

        <StatusSection
          task={task}
          metadata={metadata}
          tasks={tasks}
        />

        <SourceSection metadata={metadata} />

        {task.taskId === 'housing-proof' ? (
          <HousingDocumentsSection
            profile={profile}
            progress={localProgress}
            onAddressMatch={handleAddressMatch}
            busy={busyAction === 'address'}
          />
        ) : null}

        {task.taskId === 'residence-registration' ? <PhotoSpecificationSection /> : null}

        {task.taskId === 'departure-order' ? (
          <OrderChoiceSection
            choice={localProgress.departureOrderChoice}
            onSelect={handleOrderChoice}
            busy={busyAction === 'order'}
          />
        ) : null}

        {task.taskId === IMMIGRATION_APPOINTMENT_TASK_ID ? (
          <AppointmentSection
            isCompleted={task.status === 'completed'}
            appointmentDate={localProgress.appointmentDate}
          />
        ) : null}

        {task.taskId === DORMITORY_APPLICATION_TASK_ID ? (
          <DormitoryDeadlineSection universityId={profile.universityId} />
        ) : null}

        {task.taskId === DEPARTURE_TASK_IDS.residenceCardReturn ? (
          <ResidenceCardReturnSection
            departureType={localProgress.departureType}
            reentryException={localProgress.reentryException}
            onSelectDepartureType={handleDepartureType}
            onSelectReentryException={handleReentryException}
            busy={busyAction === 'departure'}
          />
        ) : null}

        {task.taskId === DEPARTURE_TASK_IDS.telecom ? <TelecomOverseasSection /> : null}

        {task.taskId === DEPARTURE_TASK_IDS.bankAccount ? <DepositAccountSection /> : null}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={task.status === 'completed' ? 'Mark as not done' : 'Mark complete'}
          onPress={handleStatusToggle}
          disabled={!canToggleStatus}
          loading={busyAction === 'status'}
          variant={task.status === 'completed' ? 'secondary' : 'primary'}
          fullWidth
          leftIcon={task.status === 'completed' ? undefined : <Check size={18} color={palette.hanji} />}
          accessibilityHint={
            task.status === 'completed'
              ? 'Remove the completed status from this task.'
              : 'Save this task as complete on this device.'
          }
        />
      </View>
    </SafeAreaView>
  );
}

function WhyTaskSection({ taskId, profile }: { taskId: string; profile: UserProfile }) {
  const why = whyForTask(taskId, profile);

  return (
    <View style={styles.section}>
      <SectionHeading icon={<CircleHelp size={19} color={palette.cheong} strokeWidth={1.5} />} title="Why this task" />
      <Text role="lead">{why.headline}</Text>
      <View style={styles.factList}>
        {why.facts.map((fact) => (
          <View key={fact.label} style={styles.factRow}>
            <Text role="sm" color={palette.ash} style={styles.factLabel}>
              {fact.label}
            </Text>
            <Text role="sm" weight="semibold" style={styles.factValue}>
              {fact.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function StatusSection({
  task,
  metadata,
  tasks,
}: {
  task: HomeTask;
  metadata: NonNullable<ReturnType<typeof taskMetadata>>;
  tasks: readonly HomeTask[];
}) {
  const dependencies = metadata.dependsOn ?? [];
  const dependencyTasks = dependencies.map((dependencyId) => ({
    id: dependencyId,
    task: tasks.find((candidate) => candidate.taskId === dependencyId),
  }));
  const isBlocked = task.status === 'blocked' || task.status === 'review_required';
  const isNotApplicable = task.status === 'not_applicable';

  return (
    <View style={styles.section}>
      <SectionHeading
        icon={
          isBlocked ? (
            <LockKeyhole size={19} color={palette.dancheong} strokeWidth={1.5} />
          ) : (
            <CheckCircle2 size={19} color={palette.jade} strokeWidth={1.5} />
          )
        }
        title="Prerequisites and status"
      />

      {dependencies.length > 0 ? (
        <View style={styles.dependencyBlock}>
          <Text role="sm" color={palette.ash}>
            This task depends on:
          </Text>
          {dependencyTasks.map(({ id, task: dependency }) => (
            <View key={id} style={styles.dependencyRow}>
              <CheckCircle2
                size={17}
                color={dependency?.status === 'completed' ? palette.jade : palette.stone}
                strokeWidth={1.6}
              />
              <Text role="sm" style={styles.flexCopy}>
                {taskMetadata(id)?.title ?? id}
                {dependency?.status === 'completed' ? ' · complete' : ' · not complete'}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {isBlocked ? (
        <View style={styles.blockedCallout}>
          <View style={styles.calloutHeader}>
            <LockKeyhole size={18} color={palette.dancheong} strokeWidth={1.5} />
            <Text role="h4">{task.status === 'review_required' ? 'Needs a condition check' : 'Blocked'}</Text>
          </View>
          <Text role="body">{task.reason ?? 'This task cannot start yet.'}</Text>
          {task.unlocksWhen ? (
            <Text role="sm" color={palette.cheong}>
              {task.unlocksWhen}
            </Text>
          ) : null}
          {task.alternativeMeans ? (
            <Text role="sm" color={palette.cheong}>
              {`Alternative: ${task.alternativeMeans}`}
            </Text>
          ) : null}
          {task.kind === 'eligibility' ? (
            <Text role="xs" color={palette.ash}>
              This is an eligibility block. Completing another task will not remove it.
            </Text>
          ) : null}
        </View>
      ) : null}

      {isNotApplicable ? (
        <View style={styles.neutralCallout}>
          <View style={styles.calloutHeader}>
            <CircleOff size={18} color={palette.ash} strokeWidth={1.5} />
            <Text role="h4">Not applicable</Text>
          </View>
          <Text role="body">{task.reason ?? 'This task does not apply to the conditions on file.'}</Text>
        </View>
      ) : null}

      {!isBlocked && !isNotApplicable ? (
        <Text role="sm" color={palette.ash}>
          {task.status === 'completed'
            ? 'Completed locally on this device. You can change this status below.'
            : 'The conditions on file allow you to mark this task complete.'}
        </Text>
      ) : null}
    </View>
  );
}

/** REQ-DAR-002 · REQ-DAR-006 · REQ-DAR-007 · REQ-COR-001 · REQ-COR-004 · TASK-03. */
function SourceSection({ metadata }: { metadata: TaskMetadata }) {
  const source = metadata.source;
  const reviewDue = isSourceReviewDue(source);

  return (
    <View style={styles.section}>
      <SectionHeading
        icon={<ExternalLink size={19} color={palette.cheong} strokeWidth={1.5} />}
        title="Official source"
      />
      <Card padded bg={palette.cloud} style={styles.sourceCard}>
        <SourceField label="Source" value={source.sourceLabel} />
        <SourceField
          label="Official link"
          value={source.sourceUrl || 'Not confirmed (미확인)'}
          href={source.sourceUrl || undefined}
          accessibilityLabel={source.sourceUrl ? `Official source: ${source.sourceUrl}` : undefined}
        />
        <SourceField label="Checked on" value={formatSourceDate(source.checkedAt)} />
        <SourceField label="Review after" value={formatSourceDate(source.reviewAfter)} />
        <SourceField label="Final authority" value={source.finalAuthority || 'Not confirmed (미확인)'} />
        <SourceField label="Volatility" value={sourceVolatilityLabel(source.volatility)} />
      </Card>

      {reviewDue ? (
        <View style={styles.warningCallout} accessibilityRole="alert">
          <AlertTriangle size={19} color={palette.dancheong} strokeWidth={1.5} />
          <View style={styles.flexCopy}>
            <Text role="h4">Source needs review</Text>
            <Text role="sm" color={palette.meok}>
              This guidance is past its review date. Confirm with {source.finalAuthority || 'the final authority'} before acting.
            </Text>
          </View>
        </View>
      ) : null}

      {source.conflictNote ? (
        <View style={styles.conflictCallout} accessibilityRole="alert">
          <View style={styles.calloutHeader}>
            <AlertTriangle size={19} color={palette.hwanggeumDeep} strokeWidth={1.5} />
            <Text role="h4">Guidance differs</Text>
          </View>
          <Text role="sm" color={palette.meok}>
            {source.conflictNote}
          </Text>
          <View style={styles.conflictList}>
            {source.conflictValues.map((item) => (
              <ConflictValueRow key={`${item.sourceLabel}-${item.value}`} value={item} />
            ))}
          </View>
          <Text role="xs" color={palette.ash}>
            K-Journey keeps every reported value. The final authority is {source.finalAuthority}.
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function SourceField({
  label,
  value,
  selectable = false,
  href,
  accessibilityLabel,
}: {
  label: string;
  value: string;
  selectable?: boolean;
  href?: string;
  accessibilityLabel?: string;
}) {
  const valueText = (
    <Text
      role="sm"
      weight="semibold"
      selectable={selectable || Boolean(href)}
      color={href ? palette.cheong : undefined}
      style={styles.sourceValue}
    >
      {value}
    </Text>
  );

  return (
    <View style={styles.sourceField}>
      <Text role="xs" color={palette.ash} style={styles.sourceLabel}>
        {label}
      </Text>
      {href ? (
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={accessibilityLabel ?? `Open ${value}`}
          accessibilityHint="Opens the official source in your browser."
          onPress={() => Linking.openURL(href).catch((error) => showOperationError('open the official source', error))}
          hitSlop={8}
        >
          {valueText}
        </Pressable>
      ) : valueText}
    </View>
  );
}

function ConflictValueRow({ value }: { value: TaskSourceValue }) {
  return (
    <View style={styles.conflictValueRow}>
      <View style={styles.flexCopy}>
        <Text role="body" weight="semibold">
          {value.value}
        </Text>
        <Text role="xs" color={palette.ash}>
          {value.sourceLabel} · checked {formatSourceDate(value.checkedAt)}
        </Text>
      </View>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`Open source from ${value.sourceLabel}`}
        onPress={() => Linking.openURL(value.sourceUrl).catch((error) => showOperationError('open the source', error))}
        hitSlop={8}
      >
        <Text role="xs" color={palette.cheong} selectable>
          {value.sourceUrl}
        </Text>
      </Pressable>
    </View>
  );
}

function formatSourceDate(value: string | null): string {
  if (!value) return 'Not confirmed (미확인)';
  return formatInTimeZone(toKstStartOfDay(value), KST, 'MMM d, yyyy');
}

function sourceVolatilityLabel(value: TaskSourceMetadata['volatility']): string {
  if (value === 'unknown') return 'Not confirmed (미확인)';
  return value === 'high' ? 'High — check before acting' : value[0].toUpperCase() + value.slice(1);
}

function HousingDocumentsSection({
  profile,
  progress,
  onAddressMatch,
  busy,
}: {
  profile: UserProfile;
  progress: LocalTaskProgress;
  onAddressMatch: (value: boolean) => void;
  busy: boolean;
}) {
  const evaluation = getHousingProofDocuments(
    profile.housingType,
    profile.contractHolder,
    progress.housingProviderAddressMatchesProof,
  );

  return (
    <View style={styles.section}>
      <SectionHeading icon={<FileText size={19} color={palette.hwanggeumDeep} strokeWidth={1.5} />} title="Required documents" />
      {evaluation.status === 'review_required' ? (
        <View style={styles.neutralCallout}>
          <Text role="body">{evaluation.reason}</Text>
        </View>
      ) : (
        <>
          <Text role="sm" color={palette.ash}>
            Each item names the person or office to request it from.
          </Text>
          <View style={styles.documentList}>
            {evaluation.documents.map((document) => (
              <DocumentRow key={document.id} document={document} />
            ))}
          </View>
          {evaluation.documents.some((document) => document.id === 'contract-holder-lease') ? (
            <AddressMatchQuestion
              value={progress.housingProviderAddressMatchesProof}
              onSelect={onAddressMatch}
              busy={busy}
            />
          ) : null}
        </>
      )}
    </View>
  );
}

function DocumentRow({ document }: { document: HousingDocumentSpec }) {
  const status = document.required === null ? 'CHECK NEEDED' : document.required ? 'REQUIRED' : 'NOT NEEDED';
  const statusColor = document.required === false ? palette.ash : document.required === null ? palette.hwanggeumDeep : palette.cheong;

  return (
    <Card padded bg={palette.hanji} style={styles.documentCard}>
      <View style={styles.documentHeader}>
        <View style={styles.flexCopy}>
          <Text role="h4">{document.title}</Text>
          <Text role="xs" color={palette.ash}>
            Requested from: {document.requestedFrom}
          </Text>
        </View>
        <Badge label={status} color={statusColor} bg={palette.cloud} />
      </View>
      <Text role="sm" color={palette.meokMid}>
        {document.details}
      </Text>
      <View style={styles.specificationRow}>
        <FileText size={15} color={palette.cheong} strokeWidth={1.5} />
        <Text role="xs" color={palette.cheong} style={styles.flexCopy}>
          Specification: {DOCUMENT_SPECIFICATIONS[document.id] ?? 'Not confirmed yet.'}
        </Text>
      </View>
    </Card>
  );
}

function AddressMatchQuestion({
  value,
  onSelect,
  busy,
}: {
  value: boolean | null;
  onSelect: (value: boolean) => void;
  busy: boolean;
}) {
  return (
    <View style={styles.nestedBlock}>
      <View style={styles.calloutHeader}>
        <UserRound size={18} color={palette.cheong} strokeWidth={1.5} />
        <Text role="h4">Check the provider address</Text>
      </View>
      <Text role="sm" color={palette.ash}>
        Is the address on the provider identification document the same as the accommodation address?
      </Text>
      <View style={styles.choiceList}>
        <ChoiceCard
          title="Yes, the addresses match"
          description="The provider lease copy is not needed for this condition."
          selected={value === true}
          disabled={busy}
          onPress={() => onSelect(true)}
        />
        <ChoiceCard
          title="No, the addresses differ"
          description="Request the provider lease agreement copy as well."
          selected={value === false}
          disabled={busy}
          onPress={() => onSelect(false)}
        />
      </View>
    </View>
  );
}

/** REQ-SFR-008 · REQ-SFR-010 · TASK-02 · POL-006 · POL-007. */
function PhotoSpecificationSection() {
  return (
    <View style={styles.section}>
      <SectionHeading icon={<FileText size={19} color={palette.hwanggeumDeep} strokeWidth={1.5} />} title="Photo specification" />
      <Card padded bg={palette.cloud} style={styles.photoCard}>
        <Text role="body" weight="semibold">
          {PHOTO_SPECIFICATION}
        </Text>
      </Card>
      <View style={styles.warningCallout}>
        <AlertTriangle size={19} color={palette.dancheong} strokeWidth={1.5} />
        <View style={styles.flexCopy}>
          <Text role="h4">Do not reuse an old photo</Text>
          <Text role="sm" color={palette.meok}>
            Reusing a photo submitted for a previous residence card can lead to a new-photo request and at least a two-week delay.
          </Text>
        </View>
      </View>
      <View style={styles.neutralCallout}>
        <Text role="h4">Keep your residence stable</Text>
        <Text role="sm" color={palette.meok}>
          Changing residence is unavailable while your Residence Card is being issued. Confirm any move with your university international office first.
        </Text>
      </View>
    </View>
  );
}

function OrderChoiceSection({
  choice,
  onSelect,
  busy,
}: {
  choice: DepartureOrderChoice | null;
  onSelect: (value: DepartureOrderChoice) => void;
  busy: boolean;
}) {
  return (
    <View style={styles.section}>
      <SectionHeading icon={<ArrowDownUp size={19} color={palette.cheong} strokeWidth={1.5} />} title="Task order choice" />
      <Text role="sm" color={palette.ash}>
        Choose the order that matches your bank and housing arrangements. Neither option is a universal requirement.
      </Text>
      <View style={styles.choiceList}>
        {ORDER_OPTIONS.map((option) => (
          <ChoiceCard
            key={option.value}
            title={option.title}
            description={option.description}
            selected={choice === option.value}
            disabled={busy}
            onPress={() => onSelect(option.value)}
          />
        ))}
      </View>
      {choice ? (
        <Text role="xs" color={palette.jade}>
          Your order is saved on this device.
        </Text>
      ) : null}
    </View>
  );
}

/** REQ-SFR-007 AC3 · AC4 · TC-033 · TC-034. */
function AppointmentSection({
  isCompleted,
  appointmentDate,
}: {
  isCompleted: boolean;
  appointmentDate: string | null;
}) {
  const verdict = evaluateImmigrationAppointment(isCompleted, appointmentDate);

  return (
    <View style={styles.section}>
      <SectionHeading
        icon={<CalendarClock size={19} color={palette.cheong} strokeWidth={1.5} />}
        title="Your appointment"
      />
      <Card padded bg={palette.cloud} style={styles.sourceCard}>
        <SourceField label="Booking status" value={verdict.status === 'booked' ? 'Booked' : 'Not booked yet'} />
        <SourceField label="Appointment date" value={verdict.appointmentDateLabel} />
        <SourceField label="Final authority" value={verdict.finalAuthority} />
      </Card>
      {verdict.status === 'booked' && !verdict.appointmentDate ? (
        <View style={styles.neutralCallout}>
          <Text role="sm" color={palette.meok}>
            You marked this booked without a date. That is fine — the date stays unknown here until you
            add it, and {verdict.finalAuthority} can confirm your slot.
          </Text>
        </View>
      ) : null}
      <View style={styles.neutralCallout}>
        <Text role="h4">How long is the wait?</Text>
        <Text role="sm" color={palette.meok}>
          Not confirmed (미확인). No official source states a waiting period, so K-Journey does not
          estimate one. Check current availability on HiKorea before you plan around it.
        </Text>
      </View>
    </View>
  );
}

/** REQ-SFR-009 AC1 · AC2 · AC4 · AC5 · TC-041 · TC-042 · TC-044 · TC-045. */
function DormitoryDeadlineSection({ universityId }: { universityId: string }) {
  const verdict = evaluateDormitoryApplication(universityId);

  return (
    <View style={styles.section}>
      <SectionHeading
        icon={<CalendarClock size={19} color={palette.hwanggeumDeep} strokeWidth={1.5} />}
        title="Application deadline"
      />
      <Card padded bg={palette.cloud} style={styles.sourceCard}>
        <SourceField label="Deadline" value={verdict.deadlineLabel} />
        <SourceField
          label="Days remaining"
          value={verdict.daysRemaining === null ? 'Not confirmed (미확인)' : String(verdict.daysRemaining)}
        />
        <SourceField label="Checked on" value={formatSourceDate(verdict.checkedAt)} />
        <SourceField label="Final authority" value={verdict.finalAuthority} />
      </Card>
      <View style={verdict.status === 'overdue' ? styles.warningCallout : styles.neutralCallout}>
        <View style={styles.flexCopy}>
          <Text role="h4">
            {verdict.status === 'overdue' ? 'The deadline has passed' : 'Confirm the date yourself'}
          </Text>
          <Text role="sm" color={palette.meok}>
            {verdict.reason}
          </Text>
          <Text role="xs" color={palette.ash}>
            K-Journey does not fill in another university&apos;s deadline, and never marks this task
            complete on your behalf.
          </Text>
        </View>
      </View>
    </View>
  );
}

/** REQ-SFR-002 AC2 · AC5 · TC-007 · TC-010. */
function ResidenceCardReturnSection({
  departureType,
  reentryException,
  onSelectDepartureType,
  onSelectReentryException,
  busy,
}: {
  departureType: DepartureType | null;
  reentryException: ReentryException | null;
  onSelectDepartureType: (value: DepartureType) => void;
  onSelectReentryException: (value: ReentryException) => void;
  busy: boolean;
}) {
  const verdict = evaluateResidenceCardReturn(
    departureType ?? UNKNOWN,
    reentryException ?? UNKNOWN,
  );

  return (
    <View style={styles.section}>
      <SectionHeading
        icon={<UserRound size={19} color={palette.cheong} strokeWidth={1.5} />}
        title="Are you coming back?"
      />
      <Text role="sm" color={palette.ash}>
        Handing the card over declares that you are leaving for good, so this answer decides the task.
      </Text>
      <View style={styles.choiceList}>
        {DEPARTURE_TYPE_OPTIONS.map((option) => (
          <ChoiceCard
            key={String(option.value)}
            title={option.title}
            description={option.description}
            selected={departureType === option.value}
            disabled={busy}
            onPress={() => onSelectDepartureType(option.value)}
          />
        ))}
      </View>

      {departureType === 'temporary' ? (
        <View style={styles.nestedBlock}>
          <Text role="h4">Does a re-entry exception apply?</Text>
          <View style={styles.choiceList}>
            {REENTRY_EXCEPTION_OPTIONS.map((option) => (
              <ChoiceCard
                key={String(option.value)}
                title={option.title}
                description={option.description}
                selected={reentryException === option.value}
                disabled={busy}
                onPress={() => onSelectReentryException(option.value)}
              />
            ))}
          </View>
        </View>
      ) : null}

      <View style={verdict.status === 'review_required' ? styles.warningCallout : styles.neutralCallout}>
        <View style={styles.flexCopy}>
          <Text role="h4">
            {verdict.status === 'return_required' ? 'Return the card at departure' : 'Confirm before you travel'}
          </Text>
          <Text role="sm" color={palette.meok}>
            {verdict.reason}
          </Text>
          <Text role="xs" color={palette.ash}>
            Final authority: {verdict.finalAuthority}
          </Text>
        </View>
      </View>

      <View style={styles.neutralCallout}>
        <Text role="h4">The three exceptions in Article 37(1)</Text>
        {verdict.exceptions.map((exception) => (
          <Text key={exception} role="sm" color={palette.meok}>
            · {exception}
          </Text>
        ))}
        <Text role="xs" color={palette.cheong} selectable accessibilityRole="link">
          {verdict.sourceUrl}
        </Text>
        <Text role="xs" color={palette.ash}>
          Checked on {formatSourceDate(verdict.checkedAt)}
        </Text>
      </View>
    </View>
  );
}

/** REQ-SFR-002 AC4 · TC-009: never state that cancelling from abroad works. */
function TelecomOverseasSection() {
  const guidance = telecomOverseasGuidance();

  return (
    <View style={styles.section}>
      <SectionHeading
        icon={<CircleHelp size={19} color={palette.hwanggeumDeep} strokeWidth={1.5} />}
        title="Can you cancel after you leave?"
      />
      <View style={styles.neutralCallout}>
        <Text role="body" weight="semibold">
          Not confirmed (미확인).
        </Text>
        <Text role="sm" color={palette.meok}>
          No source confirms that a contract can be cancelled from outside Korea. Treat cancellation as
          something to finish before you fly, and ask your carrier about these three points:
        </Text>
        {guidance.checkBeforeLeaving.map((item) => (
          <Text key={item} role="sm" color={palette.meok}>
            · {item}
          </Text>
        ))}
        <Text role="xs" color={palette.ash}>
          Final authority: {guidance.finalAuthority}
        </Text>
      </View>
    </View>
  );
}

/** REQ-SFR-002 AC3 · TC-008: two outcomes, neither marked correct. */
function DepositAccountSection() {
  return (
    <View style={styles.section}>
      <SectionHeading
        icon={<ArrowDownUp size={19} color={palette.cheong} strokeWidth={1.5} />}
        title="Deposit and account conflict"
      />
      <Text role="sm" color={palette.ash}>
        A deposit can arrive after you leave, but an account can only be closed before. Neither choice
        breaks a rule — they lead to different outcomes.
      </Text>
      <View style={styles.documentList}>
        {DEPOSIT_ACCOUNT_OUTCOMES.map((option) => (
          <Card key={option.choice} padded bg={palette.hanji} style={styles.documentCard}>
            <Text role="h4">{option.title}</Text>
            <Text role="sm" color={palette.meokMid}>
              {option.outcome}
            </Text>
          </Card>
        ))}
      </View>
      <Text role="xs" color={palette.ash}>
        K-Journey does not pick one for you. Record your choice on the Departure order task.
      </Text>
    </View>
  );
}

function ChoiceCard({
  title,
  description,
  selected,
  disabled,
  onPress,
}: {
  title: string;
  description: string;
  selected: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Card
      onPress={disabled ? undefined : onPress}
      accessibilityRole="radio"
      accessibilityLabel={title}
      accessibilityHint={description}
      accessibilityState={{ selected, disabled }}
      style={[
        styles.choiceCard,
        {
          borderColor: selected ? palette.dancheong : palette.hairline,
          borderWidth: selected ? 2 : 1,
          opacity: disabled ? 0.6 : 1,
        },
      ]}
    >
      <View style={styles.flexCopy}>
        <Text role="body" weight="semibold">
          {title}
        </Text>
        <Text role="sm" color={palette.ash}>
          {description}
        </Text>
      </View>
      <View style={[styles.radio, selected ? styles.radioSelected : null]}>
        {selected ? <View style={styles.radioDot} /> : null}
      </View>
    </Card>
  );
}

function SectionHeading({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <View style={styles.sectionHeading}>
      {icon}
      <Text role="h3">{title}</Text>
    </View>
  );
}

function MissingTask({ onBack }: { onBack: () => void }) {
  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          onPress={onBack}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Back"
          accessibilityState={{ disabled: false }}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color={palette.meok} strokeWidth={1.6} />
        </Pressable>
        <Text role="xs" color={palette.ash} weight="semibold">
          Task detail
        </Text>
        <View style={styles.headerSpacer} />
      </View>
      <View style={styles.missingBody}>
        <Text role="h2">Task not found</Text>
        <Text role="body" color={palette.ash} align="center">
          Return to your journey home and choose a task from the list.
        </Text>
        <Button label="Back to journey" onPress={onBack} variant="secondary" />
      </View>
    </SafeAreaView>
  );
}

function whyForTask(taskId: string, profile: UserProfile): {
  headline: string;
  facts: readonly { label: string; value: string }[];
} {
  if (taskId === 'residence-registration') {
    const stay = displayConditionValue('totalStayDays', profile.totalStayDays);
    const visa = displayConditionValue('visaTypeOrStatus', profile.visaTypeOrStatus);
    return {
      headline:
        isUnknownConditionValue(profile.totalStayDays) || isUnknownConditionValue(profile.visaTypeOrStatus)
          ? 'Your stay length and visa status decide whether residence registration applies.'
          : `Your ${describeStayLength(profile.totalStayDays)} and ${visa} status put this task on your journey.`,
      facts: [
        { label: 'Total stay length', value: stay },
        { label: 'Visa status', value: visa },
      ],
    };
  }

  if (taskId === IMMIGRATION_APPOINTMENT_TASK_ID) {
    return {
      headline:
        'Appointment slots, not paperwork, are the scarce part. Booking first keeps a deadline from arriving before a slot does.',
      facts: [
        { label: 'Blocks', value: 'Housing proof documents' },
        { label: 'Waiting time', value: 'Not confirmed (미확인)' },
      ],
    };
  }

  if (taskId === DORMITORY_APPLICATION_TASK_ID) {
    const verdict = evaluateDormitoryApplication(profile.universityId);
    return {
      headline:
        'Missing this deadline changes your housing type, which re-runs the residence-proof, address, and group-registration rules.',
      facts: [
        { label: 'University', value: displayConditionValue('universityId', profile.universityId) },
        { label: 'Application deadline', value: verdict.deadlineLabel },
      ],
    };
  }

  const departureSpec = departureTaskSpec(taskId);
  if (departureSpec) {
    return {
      headline: departureSpec.summary,
      facts: [
        { label: 'When to do it', value: departureSpec.timingLabel },
        { label: 'Departure date', value: displayConditionValue('departureDate', profile.departureDate) },
      ],
    };
  }

  if (taskId === 'housing-proof') {
    const housing = displayConditionValue('housingType', profile.housingType);
    const holder = displayConditionValue('contractHolder', profile.contractHolder);
    return {
      headline: isUnknownConditionValue(profile.housingType) || isUnknownConditionValue(profile.contractHolder)
        ? 'Your housing type and contract holder decide which proof to request.'
        : `You selected ${housing} with ${holder}, so the document path follows this combination.`,
      facts: [
        { label: 'Housing type', value: housing },
        { label: 'Contract holder', value: holder },
      ],
    };
  }

  if (taskId === 'group-registration') {
    return {
      headline: isUnknownConditionValue(profile.totalStayDays)
        ? 'Your total stay length decides whether group registration can be assessed.'
        : `Your ${describeStayLength(profile.totalStayDays)} is the condition used for this check.`,
      facts: [
        { label: 'Total stay length', value: displayConditionValue('totalStayDays', profile.totalStayDays) },
        { label: 'University', value: displayConditionValue('universityId', profile.universityId) },
      ],
    };
  }

  return {
    headline: isUnknownConditionValue(profile.departureDate)
      ? 'Your departure date places this task in the pre-departure part of the journey.'
      : `Your departure date is ${displayConditionValue('departureDate', profile.departureDate)}.`,
    facts: [
      { label: 'Departure date', value: displayConditionValue('departureDate', profile.departureDate) },
      { label: 'Current phase', value: `Phase ${phaseForProfile(profile)}` },
    ],
  };
}

/**
 * The stay length is a bare number, so interpolating it produced "Your 20 stay".
 * The unit belongs to the sentence, not to the fact-table value beside it.
 */
function describeStayLength(value: unknown): string {
  if (isUnknownConditionValue(value)) return 'stay length';
  return `${value}-day stay`;
}

function displayConditionValue(axis: string, value: unknown): string {
  if (isUnknownConditionValue(value)) return 'Unknown / not sure';
  const values: Record<string, Record<string, string>> = {
    visaTypeOrStatus: {
      'D-2-6': 'D-2-6',
      'D-2-8': 'D-2-8',
      visa_free: 'Visa-free status',
    },
    housingType: {
      dormitory: 'University dormitory',
      own_lease: 'Private lease',
      third_party_lease: 'Shared housing',
      registered_business: 'Registered business accommodation',
    },
    contractHolder: {
      self: 'you',
      third_party: 'a third party or company',
      none: 'no contract',
      n_a: 'not applicable',
      undecided: 'undecided',
    },
  };
  return values[axis]?.[String(value)] ?? String(value);
}

function phaseForProfile(profile: UserProfile | null): Phase {
  return calcDatePhase({
    arrivalDate: knownDate(profile?.arrivalDate),
    departureDate: knownDate(profile?.departureDate),
  });
}

function knownDate(value: string | null | undefined): string | null {
  return typeof value === 'string' && !isUnknownConditionValue(value) ? value : null;
}

function statusLabelFor(task: HomeTask): string {
  if (task.status === 'completed') return taskStateLabel('completed');
  if (task.status === 'in_progress') return taskStateLabel('in_progress');
  if (task.status === 'available') return taskStateLabel('available');
  if (task.status === 'not_applicable') return taskStateLabel('not_applicable');
  if (task.status === 'review_required') return taskStateLabel('review_required');
  // An eligibility block never clears by finishing another task, so it must not
  // read the same as a sequential block (TC-121).
  return taskStateLabel(task.kind === 'eligibility' ? 'locked_permanent' : 'locked');
}

function statusAccent(task: HomeTask): string {
  if (task.status === 'completed' || task.status === 'available' || task.status === 'in_progress') return palette.jade;
  if (task.status === 'not_applicable') return palette.ash;
  return palette.dancheong;
}

function statusBackground(task: HomeTask): string {
  if (task.status === 'completed' || task.status === 'available' || task.status === 'in_progress') return palette.jadeLight;
  if (task.status === 'not_applicable') return palette.cloud;
  return palette.dancheongLight;
}

function unique(values: readonly string[]): string[] {
  return [...new Set(values)];
}

function withoutKey<T>(record: Readonly<Record<string, T>>, key: string): Record<string, T> {
  const next = { ...record };
  delete next[key];
  return next;
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
  body: {
    paddingHorizontal: space[5],
    paddingBottom: space[8],
    gap: space[5],
  },
  titleBlock: { gap: space[3] },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: space[3] },
  titleIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.card,
    backgroundColor: palette.cheongLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flexCopy: { flex: 1, gap: space[1] },
  section: { gap: space[3] },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  factList: {
    borderTopWidth: 1,
    borderTopColor: semantic.border.hairline,
  },
  factRow: {
    minHeight: 44,
    paddingVertical: space[2],
    borderBottomWidth: 1,
    borderBottomColor: semantic.border.hairline,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
  },
  factLabel: { width: 132 },
  factValue: { flex: 1, textAlign: 'right' },
  dependencyBlock: { gap: space[2], padding: space[4], backgroundColor: palette.cloud, borderRadius: radius.card },
  dependencyRow: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: space[2] },
  blockedCallout: { gap: space[2], padding: space[4], backgroundColor: palette.dancheongLight, borderRadius: radius.card, borderWidth: 1, borderColor: palette.dancheong },
  neutralCallout: { gap: space[2], padding: space[4], backgroundColor: palette.cloud, borderRadius: radius.card, borderWidth: 1, borderColor: palette.hairline },
  calloutHeader: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  documentList: { gap: space[3] },
  sourceCard: { gap: 0 },
  sourceField: {
    minHeight: 44,
    paddingVertical: space[2],
    borderBottomWidth: 1,
    borderBottomColor: semantic.border.hairline,
    gap: space[1],
  },
  sourceLabel: { textTransform: 'none' },
  sourceValue: { flexShrink: 1 },
  conflictCallout: {
    gap: space[3],
    padding: space[4],
    backgroundColor: palette.hwanggeumLight,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: palette.hwanggeumDeep,
  },
  conflictList: { gap: space[2] },
  conflictValueRow: {
    gap: space[2],
    paddingTop: space[2],
    borderTopWidth: 1,
    borderTopColor: palette.hwanggeum,
  },
  documentCard: { gap: space[3] },
  documentHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: space[2] },
  specificationRow: { flexDirection: 'row', alignItems: 'flex-start', gap: space[2], paddingTop: space[2], borderTopWidth: 1, borderTopColor: semantic.border.hairline },
  nestedBlock: { gap: space[3], padding: space[4], backgroundColor: palette.cheongLight, borderRadius: radius.card },
  choiceList: { gap: space[2] },
  choiceCard: { minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: space[3] },
  radio: { width: 24, height: 24, borderRadius: radius.full, borderWidth: 1.5, borderColor: palette.stone, alignItems: 'center', justifyContent: 'center' },
  radioSelected: { borderColor: palette.dancheong },
  radioDot: { width: 12, height: 12, borderRadius: radius.full, backgroundColor: palette.dancheong },
  photoCard: { gap: space[2], borderColor: palette.hwangtoDeep },
  warningCallout: { flexDirection: 'row', alignItems: 'flex-start', gap: space[2], padding: space[4], backgroundColor: palette.dancheongLight, borderRadius: radius.card, borderWidth: 1, borderColor: palette.dancheong },
  footer: { paddingHorizontal: space[5], paddingTop: space[3], paddingBottom: space[4], borderTopWidth: 1, borderTopColor: semantic.border.hairline, backgroundColor: palette.hanji },
  missingBody: { flex: 1, paddingHorizontal: space[6], alignItems: 'center', justifyContent: 'center', gap: space[3] },
});
