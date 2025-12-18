import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

jest.mock('expo-secure-store');

// Mock axios to prevent issues with interceptors during client creation
jest.mock('axios', () => ({
    create: jest.fn(() => ({
        interceptors: {
            request: { use: jest.fn() },
            response: { use: jest.fn() },
        },
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
    })),
    isAxiosError: jest.fn((e) => e instanceof Error && 'response' in e),
    AxiosError: class AxiosError extends Error {
        constructor(message?: string, code?: string) {
            super(message);
            this.code = code;
        }
        code?: string;
        response?: any;
        config?: any;
    },
}));

import { normalizeApiError, apiCall, storeAuthToken, getAuthToken, clearAuthToken } from '../client';

describe('API client', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('normalizeApiError', () => {
        it('normalizes Axios error with response', () => {
            const error = new axios.AxiosError('Request failed', '400');
            error.response = {
                status: 400,
                data: { message: 'Bad request' },
                headers: {},
                statusText: 'Bad Request',
                config: undefined as any,
            };
            error.config = { url: '/test' } as any;

            const result = normalizeApiError(error);

            expect(result.code).toBe('HTTP_400');
            expect(result.message).toBe('Bad request');
            expect(result.details).toEqual({ status: 400, url: '/test' });
        });

        it('normalizes Axios error without response', () => {
            const error = new Error('Network error');
            (error as any).code = 'ECONNREFUSED';

            const result = normalizeApiError(error);

            expect(result.message).toBeTruthy();
        });

        it('normalizes generic Error', () => {
            const error = new Error('Something went wrong');

            const result = normalizeApiError(error);

            expect(result.code).toBe('UNKNOWN_ERROR');
            expect(result.message).toBe('Something went wrong');
        });

        it('normalizes unknown error', () => {
            const result = normalizeApiError('unknown');

            expect(result.code).toBe('UNKNOWN_ERROR');
            expect(result.message).toBe('An unexpected error occurred');
        });
    });

    describe('apiCall', () => {
        it('wraps successful function call in Result', async () => {
            const fn = jest.fn().mockResolvedValue({ id: '123' });

            const result = await apiCall(fn);

            expect(result.success).toBe(true);
            expect(result.data).toEqual({ id: '123' });
            expect(result.error).toBeUndefined();
        });

        it('wraps error in Result', async () => {
            const fn = jest.fn().mockRejectedValue(new Error('Request failed'));

            const result = await apiCall(fn);

            expect(result.success).toBe(false);
            expect(result.data).toBeUndefined();
            expect(result.error).toBeDefined();
            expect(result.error?.code).toBe('UNKNOWN_ERROR');
        });
    });

    describe('token storage', () => {
        it('stores auth token in secure storage', async () => {
            (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);

            await storeAuthToken('test-token');

            expect(SecureStore.setItemAsync).toHaveBeenCalledWith('auth_token', 'test-token');
        });

        it('retrieves auth token from secure storage', async () => {
            (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('test-token');

            const token = await getAuthToken();

            expect(token).toBe('test-token');
            expect(SecureStore.getItemAsync).toHaveBeenCalledWith('auth_token');
        });

        it('returns null when token not found', async () => {
            (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

            const token = await getAuthToken();

            expect(token).toBeNull();
        });

        it('clears auth token from secure storage', async () => {
            (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

            await clearAuthToken();

            expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('auth_token');
        });
    });
});
