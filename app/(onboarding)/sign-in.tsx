// LEGACY: Sign-in is unreachable because authentication was removed in DEC-001.
import { Redirect } from 'expo-router';

export default function LegacySignIn() {
  return <Redirect href="/(onboarding)/profile" />;
}
