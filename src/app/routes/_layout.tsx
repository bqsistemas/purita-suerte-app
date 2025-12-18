import React from 'react';
import { Stack } from 'expo-router';
import { useAuthStore } from '~/features/auth';

/**
 * Root layout for Expo Router.
 * Manages conditional rendering of Auth vs App stacks.
 */
export function RootLayout() {
  const { isSignedIn, isLoading } = useAuthStore();

  // Restore session on app start
  React.useEffect(() => {
    useAuthStore.getState().restoreSession();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {isLoading ? (
        <Stack.Screen name="splash" options={{ animationEnabled: false }} />
      ) : isSignedIn ? (
        <Stack.Screen name="(app)" options={{ animationEnabled: false }} />
      ) : (
        <Stack.Screen name="(auth)" options={{ animationEnabled: false }} />
      )}
    </Stack>
  );
}

export default RootLayout;
