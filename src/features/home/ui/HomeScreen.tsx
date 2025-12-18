import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useAuthStore } from '~/features/auth';

/**
 * Home Screen: Post-login screen showing welcome message.
 * Displays "Hola mundo" and user profile info.
 * Includes a Sign Out button to return to login.
 */
export function HomeScreen(): React.ReactElement {
  const { user, setSignedOut } = useAuthStore();

  const handleSignOut = async (): Promise<void> => {
    await setSignedOut();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Welcome Message */}
        <Text style={styles.welcome}>Hola mundo</Text>

        {/* User Info */}
        {user && (
          <View style={styles.userInfo}>
            <Text style={styles.greeting}>
              Welcome, {user.displayName}!
            </Text>
            <Text style={styles.email}>{user.email}</Text>
            <Text style={styles.tenant}>Tenant: {user.tenantId}</Text>
          </View>
        )}

        {/* Sign Out Button */}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          accessibilityRole="button"
          accessibilityLabel="Sign out button"
          accessible
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcome: {
    fontSize: 48,
    fontWeight: '700',
    color: '#7e22ce',
    marginBottom: 32,
    textAlign: 'center',
  },
  userInfo: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 40,
    width: '100%',
    borderLeftWidth: 4,
    borderLeftColor: '#0ea5e9',
  },
  greeting: {
    fontSize: 18,
    fontWeight: '600',
    color: '#18181b',
    marginBottom: 8,
  },
  email: {
    fontSize: 14,
    color: '#71717a',
    marginBottom: 4,
  },
  tenant: {
    fontSize: 14,
    color: '#71717a',
  },
  signOutButton: {
    backgroundColor: '#f97316',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    minHeight: 44,
    justifyContent: 'center',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
});
