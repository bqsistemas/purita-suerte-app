import { NavigatorScreenParams } from '@react-navigation/native';

/**
 * Auth stack parameter list (signed out state).
 */
export type AuthStackParamList = {
    Login: undefined;
};

/**
 * App stack parameter list (signed in state).
 */
export type AppStackParamList = {
    Home: undefined;
};

/**
 * Root navigation parameter list.
 */
export type RootStackParamList = {
    Auth: NavigatorScreenParams<AuthStackParamList> | undefined;
    App: NavigatorScreenParams<AppStackParamList> | undefined;
};

/**
 * Navigation prop type helper for use with useNavigation hook.
 */
export type RootNavigationProp = any; // Defined per-stack; simplified for MVP
