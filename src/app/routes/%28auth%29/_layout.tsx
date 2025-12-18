import { Stack } from 'expo-router';

/**
 * Auth group layout - screens shown when not signed in.
 */
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
