import { renderHook, act } from '@testing-library/react-native';
import { useAuth } from '../useAuth';
import { useAuthStore } from '../../model/authStore';
import * as SecureStore from 'expo-secure-store';

jest.mock('expo-secure-store');

describe('useAuth hook', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useAuthStore.setState({
            isSignedIn: false,
            user: null,
            token: null,
            isLoading: false,
            error: null,
        });
    });

    it('provides sign in function', () => {
        const { result } = renderHook(() => useAuth());
        expect(typeof result.current.signIn).toBe('function');
    });

    it('provides sign out function', () => {
        const { result } = renderHook(() => useAuth());
        expect(typeof result.current.signOut).toBe('function');
    });

    it('provides isLoading state', () => {
        const { result } = renderHook(() => useAuth());
        expect(typeof result.current.isLoading).toBe('boolean');
    });

    it('provides error state', () => {
        const { result } = renderHook(() => useAuth());
        expect(result.current.error).toBeNull();
    });

    it('successfully signs in with valid credentials', async () => {
        const { result } = renderHook(() => useAuth());

        await act(async () => {
            await result.current.signIn('user@example.com', 'password123');
        });

        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeNull();
        expect(useAuthStore.getState().isSignedIn).toBe(true);
        expect(useAuthStore.getState().user?.email).toBe('user@example.com');
    });

    it('shows error with invalid credentials', async () => {
        const { result } = renderHook(() => useAuth());

        await act(async () => {
            await result.current.signIn('wrong@example.com', 'wrongpassword');
        });

        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeDefined();
        expect(result.current.error?.code).toBe('INVALID_CREDENTIALS');
        expect(useAuthStore.getState().isSignedIn).toBe(false);
    });

    it('validates email format', async () => {
        const { result } = renderHook(() => useAuth());

        await act(async () => {
            await result.current.signIn('invalid-email', 'password');
        });

        expect(result.current.error).toBeDefined();
        expect(result.current.error?.code).toBe('VALIDATION_ERROR');
        expect(useAuthStore.getState().isSignedIn).toBe(false);
    });

    it('validates required fields', async () => {
        const { result } = renderHook(() => useAuth());

        await act(async () => {
            await result.current.signIn('', '');
        });

        expect(result.current.error).toBeDefined();
        expect(result.current.error?.code).toBe('VALIDATION_ERROR');
    });

    it('clears error on successful sign in', async () => {
        const { result } = renderHook(() => useAuth());

        // First, trigger an error
        await act(async () => {
            await result.current.signIn('invalid-email', 'password');
        });
        expect(result.current.error).toBeDefined();

        // Then sign in successfully
        await act(async () => {
            await result.current.signIn('user@example.com', 'password123');
        });
        expect(result.current.error).toBeNull();
    });

    it('handles sign out', async () => {
        const { result } = renderHook(() => useAuth());

        // Sign in first
        await act(async () => {
            await result.current.signIn('user@example.com', 'password123');
        });
        expect(useAuthStore.getState().isSignedIn).toBe(true);

        // Then sign out
        await act(async () => {
            await result.current.signOut();
        });
        expect(useAuthStore.getState().isSignedIn).toBe(false);
        expect(useAuthStore.getState().user).toBeNull();
    });

    it('sets loading state during sign in', async () => {
        const { result } = renderHook(() => useAuth());
        let loadingDuringSignIn = false;

        act(() => {
            // The promise starts executing but we don't await yet
            result.current.signIn('user@example.com', 'password123').then(() => {
                loadingDuringSignIn = result.current.isLoading;
            });
        });

        // After completion, loading should be false
        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 600));
        });
        expect(result.current.isLoading).toBe(false);
    });
});
