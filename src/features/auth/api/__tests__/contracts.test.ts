import { mockLogin, LoginRequestSchema, LoginResponseSchema } from '../contracts';

describe('auth contracts', () => {
    describe('LoginRequestSchema', () => {
        it('validates valid email and password', () => {
            const result = LoginRequestSchema.safeParse({
                email: 'user@example.com',
                password: 'password123',
            });
            expect(result.success).toBe(true);
        });

        it('rejects invalid email', () => {
            const result = LoginRequestSchema.safeParse({
                email: 'invalid-email',
                password: 'password123',
            });
            expect(result.success).toBe(false);
        });

        it('rejects missing password', () => {
            const result = LoginRequestSchema.safeParse({
                email: 'user@example.com',
                password: '',
            });
            expect(result.success).toBe(false);
        });
    });

    describe('mockLogin', () => {
        it('returns success for valid user@example.com credentials', async () => {
            const result = await mockLogin({
                email: 'user@example.com',
                password: 'password123',
            });

            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
            expect(result.data?.token).toBeTruthy();
            expect(result.data?.user.id).toBe('user-001');
            expect(result.data?.user.displayName).toBe('Test User');
            expect(result.data?.user.email).toBe('user@example.com');
        });

        it('returns success for valid admin@example.com credentials', async () => {
            const result = await mockLogin({
                email: 'admin@example.com',
                password: 'admin123',
            });

            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
            expect(result.data?.user.id).toBe('user-002');
            expect(result.data?.user.displayName).toBe('Admin User');
        });

        it('returns error for invalid email', async () => {
            const result = await mockLogin({
                email: 'wrong@example.com',
                password: 'password123',
            });

            expect(result.success).toBe(false);
            expect(result.error?.code).toBe('INVALID_CREDENTIALS');
            expect(result.error?.message).toContain('Invalid');
        });

        it('returns error for invalid password', async () => {
            const result = await mockLogin({
                email: 'user@example.com',
                password: 'wrongpassword',
            });

            expect(result.success).toBe(false);
            expect(result.error?.code).toBe('INVALID_CREDENTIALS');
        });

        it('simulates network latency', async () => {
            const start = Date.now();
            await mockLogin({
                email: 'user@example.com',
                password: 'password123',
            });
            const duration = Date.now() - start;

            expect(duration).toBeGreaterThanOrEqual(500);
        });

        it('returns JWT-like token with correct structure', async () => {
            const result = await mockLogin({
                email: 'user@example.com',
                password: 'password123',
            });

            const token = result.data?.token;
            expect(token).toBeDefined();
            const parts = token!.split('.');
            expect(parts).toHaveLength(3);

            // Decode and verify payload contains expected claims
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
            expect(payload.email).toBe('user@example.com');
            expect(payload.userId).toBe('user-001');
            expect(payload.exp).toBeGreaterThan(payload.iat);
        });
    });

    describe('LoginResponseSchema', () => {
        it('validates successful response', () => {
            const result = LoginResponseSchema.safeParse({
                success: true,
                token: 'mock-token',
                user: {
                    id: 'user-001',
                    displayName: 'Test User',
                    email: 'user@example.com',
                    tenantId: 'tenant-001',
                },
            });
            expect(result.success).toBe(true);
        });

        it('validates error response', () => {
            const result = LoginResponseSchema.safeParse({
                success: false,
                error: {
                    code: 'INVALID_CREDENTIALS',
                    message: 'Invalid email or password',
                },
            });
            expect(result.success).toBe(true);
        });
    });
});
