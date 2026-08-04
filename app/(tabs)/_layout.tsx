import { Tabs } from 'expo-router';
import { Compass, Heart, Layers, MoreHorizontal } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette } from '../../design-tokens';
import { Text } from '../../src/components/ui';

/** Bar height above the home indicator. Keeps each tab target at 44pt+. */
const TAB_BAR_CONTENT_HEIGHT = 64;

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  // `tabBarStyle` is merged last inside BottomTabBar, after its own
  // `paddingBottom: insets.bottom`. A literal height/paddingBottom therefore
  // *replaces* the safe-area inset rather than adding to it, which pushed the
  // labels under the home indicator on notched devices. Fold the inset in here.
  return (
    <Tabs
      detachInactiveScreens
      screenOptions={{
        headerShown: false,
        // The product nav is one of the few places Airbnb spends Rausch: the
        // active tab burns brand, everything else stays muted on white.
        tabBarActiveTintColor: palette.rausch,
        tabBarInactiveTintColor: palette.muted,
        tabBarStyle: {
          backgroundColor: palette.canvas,
          borderTopColor: palette.hairline,
          borderTopWidth: 1,
          height: TAB_BAR_CONTENT_HEIGHT + insets.bottom,
          paddingBottom: 8 + insets.bottom,
          paddingTop: 6,
        },
        tabBarLabel: ({ color, children }) => (
          <Text role="micro" color={color} weight="medium">
            {children}
          </Text>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Journey',
          tabBarIcon: ({ color, size }) => <Compass size={size} color={color} strokeWidth={1.5} />,
        }}
      />
      <Tabs.Screen
        name="checklist"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="byeongpung"
        options={{
          title: 'Byeongpung',
          tabBarIcon: ({ color, size }) => <Layers size={size} color={color} strokeWidth={1.5} />,
        }}
      />
      <Tabs.Screen
        name="wantto"
        options={{
          title: 'Want to',
          tabBarIcon: ({ color, size }) => <Heart size={size} color={color} strokeWidth={1.5} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color, size }) => <MoreHorizontal size={size} color={color} strokeWidth={1.5} />,
        }}
      />
    </Tabs>
  );
}
