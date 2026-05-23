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
