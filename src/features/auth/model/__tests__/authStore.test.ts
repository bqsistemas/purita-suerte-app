import { renderHook, act } from '@testing-library/react-native';
import { useAuthStore } from '../authStore';
import * as SecureStore from 'expo-secure-store';

jest.mock('expo-secure-store');

// Mock SecureStore functions
const mockSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;
mockSecureStore.setItemAsync.mockResolvedValue(undefined);
mockSecureStore.getItemAsync.mockResolvedValue(null);
mockSecureStore.deleteItemAsync.mockResolvedValue(undefined);

describe('authStore', () => {
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

    it('initializes with unsigned-out state', () => {
        const { result } = renderHook(() => useAuthStore());
        expect(result.current.isSignedIn).toBe(false);
        expect(result.current.user).toBeNull();
        expect(result.current.token).toBeNull();
    });

    it('sets signed-in state with user and token', async () => {
        const { result } = renderHook(() => useAuthStore());
        const mockUser = {
            id: 'user-001',
            displayName: 'Test User',
            email: 'test@example.com',
            tenantId: 'tenant-001',
        };
        const mockToken = 'mock-jwt-token';

        await act(async () => {
            await result.current.setSignedIn(mockUser, mockToken);
        });

        expect(result.current.isSignedIn).toBe(true);
        expect(result.current.user).toEqual(mockUser);
        expect(result.current.token).toEqual(mockToken);
        expect(SecureStore.setItemAsync).toHaveBeenCalledWith('auth_token', mockToken);
    });

    it('clears signed-in state on sign out', async () => {
        const { result } = renderHook(() => useAuthStore());
        const mockUser = {
            id: 'user-001',
            displayName: 'Test User',
            email: 'test@example.com',
            tenantId: 'tenant-001',
        };

        await act(async () => {
            await result.current.setSignedIn(mockUser, 'token');
            await result.current.setSignedOut();
        });

        expect(result.current.isSignedIn).toBe(false);
        expect(result.current.user).toBeNull();
        expect(result.current.token).toBeNull();
    });

    it('sets loading state', () => {
        const { result } = renderHook(() => useAuthStore());

        act(() => {
            result.current.setLoading(true);
        });

        expect(result.current.isLoading).toBe(true);

        act(() => {
            result.current.setLoading(false);
        });

        expect(result.current.isLoading).toBe(false);
    });

    it('sets error state', () => {
        const { result } = renderHook(() => useAuthStore());
        const error = { code: 'TEST_ERROR', message: 'Test error message' };

        act(() => {
            result.current.setError(error);
        });

        expect(result.current.error).toEqual(error);

        act(() => {
            result.current.setError(null);
        });

        expect(result.current.error).toBeNull();
    });

    it('restores session when token exists', async () => {
        (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('mock-token');
        const { result } = renderHook(() => useAuthStore());

        await act(async () => {
            await result.current.restoreSession();
        });

        expect(result.current.isSignedIn).toBe(true);
        expect(result.current.token).toBe('mock-token');
    });

    it('does not restore session when no token exists', async () => {
        (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
        const { result } = renderHook(() => useAuthStore());

        await act(async () => {
            await result.current.restoreSession();
        });

        expect(result.current.isSignedIn).toBe(false);
        expect(result.current.token).toBeNull();
    });
});
