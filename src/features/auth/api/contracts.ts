import { z } from 'zod';
import { fromByteArray } from 'base64-js';
import { Result, ok, err } from '~/shared/types/result';
import { User } from '../model/types';

/**
 * Zod schema for login request validation.
 */
export const LoginRequestSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

/**
 * Zod schema for login response validation.
 */
export const LoginResponseSchema = z.object({
    success: z.boolean(),
    token: z.string().optional(),
    user: z.object({
        id: z.string(),
        displayName: z.string(),
        email: z.string().email(),
        tenantId: z.string(),
    }).optional(),
    error: z.object({
        code: z.string(),
        message: z.string(),
    }).optional(),
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;

/**
 * Mock users for development/testing.
 * In production, this would be replaced with a real API call.
 */
const MOCK_USERS = {
    'user@example.com': {
        password: 'password123',
        user: {
            id: 'user-001',
            displayName: 'Test User',
            email: 'user@example.com',
            tenantId: 'tenant-001',
        },
    },
    'admin@example.com': {
        password: 'admin123',
        user: {
            id: 'user-002',
            displayName: 'Admin User',
            email: 'admin@example.com',
            tenantId: 'tenant-002',
        },
    },
};

/**
 * Helper function to encode strings to base64.
 */
function encodeBase64(str: string): string {
    const bytes = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
        bytes[i] = str.charCodeAt(i);
    }
    return fromByteArray(bytes);
}

/**
 * Mock JWT token generator (for development only).
 * Replaces with real JWT from backend in production.
 */
function generateMockToken(email: string, userId: string): string {
    const header = encodeBase64(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = encodeBase64(
        JSON.stringify({
            email,
            userId,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 86400, // 24 hours
        })
    );
    const signature = encodeBase64('mock-signature');
    return `${header}.${payload}.${signature}`;
}

/**
 * Mock login endpoint.
 * Simulates backend authentication with deterministic responses.
 * Replaces with real API call: `apiClient.post('/auth/login', request)`
 */
export async function mockLogin(request: LoginRequest): Promise<Result<{ token: string; user: User }>> {
    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 500));

    const mockUser = MOCK_USERS[request.email as keyof typeof MOCK_USERS];

    if (!mockUser || mockUser.password !== request.password) {
        return err(
            'INVALID_CREDENTIALS',
            'Invalid email or password'
        );
    }

    const token = generateMockToken(mockUser.user.email, mockUser.user.id);

    return ok({
        token,
        user: mockUser.user,
    });
}

/**
 * Validate login response against schema.
 */
export function validateLoginResponse(data: unknown): LoginResponse {
    return LoginResponseSchema.parse(data);
}
