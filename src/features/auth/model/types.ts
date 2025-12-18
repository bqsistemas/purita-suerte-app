/**
 * User profile returned by authentication endpoints.
 */
export interface User {
    id: string;
    displayName: string;
    email: string;
    tenantId: string;
}

/**
 * Auth state managed by Zustand store.
 */
export interface AuthState {
    isSignedIn: boolean;
    user: User | null;
    token: string | null;
    isLoading: boolean;
    error: { code: string; message: string } | null;
}
