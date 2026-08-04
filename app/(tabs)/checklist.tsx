// Screen IDs: CHECKLIST-00 (Administrative checklist); regions HOME-01 through HOME-07.
import React, { useMemo } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  AlertTriangle,
  CalendarClock,
  ChevronRight,
  CheckCircle2,
  CircleOff,
  ClipboardCheck,
  FileText,
  Info,
  LockKeyhole,
  ShieldAlert,
} from 'lucide-react-native';
import { formatInTimeZone } from 'date-fns-tz';

import { Badge, Card, EmptyState, MIN_TARGET, NetworkIndicator, Text } from '../../src/components/ui';
import { JourneyModeSwitch } from '../../src/components/home/JourneyModeSwitch';
import { useProfile, useTaskProgress } from '../../src/hooks/useProfile';
import { calcDatePhase, dDay, type Phase } from '../../src/hooks/usePhase';
import {
  evaluateGroupRegistration,
  evaluateHousingContract,
  evaluateResidenceRegistration,
  isUnknownConditionValue,
  type RuleVerdict,
} from '../../src/lib/conditionRules';
import { KST, kstDifferenceInDays, kstNow, scheduleAtKstMorning, toKstStartOfDay } from '../../src/lib/dates';
import { track } from '../../src/lib/posthog';
import { surfaceError } from '../../src/lib/errorAlert';
import {
  DEPARTURE_TASKS,
  DEPARTURE_TASK_IDS,
  evaluateResidenceCardReturn,
  type DepartureTaskSpec,
} from '../../src/lib/departureTasks';
import {
  DORMITORY_APPLICATION_TASK_ID,
  evaluateDormitoryApplication,
} from '../../src/lib/dormitoryApplication';
import {
  evaluateDocumentTaskAgainstAppointment,
  IMMIGRATION_APPOINTMENT_TASK_ID,
} from '../../src/lib/immigrationAppointment';
import { UNKNOWN, type LocalTaskProgress, type UserProfile } from '../../src/lib/firebase';
import { palette, radius, semantic, space } from '../../design-tokens';
import { a11yState } from '../../src/lib/a11y';

const PHASE_LABEL: Record<Phase, string> = {
  1: 'Pre-arrival',
  2: 'First week',
  3: 'Living',
  4: 'Pre-departure',
};

type HomeTaskStatus =
  | 'available'
  | 'in_progress'
  | 'completed'
  | 'blocked'
  | 'review_required'
  | 'not_applicable';
type HomeTaskKind = 'sequential' | 'eligibility' | 'review';

export interface HomeTask {
  taskId: string;
  title: string;
  summary: string;
  status: HomeTaskStatus;
  kind?: HomeTaskKind;
  reason?: string;
  alternativeMeans?: string;
  sourceUrl?: string;
  unlocksWhen?: string;
}

interface TaskSectionProps {
  title: string;
  description: string;
  tasks: readonly HomeTask[];
  icon: React.ReactNode;
  screenName: string;
  emptyMessage: string;
  router: ReturnType<typeof useRouter>;
}

export default function ChecklistHome({ onShowCulture }: { onShowCulture?: () => void } = {}) {
  const router = useRouter();
  const { profile } = useProfile();
  const { progress } = useTaskProgress();

  const knownArrivalDate = knownDate(profile?.arrivalDate);
  const knownDepartureDate = knownDate(profile?.departureDate);
  const phase = useMemo(
    () =>
      knownArrivalDate && knownDepartureDate
        ? calcDatePhase({ arrivalDate: knownArrivalDate, departureDate: knownDepartureDate })
        : null,
    [knownArrivalDate, knownDepartureDate],
  );

  const tasks = useMemo(
    () => (profile ? buildHomeTasks(profile, progress, phase) : []),
    [profile, progress, phase],
  );
  const availableTasks = tasks.filter(
    (task) => task.status === 'available' || task.status === 'in_progress' || task.status === 'completed',
  );
  const blockedTasks = tasks.filter(
    (task) => task.status === 'blocked' || task.status === 'review_required',
  );
  const notApplicableTasks = tasks.filter((task) => task.status === 'not_applicable');
  const daysUntilDeparture = knownDepartureDate ? dDay(knownDepartureDate) : null;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text role="xs" color={palette.ash} weight="semibold">
              Journey home
            </Text>
            <Text role="h1">{profile?.displayName ? `Hi, ${profile.displayName}` : 'Your journey'}</Text>
            <Text role="body" color={palette.ash}>
              Your next administrative steps, sorted by what applies now.
            </Text>
          </View>
          <View style={styles.headerActions}>
            <NetworkIndicator />
            <Pressable
              onPress={() => {
                track('emergency_open');
                router.push('/emergency');
              }}
              hitSlop={8}
              style={styles.iconButton}
              accessibilityRole="button"
              accessibilityLabel="Emergency guide"
              {...a11yState({ disabled: false })}
            >
              <ShieldAlert size={22} color={palette.meok} strokeWidth={1.5} />
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <JourneyModeSwitch
            active="essentials"
            onChange={(next) => {
              if (next !== 'culture') return;
              if (onShowCulture) {
                onShowCulture();
              } else {
                router.replace({ pathname: '/(tabs)', params: { view: 'culture' } } as never);
              }
            }}
          />
        </View>

        {!knownArrivalDate ? (
          <View style={styles.section}>
            <MissingJourneyDatesCard onPress={() => router.push('/settings')} />
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <CurrentPhaseCard
                phase={phase}
                hasArrivalDate
                hasDepartureDate={!!knownDepartureDate}
              />
            </View>
            <View style={styles.section}>
              <RegistrationDeadlineCard arrivalDate={knownArrivalDate} />
            </View>
          </>
        )}

        {profile && shouldShowDepartureLock(profile) ? (
          <View style={styles.section}>
            <DepartureLockCard />
          </View>
        ) : null}

        <TaskSection
          title="Available"
          description="Tasks you can start with the conditions on file."
          tasks={availableTasks}
          icon={<CheckCircle2 size={22} color={palette.jade} strokeWidth={1.6} />}
          screenName="home_available_tasks"
          emptyMessage="No tasks are available yet."
          router={router}
        />
        <TaskSection
          title="Blocked"
          description="The card explains what is holding each task."
          tasks={blockedTasks}
          icon={<LockKeyhole size={22} color={palette.dancheong} strokeWidth={1.6} />}
          screenName="home_blocked_tasks"
          emptyMessage="No tasks are blocked right now."
          router={router}
        />
        <TaskSection
          title="Not applicable"
          description="These tasks stay visible with their official basis."
          tasks={notApplicableTasks}
          icon={<CircleOff size={22} color={palette.ash} strokeWidth={1.6} />}
          screenName="home_not_applicable_tasks"
          emptyMessage="No tasks are marked not applicable."
          router={router}
        />

        {daysUntilDeparture !== null && daysUntilDeparture < 0 ? (
          <View style={styles.section}>
            <ClosingChecklistCard />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function MissingJourneyDatesCard({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Add your journey dates in profile settings"
      style={({ pressed }) => [styles.dateSetupCard, { opacity: pressed ? 0.78 : 1 }]}
    >
      <View style={styles.dateSetupIcon}>
        <CalendarClock size={22} color={palette.cheong} strokeWidth={1.6} />
      </View>
      <View style={styles.flexCopy}>
        <Text role="badge" color={palette.cheong}>
          Complete your timeline
        </Text>
        <Text role="h3">Add your journey dates</Text>
        <Text role="sm" color={palette.ash}>
          One update unlocks your phase and 90-day registration deadline.
        </Text>
      </View>
      <ChevronRight size={20} color={palette.cheong} strokeWidth={1.6} />
    </Pressable>
  );
}

function CurrentPhaseCard({
  phase,
  hasArrivalDate,
  hasDepartureDate,
}: {
  phase: Phase | null;
  hasArrivalDate: boolean;
  hasDepartureDate: boolean;
}) {
  const isDateUnknown = !hasArrivalDate;
  const title = isDateUnknown
    ? 'Date not known'
    : !hasDepartureDate
      ? 'Phase pending'
      : `Phase ${phase}`;
  const detail = isDateUnknown
    ? 'Add an arrival date to calculate your current phase.'
    : !hasDepartureDate
      ? 'Add a departure date to calculate your current phase.'
      : PHASE_LABEL[phase ?? 1];

  return (
    <Card
      padded
      bg={isDateUnknown ? palette.cloud : palette.hwangto}
      style={styles.phaseCard}
    >
      <View style={styles.cardEyebrow}>
        <CalendarClock size={18} color={isDateUnknown ? palette.ash : palette.cheong} strokeWidth={1.6} />
        <Text role="badge" color={isDateUnknown ? palette.ash : palette.cheong}>
          Current phase
        </Text>
      </View>
      <Text role="h2">{title}</Text>
      <Text role="body" color={palette.ash}>
        {detail}
      </Text>
    </Card>
  );
}

/** REQ-SFR-005 · POL-009 · HOME-02: show the arrival-plus-90-day deadline. */
function RegistrationDeadlineCard({ arrivalDate }: { arrivalDate: string }) {
  const deadline = scheduleAtKstMorning(arrivalDate, -90);
  const daysRemaining = kstDifferenceInDays(
    toKstStartOfDay(deadline),
    toKstStartOfDay(kstNow()),
  );
  const overdue = daysRemaining < 0;
  const imminent = daysRemaining >= 0 && daysRemaining <= 14;
  const accent = overdue ? palette.dancheong : imminent ? palette.hwanggeumDeep : palette.cheong;
  const background = overdue
    ? palette.dancheongLight
    : imminent
      ? palette.hwanggeumLight
      : palette.cloud;
  const countdown = overdue
    ? `Overdue by ${Math.abs(daysRemaining)} days`
    : daysRemaining === 0
      ? 'Due today'
      : `D-${daysRemaining}`;

  return (
    <Card padded bg={background} style={styles.deadlineCard}>
      <View style={styles.cardEyebrow}>
        <CalendarClock size={18} color={accent} strokeWidth={1.6} />
        <Text role="badge" color={accent}>
          Registration deadline
        </Text>
      </View>
      <View style={styles.deadlineRow}>
        <View style={styles.flexCopy}>
          <Text role="h3">{countdown}</Text>
          <Text role="body" color={palette.ash}>
            {`90 days after arrival · ${formatInTimeZone(deadline, KST, 'MMM d, yyyy')}`}
          </Text>
        </View>
        <Text role="badge" color={accent}>
          {overdue ? 'OVERDUE' : imminent ? 'DUE SOON' : 'ON TRACK'}
        </Text>
      </View>
    </Card>
  );
}

/** REQ-SFR-006 · REQ-SFR-002 · POL-006 · POL-009 · HOME-03. */
function DepartureLockCard() {
  return (
    <Card padded bg={palette.dancheongLight} style={styles.warningCard}>
      <View style={styles.cardEyebrow}>
        <AlertTriangle size={18} color={palette.dancheong} strokeWidth={1.6} />
        <Text role="badge" color={palette.dancheong}>
          Departure lock warning
        </Text>
      </View>
      <Text role="h3">Check before leaving Korea</Text>
      <Text role="body" color={palette.meok}>
        If your registration card is not issued, leaving Korea may cancel your registration.
      </Text>
      <Text role="sm" color={palette.ash}>
        Confirm the travel exception with HiKorea or your university international office.
      </Text>
    </Card>
  );
}

function ClosingChecklistCard() {
  const checklist = [
    'Review your task statuses',
    'Confirm your departure date',
    'Check university guidance',
    'Keep your local records',
  ];

  return (
    <Card padded bg={palette.hwangto} style={styles.closingCard}>
      <View style={styles.cardEyebrow}>
        <ClipboardCheck size={18} color={palette.cheong} strokeWidth={1.6} />
        <Text role="badge" color={palette.cheong}>
          Closing checklist
        </Text>
      </View>
      <Text role="h3">Review before you close your journey</Text>
      <View style={styles.checklist}>
        {checklist.map((item) => (
          <View key={item} style={styles.checklistRow}>
            <CheckCircle2 size={17} color={palette.jade} strokeWidth={1.6} />
            <Text role="sm" color={palette.meok}>
              {item}
            </Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

function TaskSection({
  title,
  description,
  tasks,
  icon,
  screenName,
  emptyMessage,
  router,
}: TaskSectionProps) {
  return (
    <View style={styles.section} accessibilityRole="summary" accessibilityLabel={`${title} tasks`}>
      <View style={styles.sectionHeading}>
        <View style={styles.sectionTitleRow}>
          {icon}
          <Text role="h2">{title}</Text>
        </View>
        <Text role="sm" color={palette.ash}>
          {description}
        </Text>
      </View>
      {tasks.length === 0 ? (
        <EmptyState
          variant="header"
          screenName={screenName}
          icon={icon}
          message={emptyMessage}
          accessibilityLabel={`${title} tasks. ${emptyMessage}`}
        />
      ) : (
        <View style={styles.taskList}>
          {tasks.map((task) => (
            <TaskCard key={task.taskId} task={task} router={router} />
          ))}
        </View>
      )}
    </View>
  );
}

function TaskCard({ task, router }: { task: HomeTask; router: ReturnType<typeof useRouter> }) {
  const isCompleted = task.status === 'completed';
  const isAvailable = task.status === 'available' || task.status === 'in_progress' || isCompleted;
  const isNotApplicable = task.status === 'not_applicable';
  const isReview = task.status === 'review_required';
  const accent = isAvailable ? palette.jade : isNotApplicable ? palette.ash : palette.dancheong;
  const background = isAvailable
    ? palette.hanji
    : isNotApplicable
      ? palette.cloud
      : palette.dancheongLight;
  const Icon = isCompleted ? CheckCircle2 : isAvailable ? CheckCircle2 : isNotApplicable ? CircleOff : LockKeyhole;
  const label = isCompleted
    ? 'COMPLETED'
    : task.status === 'in_progress'
      ? 'IN PROGRESS'
      : isAvailable
        ? 'AVAILABLE'
        : isNotApplicable
          ? 'NOT APPLICABLE'
          : isReview
            ? 'REVIEW'
            : 'BLOCKED';

  return (
    <Card
      onPress={() => {
        track('task_open');
        router.push(`/task/${task.taskId}` as never);
      }}
      padded
      bg={background}
      style={[styles.taskCard, { borderColor: isAvailable ? palette.hairline : accent }]}
      accessibilityLabel={`${task.title}. ${label.toLowerCase()}.`}
      accessibilityHint="Tap to open task details."
      {...a11yState({ selected: isCompleted })}
    >
      <View style={styles.taskHeader}>
        <View style={[styles.taskIcon, { backgroundColor: isAvailable ? palette.jadeLight : isNotApplicable ? palette.cloud : palette.dancheongLight }]}>
          <Icon size={20} color={accent} strokeWidth={1.6} />
        </View>
        <View style={styles.flexCopy}>
          <Text role="h4">{task.title}</Text>
          <Text role="sm" color={palette.ash}>
            {task.summary}
          </Text>
        </View>
        <Badge label={label} color={accent} bg={background} />
      </View>

      {task.reason ? (
        <View style={styles.detailRow}>
          {task.kind === 'eligibility' ? (
            <LockKeyhole size={16} color={accent} strokeWidth={1.6} />
          ) : (
            <Info size={16} color={accent} strokeWidth={1.6} />
          )}
          <Text role="sm" color={palette.meok} style={styles.detailCopy}>
            {task.reason}
          </Text>
        </View>
      ) : null}

      {task.alternativeMeans ? (
        <View style={styles.detailRow}>
          <FileText size={16} color={palette.cheong} strokeWidth={1.6} />
          <Text role="sm" color={palette.cheong} style={styles.detailCopy}>
            {`Alternative: ${task.alternativeMeans}`}
          </Text>
        </View>
      ) : null}

      {task.unlocksWhen ? (
        <View style={styles.detailRow}>
          <Info size={16} color={palette.cheong} strokeWidth={1.6} />
          <Text role="sm" color={palette.cheong} style={styles.detailCopy}>
            {`Opens when: ${task.unlocksWhen}`}
          </Text>
        </View>
      ) : null}

      {task.sourceUrl ? (
        <View style={styles.sourceRow}>
          <Text role="xs" color={palette.ash}>
            Official basis
          </Text>
          <Pressable
            accessibilityRole="link"
            accessibilityLabel={`Open official basis for ${task.title}`}
            onPress={() => Linking.openURL(task.sourceUrl!).catch(() => surfaceError('unknown'))}
            style={styles.sourceLink}
          >
            <Text role="xs" color={palette.cheong} selectable>
              {task.sourceUrl}
            </Text>
          </Pressable>
        </View>
      ) : null}
    </Card>
  );
}

export function buildHomeTasks(
  profile: UserProfile,
  progress: LocalTaskProgress,
  phase: Phase | null,
): HomeTask[] {
  // REQ-SFR-003 · REQ-SFR-004 · REQ-SFR-011 · POL-004 · POL-005 · POL-006:
  // expose available, blocked, and not-applicable tasks with reasons.
  const registration = evaluateResidenceRegistration(profile);
  const housing = evaluateHousingContract(profile.housingType, profile.contractHolder);
  const groupRegistration = evaluateGroupRegistration(profile);

  // REQ-SFR-009: the dormitory deadline stays on the home screen after it
  // passes. Hiding it would remove the only place the overdue state is stated.
  const dormitoryTask = buildDormitoryTask(profile, progress);

  // REQ-SFR-007: booking precedes paperwork, so the appointment is its own task.
  const appointmentTask = taskWithProgress(
    {
      taskId: IMMIGRATION_APPOINTMENT_TASK_ID,
      title: 'Book your immigration appointment',
      summary: 'Secure a visit slot before you start preparing the registration documents.',
      status: 'available',
    },
    progress,
  );
  const appointmentCompleted = isTaskCompleted(progress, IMMIGRATION_APPOINTMENT_TASK_ID);

  const registrationTask = taskFromVerdict(
    'residence-registration',
    'Residence registration',
    'Foreign resident registration assessment',
    registration,
    progress,
  );

  const housingTask = buildHousingProofTask(
    registration,
    housing,
    progress,
    appointmentCompleted,
  );

  const groupTask = taskFromVerdict(
    'group-registration',
    'Group registration',
    'University-supported foreign resident registration',
    groupRegistration,
    progress,
  );

  const registrationTasks = [
    dormitoryTask,
    appointmentTask,
    registrationTask,
    housingTask,
    groupTask,
  ];

  if (phase !== 4) return registrationTasks;

  // REQ-SFR-002 AC1: the nine pre-departure tasks, each with its timing.
  const departureTasks = DEPARTURE_TASKS.map((spec) =>
    buildDepartureTask(spec, progress),
  );

  const orderTask = taskWithProgress(
    {
      taskId: 'departure-order',
      title: 'Departure order',
      summary: 'Choose how to handle your deposit and account before leaving Korea.',
      status: 'available',
    },
    progress,
  );

  return [...registrationTasks, ...departureTasks, orderTask];
}

/** REQ-SFR-009 AC1 · AC2 · AC4 · AC5. */
function buildDormitoryTask(profile: UserProfile, progress: LocalTaskProgress): HomeTask {
  const verdict = evaluateDormitoryApplication(profile.universityId);
  const base = {
    taskId: DORMITORY_APPLICATION_TASK_ID,
    title: 'Apply for dormitory housing',
    summary: 'Applications close before you arrive and places are limited.',
  };

  if (verdict.status === 'review_required') {
    return {
      ...base,
      status: 'blocked',
      kind: 'review',
      reason: verdict.reason,
      unlocksWhen: `Confirm the date with ${verdict.finalAuthority}.`,
      sourceUrl: verdict.sourceUrl || undefined,
    };
  }

  if (verdict.status === 'overdue') {
    // AC5: the app never marks this complete on the user's behalf.
    return {
      ...base,
      status: 'blocked',
      kind: 'review',
      reason: verdict.reason,
      unlocksWhen: `Confirm your application status with ${verdict.finalAuthority}.`,
      sourceUrl: verdict.sourceUrl || undefined,
    };
  }

  return taskWithProgress(
    {
      ...base,
      status: 'available',
      // AC2: both the countdown and the absolute date, never just one.
      reason:
        verdict.daysRemaining === null
          ? verdict.reason
          : `${verdict.daysRemaining} days left · closes ${verdict.deadlineLabel}`,
      sourceUrl: verdict.sourceUrl || undefined,
    },
    progress,
  );
}

/** REQ-SFR-007 AC1 · AC2 · AC5: the document task sits behind the appointment. */
function buildHousingProofTask(
  registration: RuleVerdict,
  housing: ReturnType<typeof evaluateHousingContract>,
  progress: LocalTaskProgress,
  appointmentCompleted: boolean,
): HomeTask {
  const base = {
    taskId: 'housing-proof',
    title: 'Housing proof',
    summary: 'Prepare documents for your housing and contract holder.',
  };

  if (registration.status === 'not_applicable') {
    return {
      ...base,
      summary: 'Documents for the residence registration process',
      status: 'not_applicable',
      reason: registration.reason,
      sourceUrl: registration.sourceUrl,
    };
  }

  if (registration.status !== 'applicable') {
    return {
      ...base,
      summary: 'Documents for the residence registration process',
      status: 'blocked',
      kind: 'sequential',
      reason: 'Complete the residence-registration assessment before preparing documents.',
      unlocksWhen: 'Residence registration is complete.',
    };
  }

  if (housing.status !== 'applicable') {
    return { ...base, status: 'blocked', kind: 'review', reason: housing.reason };
  }

  const documentState = evaluateDocumentTaskAgainstAppointment(
    appointmentCompleted,
    isTaskCompleted(progress, 'housing-proof'),
  );

  if (documentState.state === 'review_required') {
    // AC5: the completion the user recorded is kept, and flagged for recheck.
    return {
      ...base,
      status: 'review_required',
      kind: 'review',
      reason: documentState.reason,
      unlocksWhen: 'The immigration appointment is marked as booked again.',
    };
  }

  if (documentState.state === 'locked') {
    return {
      ...base,
      status: 'blocked',
      kind: 'sequential',
      reason: documentState.reason,
      unlocksWhen: 'The immigration appointment is marked as booked.',
    };
  }

  const registrationDone = isTaskCompleted(progress, 'residence-registration');
  return taskWithProgress(
    {
      ...base,
      status: registrationDone ? 'available' : 'blocked',
      kind: 'sequential',
      reason: registrationDone
        ? undefined
        : 'Complete the residence-registration assessment before preparing documents.',
      unlocksWhen: registrationDone ? undefined : 'Residence registration is complete.',
    },
    progress,
  );
}

/** REQ-SFR-002 AC1 · AC2 · AC5: one card per departure task, timing included. */
function buildDepartureTask(spec: DepartureTaskSpec, progress: LocalTaskProgress): HomeTask {
  const base = {
    taskId: spec.taskId,
    title: spec.title,
    summary: `${spec.summary} · ${spec.timingLabel}`,
  };

  if (spec.taskId === DEPARTURE_TASK_IDS.residenceCardReturn) {
    const verdict = evaluateResidenceCardReturn(
      progress.departureType ?? UNKNOWN,
      progress.reentryException ?? UNKNOWN,
    );
    if (verdict.status === 'review_required') {
      return {
        ...base,
        status: 'review_required',
        kind: 'review',
        reason: verdict.reason,
        unlocksWhen: `Confirm with ${verdict.finalAuthority}.`,
        sourceUrl: verdict.sourceUrl,
      };
    }
    return taskWithProgress(
      { ...base, status: 'available', reason: verdict.reason, sourceUrl: verdict.sourceUrl },
      progress,
    );
  }

  const incomplete = spec.dependsOn.filter((id) => !isTaskCompleted(progress, id));
  if (incomplete.length > 0) {
    return {
      ...base,
      status: 'blocked',
      kind: 'sequential',
      reason:
        'Each of these leaves a recurring charge that would go unpaid once the account is closed.',
      unlocksWhen: incomplete
        .map((id) => DEPARTURE_TASKS.find((task) => task.taskId === id)?.title ?? id)
        .join(', '),
    };
  }

  return taskWithProgress(
    { ...base, status: 'available', sourceUrl: spec.source.sourceUrl || undefined },
    progress,
  );
}

function taskFromVerdict(
  taskId: string,
  title: string,
  summary: string,
  verdict: RuleVerdict,
  progress: LocalTaskProgress,
): HomeTask {
  if (verdict.status === 'applicable') {
    return taskWithProgress({ taskId, title, summary, status: 'available' }, progress);
  }
  if (verdict.status === 'not_applicable') {
    return {
      taskId,
      title,
      summary,
      status: 'not_applicable',
      reason: verdict.reason,
      sourceUrl: verdict.sourceUrl,
    };
  }
  if (verdict.status === 'locked_permanent') {
    return {
      taskId,
      title,
      summary,
      status: 'blocked',
      kind: 'eligibility',
      reason: verdict.reason,
      alternativeMeans: verdict.alternativeMeans,
      sourceUrl: verdict.sourceUrl,
    };
  }
  return {
    taskId,
    title,
    summary,
    status: 'blocked',
    kind: 'review',
    reason: verdict.reason,
    unlocksWhen: verdict.pendingFields?.length
      ? `Provide ${verdict.pendingFields.map(conditionAxisLabel).join(' and ')} to reassess this task.`
      : undefined,
  };
}

function conditionAxisLabel(axis: string): string {
  const labels: Record<string, string> = {
    universityId: 'your university',
    programType: 'your program type',
    visaTypeOrStatus: 'your visa status',
    housingType: 'your housing type',
    contractHolder: 'the contract holder',
    totalStayDays: 'your total stay length',
    nationality: 'your nationality',
    homeCountryInsurance: 'home-country insurance',
    residenceCardStatus: 'your residence card status',
    arrivalDate: 'your arrival date',
    departureDate: 'your departure date',
    programStartDate: 'your program start date',
  };
  return labels[axis] ?? axis;
}

function taskWithProgress(task: HomeTask, progress: LocalTaskProgress): HomeTask {
  if (task.status !== 'available') return task;
  if (progress.completedTaskIds.includes(task.taskId)) return { ...task, status: 'completed' };
  if (progress.inProgressTaskIds.includes(task.taskId)) return { ...task, status: 'in_progress' };
  return task;
}

function isTaskCompleted(progress: LocalTaskProgress, taskId?: string): boolean {
  return taskId ? progress.completedTaskIds.includes(taskId) : progress.completedTaskIds.length > 0;
}

function knownDate(value: string | null | undefined): string | null {
  return typeof value === 'string' && !isUnknownConditionValue(value) ? value : null;
}

function shouldShowDepartureLock(profile: UserProfile): boolean {
  // REQ-SFR-006 · HOME-03: the warning is text-based, not color-only.
  return (
    profile.visaTypeOrStatus === 'D-2-8' &&
    ['not_started', 'booked', 'submitted', 'rejected'].includes(profile.residenceCardStatus)
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.hanji,
  },
  content: {
    paddingBottom: space[16],
  },
  header: {
    paddingHorizontal: space[5],
    paddingTop: space[4],
    paddingBottom: space[5],
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: space[4],
  },
  headerCopy: {
    flex: 1,
    gap: space[2],
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: palette.cloud,
  },
  section: {
    paddingHorizontal: space[5],
    paddingVertical: space[3],
    gap: space[3],
  },
  dateSetupCard: {
    minHeight: 120,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    padding: space[4],
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: palette.cheong + '55',
    backgroundColor: palette.cheongLight,
  },
  dateSetupIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.hanji,
  },
  phaseCard: {
    gap: space[2],
  },
  deadlineCard: {
    gap: space[3],
  },
  deadlineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space[3],
  },
  warningCard: {
    gap: space[3],
    borderColor: palette.dancheong,
  },
  closingCard: {
    gap: space[3],
  },
  cardEyebrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
  },
  sectionHeading: {
    gap: space[1],
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
  },
  taskList: {
    gap: space[3],
  },
  taskCard: {
    gap: space[3],
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space[3],
  },
  taskIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flexCopy: {
    flex: 1,
    gap: space[1],
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space[2],
  },
  detailCopy: {
    flex: 1,
  },
  sourceRow: {
    gap: space[1],
    paddingTop: space[2],
    borderTopWidth: 1,
    borderTopColor: semantic.border.hairline,
  },
  // A one-line URL is 17px tall in a browser; `hitSlop` does not exist there,
  // so the target has to be a real box. docs/ACCESSIBILITY.md → 44pt minimum.
  sourceLink: {
    minHeight: MIN_TARGET,
    justifyContent: 'center',
  },
  checklist: {
    gap: space[2],
  },
  checklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
  },
});
