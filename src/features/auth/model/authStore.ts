import { create } from 'zustand';
import { storeAuthToken, clearAuthToken, getAuthToken } from '~/shared/api/client';
import { User } from './types';
import { AuthState } from './types';

/**
 * Auth Store: manages authentication state (signed in/out, user, token, errors).
 * Uses Zustand for state management.
 */
export const useAuthStore = create<
    AuthState & {
        setSignedIn: (user: User, token: string) => Promise<void>;
        setSignedOut: () => Promise<void>;
        setLoading: (isLoading: boolean) => void;
        setError: (error: { code: string; message: string } | null) => void;
        restoreSession: () => Promise<void>;
    }
>(
    (set) => ({
        isSignedIn: false,
        user: null,
        token: null,
        isLoading: false,
        error: null,

        setSignedIn: async (user: User, token: string) => {
            await storeAuthToken(token);
            set({
                isSignedIn: true,
                user,
                token,
                error: null,
            });
        },

        setSignedOut: async () => {
            await clearAuthToken();
            set({
                isSignedIn: false,
                user: null,
                token: null,
                error: null,
            });
        },

        setLoading: (isLoading: boolean) => {
            set({ isLoading });
        },

        setError: (error: { code: string; message: string } | null) => {
            set({ error });
        },

        restoreSession: async () => {
            set({ isLoading: true });
            try {
                const token = await getAuthToken();
                if (token) {
                    // In production, verify token with backend; for MVP, assume valid
                    set({
                        isSignedIn: true,
                        token,
                        isLoading: false,
                    });
                } else {
                    set({ isLoading: false });
                }
            } catch (error) {
                set({ isLoading: false });
            }
        },
    })
);
