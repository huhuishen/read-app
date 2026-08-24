import { cookieOptions } from '$lib/config';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { SESSION_COOKIE, deleteSession } from '$lib/auth/session';

export const POST: RequestHandler = async ({ cookies }) => {
    const sessionId = cookies.get(SESSION_COOKIE);
    if (sessionId) {
        await deleteSession(sessionId);
    }
    cookies.delete(SESSION_COOKIE, cookieOptions);
    return json({}, { status: 200 });
};
