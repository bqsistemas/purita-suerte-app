import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '~/features/auth';
import { HomeScreen } from '~/features/home';
import { useAuthStore } from '~/features/auth';
import { AuthStackParamList, AppStackParamList } from './types';

const Stack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

/**
 * Auth Stack: Shown when user is not signed in.
 */
function AuthStackNavigator(): React.ReactElement {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
    </AuthStack.Navigator>
  );
}

/**
 * App Stack: Shown when user is signed in.
 */
function AppStackNavigator(): React.ReactElement {
  return (
    <AppStack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#7e22ce',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <AppStack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Purita Suerte',
        }}
      />
    </AppStack.Navigator>
  );
}

/**
 * Root Navigator: Conditionally renders Auth or App stack based on auth state.
 */
export function RootNavigator(): React.ReactElement {
  const { isSignedIn, isLoading } = useAuthStore();

  // Restore session on app start
  React.useEffect(() => {
    useAuthStore.getState().restoreSession();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoading ? (
          <Stack.Screen name="Splash" component={() => null} />
        ) : isSignedIn ? (
          <Stack.Screen name="App" component={AppStackNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthStackNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
