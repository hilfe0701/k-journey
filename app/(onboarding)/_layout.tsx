import { Stack } from 'expo-router';
import { palette } from '../../design-tokens';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: palette.hanji },
      }}
    >
      <Stack.Screen name="splash" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="dates" />
      <Stack.Screen name="era" />
    </Stack>
  );
}
