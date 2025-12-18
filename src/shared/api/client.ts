import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { AppError, Result, err, ok } from '~/shared/types/result';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.puritasuerte.local';
const TOKEN_KEY = 'auth_token';
const REQUEST_TIMEOUT = 30000;

/**
 * Initialize Axios instance with base configuration, interceptors, and token refresh logic.
 */
function createApiClient(): AxiosInstance {
    const client = axios.create({
        baseURL: API_BASE_URL,
        timeout: REQUEST_TIMEOUT,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    // Request interceptor: attach Bearer token if available
    client.interceptors.request.use(
        async (config: InternalAxiosRequestConfig) => {
            const token = await SecureStore.getItemAsync(TOKEN_KEY);
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error: AxiosError) => Promise.reject(error)
    );

    // Response interceptor: handle errors consistently
    client.interceptors.response.use(
        (response) => response,
        (error: AxiosError) => {
            if (error.response?.status === 401) {
                // Token expired; clear and let UI redirect to login
                SecureStore.deleteItemAsync(TOKEN_KEY);
            }
            return Promise.reject(error);
        }
    );

    return client;
}

export const apiClient = createApiClient();

/**
 * Centralized error normalization from Axios errors to AppError.
 */
export function normalizeApiError(error: unknown): AppError {
    if (axios.isAxiosError(error)) {
        const status = error.response?.status || 0;
        const serverMessage = (error.response?.data as Record<string, unknown>)?.message as string || error.message;

        return {
            code: `HTTP_${status}`,
            message: serverMessage || 'An error occurred. Please try again.',
            details: { status, url: error.config?.url },
        };
    }

    if (error instanceof Error) {
        return {
            code: 'UNKNOWN_ERROR',
            message: error.message,
        };
    }

    return {
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred',
    };
}

/**
 * Safe API call wrapper that returns Result<T>.
 */
export async function apiCall<T>(
    fn: () => Promise<T>
): Promise<Result<T>> {
    try {
        const data = await fn();
        return ok(data);
    } catch (error) {
        const appError = normalizeApiError(error);
        return err(appError.code, appError.message, appError.details);
    }
}

/**
 * Store auth token in secure storage
 */
export async function storeAuthToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
}

/**
 * Retrieve auth token from secure storage
 */
export async function getAuthToken(): Promise<string | null> {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    return token || null;
}

/**
 * Clear auth token from secure storage
 */
export async function clearAuthToken(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
}
