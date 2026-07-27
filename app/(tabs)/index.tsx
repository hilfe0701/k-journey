import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  CircleOff,
  ClipboardCheck,
  FileText,
  Info,
  LockKeyhole,
  ShieldAlert,
} from 'lucide-react-native';
import { formatInTimeZone } from 'date-fns-tz';

import { Badge, Card, EmptyState, NetworkIndicator, Text } from '../../src/components/ui';
import { useProfile } from '../../src/hooks/useProfile';
import { calcPhase, dDay, type Phase } from '../../src/hooks/usePhase';
import {
  evaluateGroupRegistration,
  evaluateHousingContract,
  evaluateResidenceRegistration,
  isUnknownConditionValue,
  type RuleVerdict,
} from '../../src/lib/conditionRules';
import { KST, kstDifferenceInDays, kstNow, scheduleAtKstMorning, toKstStartOfDay } from '../../src/lib/dates';
import { track } from '../../src/lib/posthog';
import type { UserProfile } from '../../src/lib/firebase';
import { palette, radius, semantic, space } from '../../design-tokens';

const PHASE_LABEL: Record<Phase, string> = {
  1: 'Pre-arrival',
  2: 'First week',
  3: 'Living',
  4: 'Pre-departure',
};

type HomeTaskStatus = 'available' | 'blocked' | 'not_applicable';
type HomeTaskKind = 'sequential' | 'eligibility' | 'review';

interface HomeTask {
  taskId: string;
  title: string;
  summary: string;
  status: HomeTaskStatus;
  kind?: HomeTaskKind;
  reason?: string;
  alternativeMeans?: string;
  sourceUrl?: string;
}

interface TaskSectionProps {
  title: string;
  description: string;
  tasks: readonly HomeTask[];
  icon: React.ReactNode;
  screenName: string;
  emptyMessage: string;
}

export default function Home() {
  const router = useRouter();
  const { profile } = useProfile();

  const knownArrivalDate = knownDate(profile?.arrivalDate);
  const knownDepartureDate = knownDate(profile?.departureDate);
  const phase = useMemo(
    () =>
      knownArrivalDate && knownDepartureDate
        ? calcPhase({ arrivalDate: knownArrivalDate, departureDate: knownDepartureDate })
        : null,
    [knownArrivalDate, knownDepartureDate],
  );

  const tasks = useMemo(() => (profile ? buildHomeTasks(profile) : []), [profile]);
  const availableTasks = tasks.filter((task) => task.status === 'available');
  const blockedTasks = tasks.filter((task) => task.status === 'blocked');
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
              accessibilityState={{ disabled: false }}
            >
              <ShieldAlert size={22} color={palette.meok} strokeWidth={1.5} />
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <CurrentPhaseCard
            phase={phase}
            hasArrivalDate={!!knownArrivalDate}
            hasDepartureDate={!!knownDepartureDate}
          />
        </View>

        <View style={styles.section}>
          <RegistrationDeadlineCard arrivalDate={knownArrivalDate} />
        </View>

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
        />
        <TaskSection
          title="Blocked"
          description="The card explains what is holding each task."
          tasks={blockedTasks}
          icon={<LockKeyhole size={22} color={palette.dancheong} strokeWidth={1.6} />}
          screenName="home_blocked_tasks"
          emptyMessage="No tasks are blocked right now."
        />
        <TaskSection
          title="Not applicable"
          description="These tasks stay visible with their official basis."
          tasks={notApplicableTasks}
          icon={<CircleOff size={22} color={palette.ash} strokeWidth={1.6} />}
          screenName="home_not_applicable_tasks"
          emptyMessage="No tasks are marked not applicable."
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

function RegistrationDeadlineCard({ arrivalDate }: { arrivalDate: string | null }) {
  if (!arrivalDate) {
    return (
      <Card padded bg={palette.cloud} style={styles.deadlineCard}>
        <View style={styles.cardEyebrow}>
          <CalendarClock size={18} color={palette.hwanggeumDeep} strokeWidth={1.6} />
          <Text role="badge" color={palette.hwanggeumDeep}>
            Registration deadline
          </Text>
        </View>
        <Text role="h3">Deadline pending</Text>
        <Text role="body" color={palette.ash}>
          Add an arrival date to calculate the 90-day deadline.
        </Text>
      </Card>
    );
  }

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
            <TaskCard key={task.taskId} task={task} />
          ))}
        </View>
      )}
    </View>
  );
}

function TaskCard({ task }: { task: HomeTask }) {
  const isAvailable = task.status === 'available';
  const isNotApplicable = task.status === 'not_applicable';
  const accent = isAvailable ? palette.jade : isNotApplicable ? palette.ash : palette.dancheong;
  const background = isAvailable
    ? palette.hanji
    : isNotApplicable
      ? palette.cloud
      : palette.dancheongLight;
  const Icon = isAvailable ? CheckCircle2 : isNotApplicable ? CircleOff : LockKeyhole;
  const label = isAvailable ? 'AVAILABLE' : isNotApplicable ? 'NOT APPLICABLE' : 'BLOCKED';

  return (
    <Card
      padded
      bg={background}
      style={[styles.taskCard, { borderColor: isAvailable ? palette.hairline : accent }]}
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

      {task.sourceUrl ? (
        <View style={styles.sourceRow}>
          <Text role="xs" color={palette.ash}>
            Official basis
          </Text>
          <Text role="xs" color={palette.cheong} selectable>
            {task.sourceUrl}
          </Text>
        </View>
      ) : null}
    </Card>
  );
}

function buildHomeTasks(profile: UserProfile): HomeTask[] {
  const registration = evaluateResidenceRegistration(profile);
  const housing = evaluateHousingContract(profile.housingType, profile.contractHolder);
  const groupRegistration = evaluateGroupRegistration(profile);

  const registrationTask = taskFromVerdict(
    'residence-registration',
    'Residence registration',
    'Foreign resident registration assessment',
    registration,
  );

  const housingTask: HomeTask =
    registration.status === 'not_applicable'
      ? {
          taskId: 'housing-proof',
          title: 'Housing proof',
          summary: 'Documents for the residence registration process',
          status: 'not_applicable',
          reason: registration.reason,
          sourceUrl: registration.sourceUrl,
        }
      : registration.status !== 'applicable'
        ? {
            taskId: 'housing-proof',
            title: 'Housing proof',
            summary: 'Documents for the residence registration process',
            status: 'blocked',
            kind: 'sequential',
            reason: 'Complete the residence-registration assessment before preparing documents.',
          }
        : housing.status === 'applicable'
          ? {
              taskId: 'housing-proof',
              title: 'Housing proof',
              summary: 'Prepare documents for your housing and contract holder.',
              status: 'available',
            }
          : {
              taskId: 'housing-proof',
              title: 'Housing proof',
              summary: 'Prepare documents for your housing and contract holder.',
              status: 'blocked',
              kind: 'review',
              reason: housing.reason,
            };

  const groupTask = taskFromVerdict(
    'group-registration',
    'Group registration',
    'University-supported foreign resident registration',
    groupRegistration,
  );

  return [registrationTask, housingTask, groupTask];
}

function taskFromVerdict(
  taskId: string,
  title: string,
  summary: string,
  verdict: RuleVerdict,
): HomeTask {
  if (verdict.status === 'applicable') {
    return { taskId, title, summary, status: 'available' };
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
  };
}

function knownDate(value: string | null | undefined): string | null {
  return typeof value === 'string' && !isUnknownConditionValue(value) ? value : null;
}

function shouldShowDepartureLock(profile: UserProfile): boolean {
  return (
    profile.visaTypeOrStatus === 'D-2-8' &&
    profile.residenceCardStatus !== 'issued' &&
    profile.residenceCardStatus !== 'n_a'
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
  checklist: {
    gap: space[2],
  },
  checklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
  },
});
