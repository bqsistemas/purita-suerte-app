import { ok, err, Result } from '../result';

describe('result helpers', () => {
    it('creates successful result with ok()', () => {
        const data = { id: '123', name: 'Test' };
        const result = ok(data);

        expect(result.success).toBe(true);
        expect(result.data).toEqual(data);
        expect(result.error).toBeUndefined();
    });

    it('creates failed result with err()', () => {
        const result = err('TEST_ERROR', 'Something went wrong', { foo: 'bar' });

        expect(result.success).toBe(false);
        expect(result.data).toBeUndefined();
        expect(result.error).toBeDefined();
        expect(result.error?.code).toBe('TEST_ERROR');
        expect(result.error?.message).toBe('Something went wrong');
        expect(result.error?.details).toEqual({ foo: 'bar' });
    });

    it('creates error result without details', () => {
        const result = err('TEST_ERROR', 'Something went wrong');

        expect(result.success).toBe(false);
        expect(result.error?.details).toBeUndefined();
    });

    it('maintains type safety for ok()', () => {
        interface User {
            id: string;
            name: string;
        }

        const user: User = { id: '1', name: 'John' };
        const result: Result<User> = ok(user);

        expect(result.success).toBe(true);
        expect(result.data?.name).toBe('John');
    });

    it('maintains type safety for err()', () => {
        interface User {
            id: string;
        }

        const result: Result<User> = err('NOT_FOUND', 'User not found');

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe('NOT_FOUND');
    });
});
