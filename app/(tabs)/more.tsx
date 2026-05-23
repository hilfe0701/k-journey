import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable, Linking, AppState } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ShieldAlert,
  Image as ImageIcon,
  ChevronRight,
  Building2,
  Bell,
  BellOff,
  Settings as SettingsIcon,
} from 'lucide-react-native';

import { Text } from '../../src/components/ui';
import { palette, space, radius } from '../../design-tokens';
import { useProfile } from '../../src/hooks/useProfile';
import { universityById } from '../../src/data/universities';
import { getPermissionState, PermissionState } from '../../src/lib/notifications';
import { NotificationPriming } from '../../src/components/onboarding/NotificationPriming';

export default function MoreTab() {
  const router = useRouter();
  const { profile } = useProfile();
  const uni = profile?.university ? universityById(profile.university) : null;
  const [notifState, setNotifState] = useState<PermissionState | null>(null);
  const [primingVisible, setPrimingVisible] = useState(false);

  useEffect(() => {
    let mounted = true;
    getPermissionState().then((s) => mounted && setNotifState(s));
    const sub = AppState.addEventListener('change', (state) => {
      // Re-check when user returns from Settings.
      if (state === 'active') getPermissionState().then((s) => mounted && setNotifState(s));
    });
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  function handleNotificationsPress() {
    if (notifState === 'undetermined') {
      // ADR-0029: the OS prompt only ever fires from behind the priming card.
      setPrimingVisible(true);
      return;
    }
    // Granted or denied: deep-link to system Settings so the user can toggle.
    Linking.openSettings();
  }

  async function handlePrimingClose(_granted: boolean) {
    setPrimingVisible(false);
    setNotifState(await getPermissionState());
  }

  const notifSublabel =
    notifState === 'granted'
      ? 'On — phase + D-Day reminders active'
      : notifState === 'denied'
        ? 'Off — tap to open Settings'
        : 'Tap to enable phase + D-Day reminders';

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: space[16] }}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text role="h1">{profile?.displayName ?? 'Traveler'}</Text>
              {uni ? (
                <Text role="body" color={palette.ash}>
                  {uni.shortName} · {profile?.housing === 'dormitory' ? 'Dormitory' : 'Off-campus'}
                </Text>
              ) : null}
            </View>
            <Pressable
              onPress={() => router.push('/settings' as never)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Open settings"
              style={({ pressed }) => [styles.gearBtn, { opacity: pressed ? 0.85 : 1 }]}
            >
              <SettingsIcon size={22} color={palette.meok} strokeWidth={1.5} />
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <MenuItem
            icon={<Building2 size={22} color={palette.cheong} strokeWidth={1.5} />}
            label="Campus guide"
            sublabel={
              uni
                ? `${uni.shortName} · ${profile?.housing === 'dormitory' ? 'Dorm rules + nearby' : 'Off-campus areas + nearby'}`
                : 'University-specific info'
            }
            onPress={() => router.push('/campus')}
          />
          <MenuItem
            icon={
              notifState === 'granted' ? (
                <Bell size={22} color={palette.dancheong} strokeWidth={1.5} />
              ) : (
                <BellOff size={22} color={palette.ash} strokeWidth={1.5} />
              )
            }
            label="Notifications"
            sublabel={notifSublabel}
            onPress={handleNotificationsPress}
          />
          <MenuItem
            icon={<ShieldAlert size={22} color={palette.dancheong} strokeWidth={1.5} />}
            label="Emergency guide"
            sublabel="Phones, hospitals, embassies"
            onPress={() => router.push('/emergency')}
          />
          <MenuItem
            icon={<ImageIcon size={22} color={palette.cheong} strokeWidth={1.5} />}
            label="Memory gallery"
            sublabel="Your byeongpung and memory timeline"
            onPress={() => router.push('/gallery')}
          />
        </View>
      </ScrollView>

      <NotificationPriming visible={primingVisible} onClose={handlePrimingClose} />
    </SafeAreaView>
  );
}

function MenuItem({
  icon,
  label,
  sublabel,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={sublabel}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: pressed ? palette.cloud : palette.hanji },
      ]}
    >
      <View style={styles.rowIcon}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text role="body" weight="semibold">
          {label}
        </Text>
        {sublabel ? (
          <Text role="sm" color={palette.ash}>
            {sublabel}
          </Text>
        ) : null}
      </View>
      <ChevronRight size={20} color={palette.stone} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.hanji },
  header: {
    paddingHorizontal: space[5],
    paddingTop: space[3],
    paddingBottom: space[5],
    gap: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
  },
  gearBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.cloud,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    paddingHorizontal: space[5],
    gap: space[2],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    padding: space[3],
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: palette.hairline,
  },
  rowIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.card,
    backgroundColor: palette.cloud,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
