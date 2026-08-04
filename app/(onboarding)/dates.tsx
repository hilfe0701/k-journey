// Screen ID: ONB-07 — Arrival and departure dates.
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar } from 'react-native-calendars';
import { addDays, format, parseISO } from 'date-fns';

import { OnboardingStepShell, UNKNOWN_LABEL, useOnboardingStepGuard } from '../../src/components/onboarding/ConditionStep';
import { Text } from '../../src/components/ui';
import { palette, radius, semantic, space, typography } from '../../design-tokens';
import { UNKNOWN, type UnknownValue } from '../../src/lib/firebase';
import { updateUserProfile } from '../../src/lib/firebase';
import { setOnboardingProgress } from '../../src/lib/storage';
import { kstNow } from '../../src/lib/dates';
import { rescheduleAllNotifications, getPermissionState } from '../../src/lib/notifications';
import {
  NotificationPriming,
  shouldShowPriming,
} from '../../src/components/onboarding/NotificationPriming';
import { showOperationError, surfaceError } from '../../src/lib/errorAlert';
import { validateDates, DATE_ERROR_MESSAGES } from '../../src/lib/validation';
import { track } from '../../src/lib/posthog';
import { a11yState } from '../../src/lib/a11y';

type DateSelection = string | UnknownValue | null;
type DateField = 'programStart' | 'arrival' | 'departure';

export default function DatesScreen() {
  const router = useRouter();
  const profile = useOnboardingStepGuard('dates');
  const [pickingFor, setPickingFor] = useState<DateField>('programStart');
  const [programStartDate, setProgramStartDate] = useState<DateSelection>(null);
  const [arrivalDate, setArrivalDate] = useState<DateSelection>(null);
  const [departureDate, setDepartureDate] = useState<DateSelection>(null);
  const [saving, setSaving] = useState(false);
  const [primingVisible, setPrimingVisible] = useState(false);
  const profileProgramStartDate = profile?.programStartDate;
  const profileArrivalDate = profile?.arrivalDate;
  const profileDepartureDate = profile?.departureDate;

  useEffect(() => {
    if (!profile) return;
    setProgramStartDate(profileProgramStartDate ?? null);
    setArrivalDate(profileArrivalDate ?? null);
    setDepartureDate(profileDepartureDate ?? null);
    if (profileProgramStartDate) setPickingFor('programStart');
  }, [profile, profileArrivalDate, profileDepartureDate, profileProgramStartDate]);

  const today = format(kstNow(), 'yyyy-MM-dd');
  const selected = selectedDateFor(pickingFor, programStartDate, arrivalDate, departureDate);
  const selectedCalendarDate = isRealDate(selected) ? selected : today;
  const departureIsDate = isRealDate(departureDate);
  const minDate = pickingFor === 'departure' && isRealDate(arrivalDate) ? arrivalDate : undefined;
  const canContinue = !!programStartDate && !!arrivalDate && !!departureDate;

  function handleDayPress(day: { dateString: string }) {
    if (pickingFor === 'programStart') {
      setProgramStartDate(day.dateString);
      return;
    }
    if (pickingFor === 'arrival') {
      setArrivalDate(day.dateString);
      if (!departureIsDate || (isRealDate(departureDate) && departureDate < day.dateString)) {
        setDepartureDate(format(addDays(parseISO(day.dateString), 120), 'yyyy-MM-dd'));
      }
      setPickingFor('departure');
      return;
    }
    setDepartureDate(day.dateString);
  }

  function setUnknownForCurrentField() {
    if (pickingFor === 'programStart') setProgramStartDate(UNKNOWN);
    if (pickingFor === 'arrival') setArrivalDate(UNKNOWN);
    if (pickingFor === 'departure') setDepartureDate(UNKNOWN);
  }

  async function handleContinue() {
    if (!programStartDate || !arrivalDate || !departureDate) return;

    const dateError =
      isRealDate(arrivalDate) && isRealDate(departureDate)
        ? validateDates(arrivalDate, departureDate)
        : null;
    if (dateError) {
      surfaceError('unknown', {
        messageOverride: DATE_ERROR_MESSAGES[dateError],
        contextAction: 'check your dates',
      });
      return;
    }

    setSaving(true);
    try {
      await updateUserProfile({
        programStartDate,
        arrivalDate,
        departureDate,
      });
      setOnboardingProgress('era');
      track('onboarding_step_complete', { step: 'dates' });

      if (isRealDate(arrivalDate) && isRealDate(departureDate)) {
        if (await shouldShowPriming()) {
          setPrimingVisible(true);
          return;
        }
        if ((await getPermissionState()) === 'granted') {
          await rescheduleAllNotifications({ arrivalDate, departureDate });
        }
      }
      proceedToEra();
    } catch (error) {
      showOperationError('save your dates', error, { onPrimary: handleContinue });
    } finally {
      setSaving(false);
    }
  }

  async function handlePrimingClose(granted: boolean) {
    setPrimingVisible(false);
    try {
      if (granted && isRealDate(arrivalDate) && isRealDate(departureDate)) {
        await rescheduleAllNotifications({ arrivalDate, departureDate });
      } else if ((await getPermissionState()) === 'denied') {
        surfaceError('permission-notifications-denied');
      }
      proceedToEra();
    } catch (error) {
      showOperationError('schedule notifications', error);
      proceedToEra();
    }
  }

  function proceedToEra() {
    router.push('/(onboarding)/era');
  }

  const markedDates: Record<string, MarkedDate> = {};
  // `typeof === 'string'` also accepts UNKNOWN, which would key the calendar on
  // "unknown" and hand an Invalid Date to the range loop below — the loop then
  // silently marks nothing instead of failing loudly.
  if (isRealDate(arrivalDate)) {
    markedDates[arrivalDate] = { startingDay: true, color: palette.ink, textColor: palette.onPrimary };
  }
  if (isRealDate(departureDate)) {
    markedDates[departureDate] = { endingDay: true, color: palette.ink, textColor: palette.onPrimary };
  }
  if (isRealDate(arrivalDate) && isRealDate(departureDate) && arrivalDate !== departureDate) {
    let cursor = addDays(parseISO(arrivalDate), 1);
    const end = parseISO(departureDate);
    while (cursor < end) {
      const key = format(cursor, 'yyyy-MM-dd');
      if (!markedDates[key]) markedDates[key] = { color: palette.surfaceSoft, textColor: palette.ink };
      cursor = addDays(cursor, 1);
    }
  }

  return (
    <>
      <OnboardingStepShell
        stepNumber={7}
        title="When will you be in Korea?"
        description="Add the program start, arrival, and departure dates. You can mark any date unknown."
        canContinue={canContinue}
        onContinue={handleContinue}
        saving={saving}
      >
        <View style={styles.content}>
          <View style={styles.dateRow}>
            <DateChip
              label="Program start"
              value={programStartDate}
              active={pickingFor === 'programStart'}
              color={palette.ink}
              onPress={() => setPickingFor('programStart')}
            />
            <DateChip
              label="Arrival"
              value={arrivalDate}
              active={pickingFor === 'arrival'}
              color={palette.ink}
              onPress={() => setPickingFor('arrival')}
            />
          </View>
          <DateChip
            label="Departure"
            value={departureDate}
            active={pickingFor === 'departure'}
            color={palette.ink}
            onPress={() => setPickingFor('departure')}
          />

          <Pressable
            onPress={setUnknownForCurrentField}
            hitSlop={8}
            accessibilityRole="radio"
            accessibilityLabel={`${fieldLabel(pickingFor)} — ${UNKNOWN_LABEL}`}
            {...a11yState({ selected: selected === UNKNOWN, disabled: false })}
            style={[styles.unknownButton, selected === UNKNOWN ? styles.unknownButtonSelected : null]}
          >
            <Text role="sm" weight="semibold" color={selected === UNKNOWN ? palette.ink : palette.muted}>
              {`${fieldLabel(pickingFor)} — ${UNKNOWN_LABEL}`}
            </Text>
          </Pressable>

          <View style={styles.calendarWrap}>
            <Calendar
              current={selectedCalendarDate}
              minDate={minDate}
              markedDates={markedDates}
              markingType="period"
              onDayPress={handleDayPress}
              // Airbnb's date picker: ink-filled selected days over a
              // surface-soft range lozenge, day numbers in body-sm, and today
              // marked in Rausch. One family throughout, as everywhere else.
              theme={{
                calendarBackground: palette.canvas,
                monthTextColor: palette.ink,
                textMonthFontWeight: '600',
                textMonthFontFamily: typography.family.ui,
                dayTextColor: palette.ink,
                todayTextColor: palette.rausch,
                textDayFontWeight: '400',
                textDayFontFamily: typography.family.ui,
                textDayHeaderFontFamily: typography.family.ui,
                textDayFontSize: typography.size.sm,
                selectedDayBackgroundColor: palette.ink,
                selectedDayTextColor: palette.onPrimary,
                textDisabledColor: palette.mutedSoft,
                arrowColor: palette.ink,
                textSectionTitleColor: palette.muted,
              }}
            />
          </View>
          {/*
            UNKNOWN is itself a string, so a `typeof === 'string'` guard let it through
            to parseISO and format threw `RangeError: Invalid time value`, taking the
            whole screen down. Marking a date unknown is an allowed answer here.
          */}
          {isRealDate(programStartDate) && isRealDate(arrivalDate) && isRealDate(departureDate) ? (
            <Text role="sm" color={palette.ash}>
              {`${format(parseISO(programStartDate), 'MMM d, yyyy')} · ${format(parseISO(arrivalDate), 'MMM d, yyyy')} → ${format(parseISO(departureDate), 'MMM d, yyyy')}`}
            </Text>
          ) : null}
        </View>
      </OnboardingStepShell>
      <NotificationPriming visible={primingVisible} onClose={handlePrimingClose} />
    </>
  );
}

function selectedDateFor(
  field: DateField,
  programStartDate: DateSelection,
  arrivalDate: DateSelection,
  departureDate: DateSelection,
): DateSelection {
  if (field === 'programStart') return programStartDate;
  if (field === 'arrival') return arrivalDate;
  return departureDate;
}

function fieldLabel(field: DateField): string {
  if (field === 'programStart') return 'Program start';
  if (field === 'arrival') return 'Arrival';
  return 'Departure';
}

interface MarkedDate {
  startingDay?: boolean;
  endingDay?: boolean;
  color: string;
  textColor: string;
}

function DateChip({
  label,
  value,
  active,
  color,
  onPress,
}: {
  label: string;
  value: DateSelection;
  active: boolean;
  color: string;
  onPress: () => void;
}) {
  const valueLabel = value === UNKNOWN ? UNKNOWN_LABEL : value ? format(parseISO(value), 'MMM d, yyyy') : 'Pick a date';
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="radio"
      accessibilityLabel={`${label} — ${valueLabel}`}
      {...a11yState({ selected: active, disabled: false })}
      style={({ pressed }) => [
        styles.dateChip,
        {
          borderColor: active ? color : palette.hairline,
          borderWidth: active ? 2 : 1,
          backgroundColor: pressed ? palette.cloud : palette.hanji,
        },
      ]}
    >
      <Text role="xs" color={palette.ash} weight="semibold">
        {label}
      </Text>
      <Text role="h4" color={value ? palette.meok : palette.stone}>
        {valueLabel}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { gap: space[3], marginTop: space[5] },
  dateRow: { flexDirection: 'row', gap: space[3] },
  dateChip: {
    flex: 1,
    minHeight: 68,
    padding: space[3],
    borderRadius: radius.card,
    gap: space[1],
  },
  unknownButton: {
    minHeight: 48,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: palette.hairline,
    paddingHorizontal: space[3],
    alignItems: 'center',
    justifyContent: 'center',
  },
  unknownButtonSelected: { borderColor: palette.ink, borderWidth: 2 },
  calendarWrap: {
    borderRadius: radius.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: semantic.border.hairline,
  },
});

// A date the calendar actually produced, as opposed to null or the UNKNOWN marker.
// Only these are safe to hand to parseISO/format.
function isRealDate(value: string | null | undefined): value is string {
  return typeof value === 'string' && value !== UNKNOWN && value.length > 0;
}
