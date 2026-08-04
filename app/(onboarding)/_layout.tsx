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
      <Stack.Screen name="university" />
      <Stack.Screen name="program" />
      <Stack.Screen name="housing" />
      <Stack.Screen name="stay-length" />
      <Stack.Screen name="nationality" />
      <Stack.Screen name="dates" />
      <Stack.Screen name="era" />
    </Stack>
  );
}
