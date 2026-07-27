import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Calendar } from 'react-native-calendars';
import { ChevronLeft } from 'lucide-react-native';
import { format, addDays } from 'date-fns';

import { Text, Button } from '../../src/components/ui';
import { palette, space, radius, semantic } from '../../design-tokens';
import { useProfile } from '../../src/hooks/useProfile';
import { updateUserProfile } from '../../src/lib/firebase';
import { rescheduleAllNotifications, getPermissionState } from '../../src/lib/notifications';
import {
  NotificationPriming,
  shouldShowPriming,
} from '../../src/components/onboarding/NotificationPriming';
import { showOperationError, surfaceError } from '../../src/lib/errorAlert';
import { validateDates, DATE_ERROR_MESSAGES } from '../../src/lib/validation';
import { track } from '../../src/lib/posthog';

export default function DatesScreen() {
  const router = useRouter();
  const { profile } = useProfile();
  const [pickingFor, setPickingFor] = useState<'arrival' | 'departure'>('arrival');
  const [arrivalDate, setArrivalDate] = useState<string | null>(null);
  const [departureDate, setDepartureDate] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [primingVisible, setPrimingVisible] = useState(false);
  const restoredRef = useRef(false);

  // §4.6 — if the user force-quit mid-onboarding after entering dates, restore
  // the prior input from the useProfile snapshot and tell them gently.
  useEffect(() => {
    if (restoredRef.current) return;
    if (profile?.arrivalDate && profile?.departureDate) {
      restoredRef.current = true;
      setArrivalDate(profile.arrivalDate);
      setDepartureDate(profile.departureDate);
      surfaceError('onboarding-resumed');
    }
  }, [profile?.arrivalDate, profile?.departureDate]);

  const today = format(new Date(), 'yyyy-MM-dd');
  // Arrival is unrestricted — students may find the app well before or after
  // landing, so any date in any year is selectable. Departure stays bounded
  // below by arrival (a departure can't precede an arrival).
  const minDate = pickingFor === 'arrival' ? undefined : arrivalDate ?? today;
  const selected = pickingFor === 'arrival' ? arrivalDate : departureDate;

  function handleDayPress(day: { dateString: string }) {
    if (pickingFor === 'arrival') {
      setArrivalDate(day.dateString);
      // Default departure to 4 months later (typical 1-semester exchange)
      if (!departureDate || departureDate < day.dateString) {
        setDepartureDate(format(addDays(new Date(day.dateString), 120), 'yyyy-MM-dd'));
      }
      setPickingFor('departure');
    } else {
      setDepartureDate(day.dateString);
    }
  }

  async function handleContinue() {
    if (!arrivalDate || !departureDate) return;
    const err = validateDates(arrivalDate, departureDate);
    if (err) {
      Alert.alert('Check your dates', DATE_ERROR_MESSAGES[err]);
      return;
    }
    setSaving(true);
    try {
      await updateUserProfile({ arrivalDate, departureDate });
      track('onboarding_step_complete', { step: 'dates' });

      // Push permission: the OS prompt only ever fires from behind the priming
      // card (ADR-0029). If priming is due, show it and let onClose continue
      // the flow; otherwise reschedule (if already granted) and move on.
      if (await shouldShowPriming()) {
        setPrimingVisible(true);
        return;
      }
      if ((await getPermissionState()) === 'granted') {
        await rescheduleAllNotifications({ arrivalDate, departureDate });
      }
      proceedToEra();
    } catch (e) {
      showOperationError('save your dates', e, { onPrimary: handleContinue });
    } finally {
      setSaving(false);
    }
  }

  async function handlePrimingClose(granted: boolean) {
    setPrimingVisible(false);
    try {
      if (granted && arrivalDate && departureDate) {
        await rescheduleAllNotifications({ arrivalDate, departureDate });
      } else if ((await getPermissionState()) === 'denied') {
        // §7.5 denied row — point the user to Settings without blocking onboarding.
        surfaceError('permission-notifications-denied');
      }
    } finally {
      proceedToEra();
    }
  }

  function proceedToEra() {
    router.push('/(onboarding)/era');
  }

  const canContinue = !!arrivalDate && !!departureDate;

  const markedDates: Record<string, any> = {};
  if (arrivalDate) {
    markedDates[arrivalDate] = {
      startingDay: true,
      color: palette.cheong,
      textColor: palette.hanji,
    };
  }
  if (departureDate) {
    markedDates[departureDate] = {
      endingDay: true,
      color: palette.dancheong,
      textColor: palette.hanji,
    };
  }
  if (arrivalDate && departureDate && arrivalDate !== departureDate) {
    let cursor = addDays(new Date(arrivalDate), 1);
    const end = new Date(departureDate);
    while (cursor < end) {
      const key = format(cursor, 'yyyy-MM-dd');
      if (!markedDates[key]) {
        markedDates[key] = { color: palette.cloud, textColor: palette.meok };
      }
      cursor = addDays(cursor, 1);
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
        >
          <ChevronLeft size={24} color={palette.meok} />
        </Pressable>
        <Text role="body" weight="semibold">
          When are you in Korea?
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <Text role="body" color={palette.ash}>
          We&apos;ll calculate your phases and D-Day from these.
        </Text>

        <View style={styles.dateRow}>
          <DateChip
            label="Arrival"
            value={arrivalDate}
            active={pickingFor === 'arrival'}
            color={palette.cheong}
            onPress={() => setPickingFor('arrival')}
          />
          <DateChip
            label="Departure"
            value={departureDate}
            active={pickingFor === 'departure'}
            color={palette.dancheong}
            onPress={() => setPickingFor('departure')}
          />
        </View>

        <View style={styles.calendarWrap}>
          <Calendar
            current={selected ?? today}
            minDate={minDate}
            markedDates={markedDates}
            markingType="period"
            onDayPress={handleDayPress}
            theme={{
              calendarBackground: palette.hanji,
              monthTextColor: palette.meok,
              textMonthFontWeight: '700',
              dayTextColor: palette.meok,
              todayTextColor: palette.dancheong,
              textDayFontWeight: '500',
              arrowColor: palette.meok,
              textSectionTitleColor: palette.ash,
            }}
          />
        </View>

        {arrivalDate && departureDate ? (
          <Text role="sm" color={palette.ash} style={{ marginTop: space[3] }}>
            {format(new Date(arrivalDate), 'MMM d, yyyy')} → {format(new Date(departureDate), 'MMM d, yyyy')}
          </Text>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label="Continue"
          onPress={handleContinue}
          disabled={!canContinue}
          loading={saving}
          fullWidth
        />
      </View>

      <NotificationPriming visible={primingVisible} onClose={handlePrimingClose} />
    </SafeAreaView>
  );
}

function DateChip({
  label,
  value,
  active,
  color,
  onPress,
}: {
  label: string;
  value: string | null;
  active: boolean;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          flex: 1,
          padding: space[3],
          borderRadius: radius.card,
          borderWidth: active ? 2 : 1,
          borderColor: active ? color : palette.hairline,
          backgroundColor: pressed ? palette.cloud : palette.hanji,
        },
      ]}
    >
      <Text role="xs" color={palette.ash} weight="semibold">
        {label}
      </Text>
      <Text role="h4" color={value ? palette.meok : palette.stone}>
        {value ? format(new Date(value), 'MMM d, yyyy') : 'Pick a date'}
      </Text>
    </Pressable>
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
    gap: space[4],
  },
  dateRow: {
    flexDirection: 'row',
    gap: space[3],
    marginTop: space[2],
  },
  calendarWrap: {
    borderRadius: radius.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: palette.hairline,
  },
  footer: {
    paddingHorizontal: space[5],
    paddingBottom: space[4],
    paddingTop: space[3],
    borderTopWidth: 1,
    borderTopColor: semantic.border.hairline,
  },
});
