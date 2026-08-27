import { cookieOptions } from '$lib/config';
import { Users, type User } from '$lib/models';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
    SESSION_COOKIE,
    SESSION_TTL_SECONDS,
    createSession,
    SESSION_TTL_MS,
} from '$lib/auth/session';
import { extractClientIp } from '$lib/auth/ip';
import { nanoid } from '$lib/util/client';
import type { User as AuthUser, UserRole } from '$lib/auth/types';

export const POST: RequestHandler = async ({ request, cookies, getClientAddress }) => {
    const [res, user] = await Users.createGuest();

    if (!('acknowledged' in res) || !res.acknowledged) {
        return json({ message: "创建游客账号失败" }, { status: 500 });
    }

    const sessionUser: Partial<User> = {
        id: user.id!,
        email: user.email!,
        name: user.name!,
        title: user.title,
        award: user.award,
        roles: user.roles,
        profile: user.profile,
        isGuest: true,
    };

    const sessionId = nanoid(32);
    const now = Date.now();
    const ip = extractClientIp(request.headers, getClientAddress());
    const userAgent = request.headers.get("user-agent") ?? undefined;

    await createSession(sessionId, {
        id: sessionId,
        user: sessionUser as unknown as AuthUser & { roles: UserRole[] },
        createdAt: now,
        lastSeenAt: now,
        expiresAt: now + SESSION_TTL_MS,
        ip,
        userAgent,
    });

    cookies.set(SESSION_COOKIE, sessionId, {
        ...cookieOptions,
        maxAge: SESSION_TTL_SECONDS,
    });

    return json(sessionUser);
};
