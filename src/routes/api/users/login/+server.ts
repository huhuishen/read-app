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
    const req = await request.json();

    const email = req.email;
    const password = req.password;

    if (!email || !password) {
        return json({ message: "邮箱和密码是必填项" }, { status: 400 });
    }

    // 查找用户
    const user = await Users.findOne({ email }, { projection: { _id: 0 } });
    if (!user) {
        return json({ message: "邮箱或密码错误" }, { status: 400 });
    }

    // 验证密码
    const valid = await Users.verifyPassword(password, user.password);
    if (!valid) {
        return json({ message: "邮箱或密码错误" }, { status: 400 });
    }

    // if (!user.activated) {
    //     return json({ message: "请先激活邮箱" }, { status: 403 });
    // }

    // 构造返回给前端 / 存入 session 的 user 对象
    const sessionUser: Partial<User> = {
        id: user.id!.toString(),
        email: user.email,
        name: user.name,
        title: user.title,
        award: user.award,
        roles: user.roles,
        profile: user.profile,
    };

    // 生成 sessionId 并创建会话（存入存储时转换为 auth/types 的 User 结构）
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

    // 更新最后登录时间
    // await Users.updateLastLogin(user.id!);

    // 设置 cookie：session_id
    cookies.set(SESSION_COOKIE, sessionId, {
        ...cookieOptions,
        maxAge: SESSION_TTL_SECONDS,
    });

    return json(sessionUser);
};