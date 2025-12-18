/**
 * Standardized result object for all async operations.
 * Implements the Result pattern for error handling.
 */

export interface AppError {
    code: string;
    message: string;
    details?: unknown;
}

export interface Result<T> {
    success: boolean;
    data?: T;
    error?: AppError;
}

/**
 * Helper to create a successful result
 */
export function ok<T>(data: T): Result<T> {
    return { success: true, data };
}

/**
 * Helper to create a failed result
 */
export function err<T>(code: string, message: string, details?: unknown): Result<T> {
    return {
        success: false,
        error: { code, message, details },
    };
}
