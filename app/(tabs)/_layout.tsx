import { Tabs } from 'expo-router';
import { Compass, Layers, Heart, MoreHorizontal } from 'lucide-react-native';
import { palette } from '../../design-tokens';
import { useTheme } from '../../src/theme/ThemeProvider';
import { Text } from '../../src/components/ui';

export default function TabsLayout() {
  const theme = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.era.primary,
        tabBarInactiveTintColor: palette.ash,
        tabBarStyle: {
          backgroundColor: palette.hanji,
          borderTopColor: palette.hairline,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabel: ({ color, children }) => (
          <Text role="xs" color={color} weight="semibold">
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
      {/*
        DEC-024 put MEM-01 (the byeongpung and bucket-list product) out of scope
        for v2. The routes are kept — step 1 kept `sign-in` the same way rather
        than deleting legacy screens — but `href: null` takes them out of the
        tab bar so the shipped navigation is only the conditional journey.
      */}
      <Tabs.Screen
        name="byeongpung"
        options={{
          href: null,
          title: 'Byeongpung',
          tabBarIcon: ({ color, size }) => <Layers size={size} color={color} strokeWidth={1.5} />,
        }}
      />
      <Tabs.Screen
        name="wantto"
        options={{
          href: null,
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
