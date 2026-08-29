import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Switch,
  SectionList,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  AppState,
  Linking,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight, X, Check, Mail, ExternalLink } from 'lucide-react-native';
import { Calendar } from 'react-native-calendars';
import Constants from 'expo-constants';

import { Text, Button, IconButton, MIN_TARGET } from '../../src/components/ui';
import { palette, space, radius, semantic, elevation } from '../../design-tokens';
import { useProfile } from '../../src/hooks/useProfile';
import {
  UNKNOWN,
  updateUserProfile,
  type ContractHolder,
  type HousingType,
  type ResidenceCardStatus,
  type UserProfile,
} from '../../src/lib/firebase';
import { clearLocalJourneyData } from '../../src/lib/firebase';
import { UNIVERSITIES } from '../../src/data/universities';
import { ERA_LIST } from '../../src/theme/eras';
import { BYEONGPUNG_PANEL_IMAGES } from '../../src/components/byeongpung/motifs';
import { calcDatePhase } from '../../src/hooks/usePhase';
import {
  getPermissionState,
  rescheduleAllNotifications,
  type PermissionState,
} from '../../src/lib/notifications';
import { useNotificationPref, type NotificationPrefKey } from '../../src/state/useNotificationSettings';
import { showOperationError, surfaceError } from '../../src/lib/errorAlert';
import { validateDates, validateName } from '../../src/lib/validation';
import { emitError } from '../../src/lib/errors/host';
import { ERROR_CATALOG } from '../../src/lib/errors/catalog';
import { track } from '../../src/lib/posthog';
import { showAlert } from '../../src/lib/alert';
import { resetAhaMoment } from '../../src/components/onboarding/AhaMomentTour';
import {
  housingProfilePatch,
  knownProfileDate,
  selectUniversityId,
  universityProfilePatch,
} from '../../src/lib/profileCompat';
import { a11yState } from '../../src/lib/a11y';
import { SEOUL_DISTRICT_OPTIONS } from '../../src/data/admin';
import { formatKstDate, kstCalendarDate, kstNow } from '../../src/lib/dates';

type Section =
  | { key: 'notifications'; title: string; data: 'notifications'[] }
  | { key: 'era'; title: string; data: 'era'[] }
  | { key: 'profile'; title: string; data: 'profile'[] }
  | { key: 'data'; title: string; data: 'data'[] }
  | { key: 'about'; title: string; data: 'about'[] };

export default function SettingsScreen() {
  const router = useRouter();
  const { profile } = useProfile();
  const [permission, setPermission] = useState<PermissionState | null>(null);
  const [openSheet, setOpenSheet] = useState<
    | 'name'
    | 'university'
    | 'housing'
    | 'residenceDistrict'
    | 'contractHolder'
    | 'residenceCard'
    | 'arrival'
    | 'departure'
    | 'era'
    | null
  >(null);

  useEffect(() => {
    let mounted = true;
    getPermissionState().then((s) => mounted && setPermission(s));
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') getPermissionState().then((s) => mounted && setPermission(s));
    });
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  const sections: Section[] = useMemo(
    () => [
      { key: 'notifications', title: 'Notifications', data: ['notifications'] },
      { key: 'era', title: 'Era theme', data: ['era'] },
      { key: 'profile', title: 'Your profile', data: ['profile'] },
      { key: 'data', title: 'Your data', data: ['data'] },
      { key: 'about', title: 'About', data: ['about'] },
    ],
    [],
  );

  function trackOpen(category: Section['key']) {
    track('settings_open', { category });
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <IconButton
          icon={ChevronLeft}
          size={24}
          accessibilityLabel="Back"
          onPress={() => router.back()}
        />
        <Text role="h3">Settings</Text>
        <View style={{ width: MIN_TARGET }} />
      </View>

      <SectionList<string, Section>
        sections={sections}
        keyExtractor={(item) => item}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.body}
        renderSectionHeader={({ section }) => (
          <Text
            role="badge"
            color={palette.ash}
            style={styles.sectionHeader}
            accessibilityLabel={`${section.title} section`}
          >
            {section.title.toUpperCase()}
          </Text>
        )}
        renderItem={({ section }) => {
          switch (section.key) {
            case 'notifications':
              return (
                <NotificationsSection
                  permission={permission}
                  onPermissionOpen={() => Linking.openSettings().catch(() => {})}
                  onMount={() => trackOpen('notifications')}
                />
              );
            case 'era':
              return (
                <View style={styles.card}>
                  <SettingsRow
                    label="Era"
                    valueText={profile?.era ? eraLabel(profile.era) : '—'}
                    onPress={() => {
                      trackOpen('era');
                      setOpenSheet('era');
                    }}
                  />
                </View>
              );
            case 'profile':
              return (
                <View style={styles.card}>
                  <SettingsRow
                    label="Name"
                    valueText={profile?.displayName ?? '—'}
                    onPress={() => {
                      trackOpen('profile');
                      setOpenSheet('name');
                    }}
                  />
                  <SettingsRow
                    label="University"
                    valueText={uniLabel(selectUniversityId(profile))}
                    onPress={() => {
                      trackOpen('profile');
                      setOpenSheet('university');
                    }}
                  />
                  <SettingsRow
                    label="Housing"
                    valueText={housingLabel(
                      profile?.housingType && profile.housingType !== UNKNOWN
                        ? profile.housingType
                        : profile?.housing,
                    )}
                    onPress={() => {
                      trackOpen('profile');
                      setOpenSheet('housing');
                    }}
                  />
                  <SettingsRow
                    label="Contract holder"
                    valueText={contractHolderLabel(profile?.contractHolder)}
                    onPress={() => {
                      trackOpen('profile');
                      setOpenSheet('contractHolder');
                    }}
                  />
                  <SettingsRow
                    label="Registered district"
                    valueText={profile?.residenceDistrict ?? 'Unknown / not sure'}
                    onPress={() => {
                      trackOpen('profile');
                      setOpenSheet('residenceDistrict');
                    }}
                  />
                  <SettingsRow
                    label="Residence card"
                    valueText={residenceCardLabel(profile?.residenceCardStatus)}
                    onPress={() => {
                      trackOpen('profile');
                      setOpenSheet('residenceCard');
                    }}
                  />
                  <SettingsRow
                    label="Arrival date"
                    valueText={formatDate(profile?.arrivalDate)}
                    onPress={() => {
                      trackOpen('profile');
                      setOpenSheet('arrival');
                    }}
                  />
                  <SettingsRow
                    label="Departure date"
                    valueText={formatDate(profile?.departureDate)}
                    onPress={() => {
                      trackOpen('profile');
                      setOpenSheet('departure');
                    }}
                    isLast
                  />
                </View>
              );
            case 'data':
              // SET-05 · REQ-SFR-012: no account exists, so the export is the
              // only way a user carries anything off this device.
              return (
                <View style={styles.card}>
                  <SettingsRow
                    label="Export your data"
                    valueText="Journey data as readable text"
                    onPress={() => {
                      trackOpen('data');
                      router.push('/settings/export' as never);
                    }}
                  />
                  <SettingsRow
                    label="Delete all local data"
                    valueText="Cannot be undone"
                    destructive
                    isLast
                    onPress={() => {
                      showAlert(
                        'Delete this journey?',
                        'This permanently removes profile answers, task progress, cultural missions, Want-to lists, and byeongpung progress from this device. Export first if you need a readable copy.',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Delete everything',
                            style: 'destructive',
                            onPress: () => {
                              clearLocalJourneyData();
                              resetAhaMoment();
                              router.replace('/(onboarding)/university' as never);
                            },
                          },
                        ],
                      );
                    }}
                  />
                </View>
              );
            case 'about':
              return <AboutSection onMount={() => trackOpen('about')} />;
            default:
              return null;
          }
        }}
      />

      {/* Name edit sheet */}
      <NameSheet
        visible={openSheet === 'name'}
        initial={profile?.displayName ?? ''}
        onClose={() => setOpenSheet(null)}
        onSave={async (next) => {
          try {
            await updateUserProfile({ displayName: next });
            track('profile_field_change', { field: 'displayName' });
            setOpenSheet(null);
            surfaceError('profile-updated');
          } catch (err) {
            showOperationError('save your name', err);
          }
        }}
      />

      {/* University picker */}
      <PickerSheet
        visible={openSheet === 'university'}
        title="Pick your university"
        options={UNIVERSITIES.map((u) => ({ value: u.id, label: u.shortName, hint: u.campusArea }))}
        selected={selectUniversityId(profile)}
        onClose={() => setOpenSheet(null)}
        onSelect={async (value) => {
          try {
            await updateUserProfile(universityProfilePatch(value));
            track('profile_field_change', { field: 'university' });
            setOpenSheet(null);
            surfaceError('profile-updated');
          } catch (err) {
            showOperationError('save your university', err);
          }
        }}
      />

      {/* Housing picker */}
      <PickerSheet
        visible={openSheet === 'housing'}
        title="Pick your housing"
        options={[
          { value: 'dormitory', label: 'Dormitory', hint: 'On-campus residence' },
          { value: 'own_lease', label: 'Private lease', hint: 'You hold the housing lease' },
          { value: 'third_party_lease', label: 'Shared housing', hint: 'Someone else holds the lease' },
          { value: 'registered_business', label: 'Business accommodation', hint: 'A registered stay provider' },
        ]}
        selected={
          profile?.housingType && profile.housingType !== UNKNOWN
            ? profile.housingType
            : profile?.housing ?? null
        }
        onClose={() => setOpenSheet(null)}
        onSelect={async (value) => {
          try {
            const housingType = value as HousingType;
            await updateUserProfile({
              ...housingProfilePatch(housingType),
              ...(housingType !== profile?.housingType ? { contractHolder: UNKNOWN } : {}),
            });
            track('profile_field_change', { field: 'housing' });
            setOpenSheet(null);
            surfaceError('profile-updated');
          } catch (err) {
            showOperationError('save your housing', err);
          }
        }}
      />

      {/* Contract-holder picker */}
      <PickerSheet
        visible={openSheet === 'contractHolder'}
        title="Who holds the housing contract?"
        options={[
          { value: 'self', label: 'I hold it' },
          { value: 'third_party', label: 'Someone else or a company' },
          { value: 'none', label: 'There is no contract' },
          { value: 'undecided', label: 'Not decided yet' },
          { value: 'n_a', label: 'Not applicable' },
          { value: UNKNOWN, label: 'Unknown / not sure' },
        ]}
        selected={profile?.contractHolder ?? UNKNOWN}
        onClose={() => setOpenSheet(null)}
        onSelect={async (value) => {
          try {
            await updateUserProfile({ contractHolder: value as ContractHolder });
            track('profile_field_change', { field: 'contractHolder' });
            setOpenSheet(null);
            surfaceError('profile-updated');
          } catch (err) {
            showOperationError('save your contract holder', err);
          }
        }}
      />

      <PickerSheet
        visible={openSheet === 'residenceDistrict'}
        title="Registered residence district"
        options={[
          { value: UNKNOWN, label: 'Unknown / outside Seoul', hint: 'Confirm the responsible office with 1345' },
          ...SEOUL_DISTRICT_OPTIONS.map((district) => ({ value: district, label: district })),
        ]}
        selected={profile?.residenceDistrict ?? UNKNOWN}
        onClose={() => setOpenSheet(null)}
        onSelect={async (value) => {
          try {
            await updateUserProfile({ residenceDistrict: value === UNKNOWN ? null : value });
            track('profile_field_change', { field: 'residenceDistrict' });
            setOpenSheet(null);
            surfaceError('profile-updated');
          } catch (err) {
            showOperationError('save your registered district', err);
          }
        }}
      />

      <PickerSheet
        visible={openSheet === 'residenceCard'}
        title="Residence card status"
        options={[
          { value: 'not_started', label: 'Not started' },
          { value: 'booked', label: 'Appointment booked' },
          { value: 'submitted', label: 'Application submitted' },
          { value: 'issued', label: 'Card issued' },
          { value: 'rejected', label: 'Rejected or needs action' },
          { value: 'n_a', label: 'Not applicable' },
          { value: UNKNOWN, label: 'Unknown / not sure' },
        ]}
        selected={profile?.residenceCardStatus ?? UNKNOWN}
        onClose={() => setOpenSheet(null)}
        onSelect={async (value) => {
          try {
            await updateUserProfile({ residenceCardStatus: value as ResidenceCardStatus });
            track('profile_field_change', { field: 'residenceCardStatus' });
            setOpenSheet(null);
            surfaceError('profile-updated');
          } catch (err) {
            showOperationError('save your residence card status', err);
          }
        }}
      />

      {/* Arrival date */}
      <DateSheet
        visible={openSheet === 'arrival'}
        kind="arrival"
        profile={profile}
        onClose={() => setOpenSheet(null)}
        onSave={(next) => handleDateSave(profile, 'arrival', next, setOpenSheet)}
      />

      {/* Departure date */}
      <DateSheet
        visible={openSheet === 'departure'}
        kind="departure"
        profile={profile}
        onClose={() => setOpenSheet(null)}
        onSave={(next) => handleDateSave(profile, 'departure', next, setOpenSheet)}
      />

      {/* Era picker (uses existing onboarding route) */}
      <EraSheet
        visible={openSheet === 'era'}
        currentEra={profile?.era ?? 'joseon'}
        onClose={() => setOpenSheet(null)}
        onSelect={async (value) => {
          try {
            await updateUserProfile({ era: value });
            track('era_switch', { from: profile?.era ?? null, to: value });
            setOpenSheet(null);
          } catch (err) {
            showOperationError('save your era', err);
          }
        }}
      />

    </SafeAreaView>
  );
}

async function handleDateSave(
  profile: UserProfile | null,
  kind: 'arrival' | 'departure',
  next: string,
  setOpenSheet: (v: null) => void,
) {
  const currentArrival = knownProfileDate(profile?.arrivalDate);
  const currentDeparture = knownProfileDate(profile?.departureDate);
  const arrival = kind === 'arrival' ? next : currentArrival;
  const departure = kind === 'departure' ? next : currentDeparture;
  if (arrival && departure) {
    const err = validateDates(arrival, departure);
    if (err) {
      const errorCode =
        err === 'arrival_after_departure'
          ? 'validation-arrival-after-departure'
          : 'validation-departure-too-soon';
      // Surface the inline-tier validation copy as a T1 toast (user is in a sheet).
      emitError({ ...ERROR_CATALOG[errorCode], tier: 'T1', autoDismissMs: 5000 });
      return;
    }
  }
  const phaseBefore = calcDatePhase({
    arrivalDate: currentArrival,
    departureDate: currentDeparture,
  });
  try {
    await updateUserProfile({
      [kind === 'arrival' ? 'arrivalDate' : 'departureDate']: next,
    });
    track('profile_field_change', { field: kind === 'arrival' ? 'arrivalDate' : 'departureDate' });
    setOpenSheet(null);
    if (arrival && departure) {
      // rescheduleAllNotifications records its own failures and never throws.
      await rescheduleAllNotifications({ arrivalDate: arrival, departureDate: departure });
      surfaceError('dates-updated');
      // PRD §4.7 — if the new dates move the user to an earlier phase, follow
      // the toast with a modal so the phase shift is not a silent surprise.
      const phaseAfter = calcDatePhase({ arrivalDate: arrival, departureDate: departure });
      if (phaseAfter < phaseBefore) {
        surfaceError('phase-changed', {
          messageOverride: `Your new dates put you in Phase ${phaseAfter}. Existing missions stay completed.`,
        });
      }
    }
  } catch (err) {
    showOperationError(`save your ${kind} date`, err);
  }
}

function eraLabel(era: string): string {
  const found = ERA_LIST.find((e) => e.key === era);
  return found ? `${found.nameEn} (${found.nameKo})` : era;
}

function uniLabel(id: string | null | undefined): string {
  if (!id) return '—';
  const found = UNIVERSITIES.find((u) => u.id === id);
  return found ? found.shortName : id;
}

function housingLabel(h: string | null | undefined): string {
  if (h === 'dormitory') return 'Dormitory';
  if (h === 'own_lease') return 'Private lease';
  if (h === 'third_party_lease') return 'Shared housing';
  if (h === 'registered_business') return 'Business accommodation';
  if (h === 'off-campus') return 'Off-campus';
  return '—';
}

function contractHolderLabel(holder: string | null | undefined): string {
  if (holder === 'self') return 'You';
  if (holder === 'third_party') return 'Someone else or a company';
  if (holder === 'none') return 'No contract';
  if (holder === 'undecided') return 'Not decided';
  if (holder === 'n_a') return 'Not applicable';
  return '—';
}

function residenceCardLabel(status: string | null | undefined): string {
  if (status === 'not_started') return 'Not started';
  if (status === 'booked') return 'Appointment booked';
  if (status === 'submitted') return 'Submitted';
  if (status === 'issued') return 'Issued';
  if (status === 'rejected') return 'Needs action';
  if (status === 'n_a') return 'Not applicable';
  return 'Unknown / not sure';
}

function formatDate(iso: string | null | undefined): string {
  if (!iso || iso === UNKNOWN) return '—';
  try {
    return formatKstDate(iso);
  } catch {
    return iso;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Reusable row + section components
// ─────────────────────────────────────────────────────────────────────────────

function SettingsRow({
  label,
  valueText,
  onPress,
  destructive,
  readOnly,
  isLast,
  right,
}: {
  label: string;
  valueText?: string;
  onPress?: () => void;
  destructive?: boolean;
  readOnly?: boolean;
  isLast?: boolean;
  right?: React.ReactNode;
}) {
  const labelColor = destructive ? palette.error : palette.ink;
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress || readOnly}
      accessibilityRole={readOnly ? 'text' : 'button'}
      accessibilityLabel={`${label}${valueText ? `, ${valueText}` : ''}${destructive ? ', destructive' : ''}`}
      style={({ pressed }) => [
        styles.row,
        !isLast ? styles.rowDivider : null,
        { backgroundColor: pressed && onPress ? palette.cloud : palette.hanji },
      ]}
    >
      <Text role="body" color={labelColor} style={{ flex: 1 }}>
        {label}
      </Text>
      {valueText ? (
        <Text role="sm" color={palette.ash} numberOfLines={1} style={{ maxWidth: 180, textAlign: 'right' }}>
          {valueText}
        </Text>
      ) : null}
      {right ? <View style={{ marginLeft: space[2] }}>{right}</View> : null}
      {onPress && !readOnly ? (
        <ChevronRight size={18} color={palette.stone} style={{ marginLeft: space[2] }} />
      ) : null}
    </Pressable>
  );
}

function NotificationsSection({
  permission,
  onPermissionOpen,
  onMount,
}: {
  permission: PermissionState | null;
  onPermissionOpen: () => void;
  onMount: () => void;
}) {
  useEffect(() => onMount(), [onMount]);

  const disabled = permission !== 'granted';

  return (
    <View style={styles.card}>
      <ToggleRow code="dDay30" label="D-30 reminder" disabled={disabled} />
      <ToggleRow code="dDay14" label="D-14 reminder" disabled={disabled} />
      <ToggleRow code="dDay7" label="D-7 reminder" disabled={disabled} />
      <ToggleRow
        code="phaseTransitions"
        label="Phase change reminders"
        disabled={disabled}
      />
      <ToggleRow
        code="panelUnlocks"
        label="Panel unlock celebrations"
        disabled={disabled}
      />
      <View style={[styles.row, styles.rowDivider]}>
        <View style={{ flex: 1 }}>
          <Text role="body" color={palette.meok}>
            OS push permission
          </Text>
          <Text role="sm" color={palette.ash}>
            {permission === 'granted'
              ? 'On'
              : permission === 'denied'
                ? 'Off — open Settings to enable'
                : permission === 'undetermined'
                  ? 'Not yet asked'
                  : 'Checking…'}
          </Text>
        </View>
        {permission === 'denied' ? (
          <Pressable
            onPress={onPermissionOpen}
            accessibilityRole="button"
            accessibilityLabel="Open Settings"
            style={({ pressed }) => [
              styles.linkBtn,
              { opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text role="sm" weight="semibold" color={palette.hanji}>
              Open Settings
            </Text>
          </Pressable>
        ) : null}
      </View>
      {disabled ? (
        <View style={styles.disabledHint}>
          <Text role="sm" color={palette.ash} align="center">
            Turn on system notifications to use these.
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function ToggleRow({
  code,
  label,
  disabled,
}: {
  code: NotificationPrefKey;
  label: string;
  disabled: boolean;
}) {
  const [value, setValue] = useNotificationPref(code);
  const isOn = value && !disabled;

  function toggle(next: boolean) {
    setValue(next);
    track('notification_pref_change', { code, value: next });
  }

  // The `Switch` itself renders at 40×20 — under the 44pt minimum and impossible
  // to resize portably. The whole 56pt row is the target instead, and the switch
  // is left non-focusable so keyboard users get one stop, not two.
  return (
    <Pressable
      onPress={() => toggle(!isOn)}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityLabel={label}
      {...a11yState({ checked: isOn, disabled })}
      style={({ pressed }) => [
        styles.row,
        styles.rowDivider,
        pressed && !disabled ? { backgroundColor: semantic.bg.tertiary } : null,
      ]}
    >
      <Text role="body" color={disabled ? palette.stone : palette.meok} style={{ flex: 1 }}>
        {label}
      </Text>
      {/*
        Purely the indicator. `pointerEvents: none` stops a tap on the switch
        from firing both handlers (which would toggle twice and net zero), and
        the a11y props keep it out of the tree on every platform — native honours
        `accessibilityElementsHidden`/`importantForAccessibility`, web honours
        `aria-hidden`.
      */}
      <Switch
        value={isOn}
        disabled={disabled}
        trackColor={{ false: palette.hairline, true: palette.ink }}
        thumbColor={palette.hanji}
        style={{ pointerEvents: 'none' }}
        focusable={false}
        aria-hidden
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
      />
    </Pressable>
  );
}

function AboutSection({ onMount }: { onMount: () => void }) {
  useEffect(() => onMount(), [onMount]);
  const version =
    Constants.expoConfig?.version ?? Constants.manifest2?.extra?.expoClient?.version ?? '0.0.0';
  const runtimeVersion =
    Constants.expoConfig?.runtimeVersion?.toString?.() ?? null;

  return (
    <View style={styles.card}>
      <SettingsRow label="Version" valueText={version} readOnly />
      {__DEV__ && runtimeVersion ? (
        <SettingsRow label="Build" valueText={runtimeVersion} readOnly />
      ) : null}
      <SettingsRow
        label="Support"
        onPress={() => {
          Linking.openURL('mailto:support@kjourney.app?subject=K-Journey%20Support').catch(() => {
            surfaceError('unknown');
          });
        }}
        right={<Mail size={18} color={palette.ash} />}
      />
      <SettingsRow
        label="Privacy policy"
        onPress={() => {
          Linking.openURL('https://kjourney.app/privacy').catch(() => {
            surfaceError('unknown');
          });
        }}
        right={<ExternalLink size={18} color={palette.ash} />}
        isLast={!__DEV__}
      />
      {__DEV__ ? (
        <>
          <SettingsRow
            label="[Dev] Fresh onboarding"
            destructive
            onPress={() => {
              clearLocalJourneyData();
              resetAhaMoment();
            }}
            isLast
          />
        </>
      ) : null}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sheet components
// ─────────────────────────────────────────────────────────────────────────────

function NameSheet({
  visible,
  initial,
  onClose,
  onSave,
}: {
  visible: boolean;
  initial: string;
  onClose: () => void;
  onSave: (next: string) => Promise<void>;
}) {
  return (
    <SheetFrame visible={visible} title="Edit your name" onClose={onClose}>
      {visible ? <NameEditor key={initial} initial={initial} onSave={onSave} /> : null}
    </SheetFrame>
  );
}

function NameEditor({
  initial,
  onSave,
}: {
  initial: string;
  onSave: (next: string) => Promise<void>;
}) {
  const [text, setText] = useState(initial);
  const valid = validateName(text) === null;
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ gap: space[3] }}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Your name"
          placeholderTextColor={palette.stone}
          autoCapitalize="words"
          style={styles.input}
          accessibilityLabel="Your name"
        />
        <Button
          label="Save"
          fullWidth
          disabled={!valid}
          onPress={() => onSave(text.trim())}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

function PickerSheet({
  visible,
  title,
  options,
  selected,
  onClose,
  onSelect,
}: {
  visible: boolean;
  title: string;
  options: { value: string; label: string; hint?: string }[];
  selected: string | null;
  onClose: () => void;
  onSelect: (value: string) => void;
}) {
  return (
    <SheetFrame visible={visible} title={title} onClose={onClose}>
      <ScrollView style={{ maxHeight: 480 }}>
        <View style={{ gap: space[2] }}>
          {options.map((opt) => {
            const active = opt.value === selected;
            return (
              <Pressable
                key={opt.value}
                onPress={() => onSelect(opt.value)}
                accessibilityRole="button"
                accessibilityLabel={`${opt.label}${active ? ', selected' : ''}`}
                {...a11yState({ selected: active })}
                style={({ pressed }) => [
                  styles.pickerRow,
                  {
                    borderColor: active ? palette.ink : palette.hairline,
                    borderWidth: active ? 2 : 1,
                    backgroundColor: pressed ? palette.cloud : palette.hanji,
                  },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text role="body" weight="semibold">
                    {opt.label}
                  </Text>
                  {opt.hint ? (
                    <Text role="sm" color={palette.ash}>
                      {opt.hint}
                    </Text>
                  ) : null}
                </View>
                {active ? <Check size={20} color={palette.ink} /> : null}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SheetFrame>
  );
}

function DateSheet({
  visible,
  kind,
  profile,
  onClose,
  onSave,
}: {
  visible: boolean;
  kind: 'arrival' | 'departure';
  profile: UserProfile | null;
  onClose: () => void;
  onSave: (date: string) => Promise<void> | void;
}) {
  const initial = knownProfileDate(
    kind === 'arrival' ? profile?.arrivalDate : profile?.departureDate,
  );

  return (
    <SheetFrame
      visible={visible}
      title={kind === 'arrival' ? 'Edit arrival date' : 'Edit departure date'}
      onClose={onClose}
    >
      {visible ? (
        <DateEditor
          key={`${kind}:${initial ?? 'unknown'}`}
          kind={kind}
          profile={profile}
          initial={initial}
          onClose={onClose}
          onSave={onSave}
        />
      ) : null}
    </SheetFrame>
  );
}

function DateEditor({
  kind,
  profile,
  initial,
  onClose,
  onSave,
}: {
  kind: 'arrival' | 'departure';
  profile: UserProfile | null;
  initial: string | null;
  onClose: () => void;
  onSave: (date: string) => Promise<void> | void;
}) {
  const [selected, setSelected] = useState<string | null>(initial);

  const today = kstCalendarDate(kstNow());
  const minDate = kind === 'departure'
    ? knownProfileDate(profile?.arrivalDate) ?? today
    : today;

  return (
    <View style={{ gap: space[3] }}>
      <View style={styles.calendarWrap}>
        <Calendar
          current={selected ?? today}
          minDate={minDate}
          markedDates={selected ? { [selected]: { selected: true, selectedColor: palette.ink } } : {}}
          onDayPress={(d: { dateString: string }) => setSelected(d.dateString)}
          theme={{
            calendarBackground: palette.hanji,
            monthTextColor: palette.meok,
            textMonthFontWeight: '700',
            dayTextColor: palette.meok,
            todayTextColor: palette.dancheong,
            arrowColor: palette.meok,
            textSectionTitleColor: palette.ash,
          }}
        />
      </View>
      <View style={styles.confirmCard}>
        <Text role="body" weight="semibold">
          Update your journey dates?
        </Text>
        <Text role="sm" color={palette.ash}>
          Your phase, missions, and reminders will be recalculated.
        </Text>
      </View>
      <View style={{ flexDirection: 'row', gap: space[3] }}>
        <View style={{ flex: 1 }}>
          <Button label="Cancel" variant="secondary" fullWidth onPress={onClose} />
        </View>
        <View style={{ flex: 1 }}>
          <Button
            label="Update"
            fullWidth
            disabled={!selected || selected === initial}
            onPress={() => selected && onSave(selected)}
          />
        </View>
      </View>
    </View>
  );
}

function EraSheet({
  visible,
  currentEra,
  onClose,
  onSelect,
}: {
  visible: boolean;
  currentEra: 'joseon' | 'silla' | 'goryeo';
  onClose: () => void;
  onSelect: (value: 'joseon' | 'silla' | 'goryeo') => void;
}) {
  return (
    <SheetFrame visible={visible} title="Choose your era" onClose={onClose}>
      {visible ? (
        <EraPicker key={currentEra} currentEra={currentEra} onSelect={onSelect} />
      ) : null}
    </SheetFrame>
  );
}

function EraPicker({
  currentEra,
  onSelect,
}: {
  currentEra: 'joseon' | 'silla' | 'goryeo';
  onSelect: (value: 'joseon' | 'silla' | 'goryeo') => void;
}) {
  const [pending, setPending] = useState<'joseon' | 'silla' | 'goryeo'>(currentEra);

  return (
    <>
      <Text role="sm" color={palette.ash}>
        Your byeongpung swaps to the new theme. Your progress stays.
      </Text>
      <View style={{ gap: space[3], marginTop: space[3] }}>
        {ERA_LIST.map((era) => {
          const active = era.key === pending;
          return (
            <Pressable
              key={era.key}
              onPress={() => setPending(era.key)}
              accessibilityRole="button"
              accessibilityLabel={`${era.nameEn}${active ? ', selected' : ''}`}
              {...a11yState({ selected: active })}
              style={({ pressed }) => [
                styles.eraCard,
                {
                  borderColor: active ? era.primary : palette.hairline,
                  borderWidth: active ? 2 : 1,
                  backgroundColor: pressed ? palette.cloud : palette.hanji,
                },
                active ? elevation.s1 : null,
              ]}
            >
              <Image
                source={BYEONGPUNG_PANEL_IMAGES[era.key][0]}
                style={styles.eraSwatch}
                resizeMode="cover"
              />
              <View style={{ flex: 1 }}>
                <Text role="h4">{era.nameEn}</Text>
                <Text role="sm" color={palette.ash}>
                  {era.tagline}
                </Text>
              </View>
              {active ? <Check size={20} color={era.primary} /> : null}
            </Pressable>
          );
        })}
        <Button label="Use this era" fullWidth onPress={() => onSelect(pending)} />
      </View>
    </>
  );
}

function SheetFrame({
  visible,
  title,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.sheetBackdrop}>
        <SafeAreaView edges={['bottom']} style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text role="h4" style={{ flex: 1 }}>
              {title}
            </Text>
            <IconButton icon={X} accessibilityLabel="Close" onPress={onClose} />
          </View>
          <View style={styles.sheetBody}>{children}</View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.cloud },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space[5],
    paddingVertical: space[4],
    backgroundColor: palette.hanji,
    borderBottomWidth: 1,
    borderBottomColor: semantic.border.hairline,
  },
  body: {
    paddingBottom: space[12],
    paddingTop: space[3],
    gap: space[2],
  },
  sectionHeader: {
    paddingHorizontal: space[5],
    paddingTop: space[4],
    paddingBottom: space[2],
  },
  card: {
    marginHorizontal: space[4],
    borderRadius: radius.card,
    backgroundColor: palette.hanji,
    overflow: 'hidden',
  },
  row: {
    minHeight: 56,
    paddingHorizontal: space[4],
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: semantic.border.hairline,
  },
  linkBtn: {
    paddingHorizontal: space[3],
    paddingVertical: space[2],
    minHeight: MIN_TARGET,
    justifyContent: 'center',
    borderRadius: radius.sm,
    backgroundColor: palette.ink,
  },
  disabledHint: {
    paddingHorizontal: space[5],
    paddingVertical: space[3],
    backgroundColor: palette.cloud,
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: palette.meok + '8C',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: palette.hanji,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space[5],
    paddingVertical: space[4],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: semantic.border.hairline,
  },
  sheetBody: {
    paddingHorizontal: space[5],
    paddingTop: space[4],
    paddingBottom: space[4],
    gap: space[3],
  },
  input: {
    minHeight: 52,
    paddingHorizontal: space[4],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: semantic.border.hairline,
    backgroundColor: palette.hanji,
    color: palette.meok,
    fontSize: 16,
    fontWeight: '500',
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space[4],
    paddingVertical: space[3],
    borderRadius: radius.card,
    gap: space[3],
  },
  calendarWrap: {
    borderRadius: radius.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: palette.hairline,
  },
  confirmCard: {
    padding: space[3],
    backgroundColor: palette.cloud,
    borderRadius: radius.md,
    gap: 4,
  },
  eraCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    padding: space[3],
    borderRadius: radius.card,
  },
  eraSwatch: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.hairline,
    backgroundColor: palette.cloud,
  },
  cancelBtn: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    backgroundColor: palette.surfaceSoft,
  },
  confirmBtn: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
  },
});
