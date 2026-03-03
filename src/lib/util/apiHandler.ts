import { Users } from '$lib/models';
import type { Cookies } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

export function getUser(cookies: Cookies) {
    const token = cookies.get('token') || '';
    const user = Users.verifyToken(token);
    return user;
}

export class ApiError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}

export function apiError(status: number, message: string): never {
    throw new ApiError(status, message);
}

export function withApi<T extends (...args: any) => any>(handler: T): T {
    return (async (event: any) => {
        try {
            const user = getUser(event.cookies);
            event.locals.user = user;

            const result = await handler(event);

            if (result instanceof Response) {
                return result;
            }

            return json(result);
        } catch (err: any) {
            const status = Number(err?.status ?? 500);
            const message =
                err?.message ??
                err?.body?.message ??
                err?.body?.error ??
                'Server error';

            return json({ message }, { status });
        }
    }) as T;
}

export function requireUser(event: any) {
    if (!event.locals.user) {
        apiError(401, 'Unauthorized');
    }
    return event.locals.user;
}

export function requireRole(event: any, role: string) {
    const user = requireUser(event);

    if (!user.roles?.includes(role)) {
        apiError(403, 'Forbidden');
    }

    return user;
}
