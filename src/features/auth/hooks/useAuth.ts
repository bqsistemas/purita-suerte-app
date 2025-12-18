import { useCallback } from 'react';
import { useAuthStore } from '../model/authStore';
import { mockLogin, LoginRequestSchema } from '../api/contracts';

/**
 * Custom hook for authentication logic.
 * Handles login with validation and error handling.
 */
export function useAuth(): {
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    isLoading: boolean;
    error: { code: string; message: string } | null;
} {
    const authStore = useAuthStore();

    const signIn = useCallback(
        async (email: string, password: string) => {
            authStore.setLoading(true);
            authStore.setError(null);

            try {
                // Validate input
                const result = LoginRequestSchema.safeParse({ email, password });
                if (!result.success) {
                    const fieldErrors = result.error.flatten().fieldErrors;
                    const firstError = Object.values(fieldErrors)[0]?.[0];
                    authStore.setError({
                        code: 'VALIDATION_ERROR',
                        message: firstError || 'Please fill in all required fields',
                    });
                    authStore.setLoading(false);
                    return;
                }

                // Call mock login (replace with apiCall(async () => apiClient.post(...)) in production)
                const loginResult = await mockLogin({ email, password });

                if (!loginResult.success || !loginResult.data) {
                    authStore.setError({
                        code: loginResult.error?.code || 'LOGIN_FAILED',
                        message: loginResult.error?.message || 'Sign in failed. Please try again.',
                    });
                    authStore.setLoading(false);
                    return;
                }

                // Store token and update state
                await authStore.setSignedIn(loginResult.data.user, loginResult.data.token);
                authStore.setLoading(false);
            } catch (error) {
                authStore.setError({
                    code: 'UNKNOWN_ERROR',
                    message: error.message,
                });
                authStore.setLoading(false);
            }
        },
        [authStore]
    );

    const signOut = useCallback(async () => {
        await authStore.setSignedOut();
    }, [authStore]);

    return {
        signIn,
        signOut,
        isLoading: authStore.isLoading,
        error: authStore.error,
    };
}
